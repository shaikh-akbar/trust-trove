import "server-only";

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  const configuredAppName = String(process.env.AUTH_APP_NAME || "").trim();
  const appName =
    !configuredAppName || configuredAppName.toLowerCase() === "trusttrove"
      ? "GoModexa"
      : configuredAppName;

  return {
    apiKey,
    from,
    appName,
  };
}

async function sendEmail({ to, subject, html, requireConfig = false }) {
  const { apiKey, from } = getEmailConfig();

  if (!apiKey || !from) {
    if (requireConfig) {
      throw new Error(
        "Email is not configured. Add RESEND_API_KEY and AUTH_EMAIL_FROM to send emails.",
      );
    }

    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to send email: ${body}`);
  }

  return { success: true };
}

export async function sendPasswordResetOtp({ email, firstName, otp }) {
  const { appName } = getEmailConfig();

  const greetingName = firstName?.trim() || "there";
  await sendEmail({
    to: email,
    subject: `${appName} password reset OTP`,
    requireConfig: true,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p>Hi ${greetingName},</p>
        <p>Use the OTP below to reset your ${appName} password:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p>
        <p>This OTP expires in 10 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}

function formatPrice(value) {
  return `Rs. ${Number(value || 0)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatLabel(value, fallback) {
  const normalizedValue = String(value || fallback || "").trim();
  return normalizedValue ? normalizedValue.replace(/_/g, " ") : fallback;
}

const ORDER_PROGRESS_STEPS = [
  { key: "placed", label: "Placed", color: "#8b5cf6" },
  { key: "processing", label: "In Progress", color: "#f59e0b" },
  { key: "shipped", label: "Shipped", color: "#0ea5e9" },
  { key: "out_for_delivery", label: "Out for Delivery", color: "#2563eb" },
  { key: "delivered", label: "Delivered", color: "#10b981" },
  { key: "cancelled", label: "Cancelled", color: "#ef4444" },
];

function getOrderProgressKey(status, fulfillmentStatus) {
  const orderStatus = String(status || "").trim().toLowerCase();
  const fulfillment = String(fulfillmentStatus || "").trim().toLowerCase();

  if (orderStatus === "cancelled" || fulfillment === "cancelled") {
    return "cancelled";
  }

  if (orderStatus === "delivered" || fulfillment === "delivered") {
    return "delivered";
  }

  if (orderStatus === "out_for_delivery") {
    return "out_for_delivery";
  }

  if (orderStatus === "shipped" || fulfillment === "shipped") {
    return "shipped";
  }

  if (orderStatus === "processing" || fulfillment === "processing" || fulfillment === "packed") {
    return "processing";
  }

  return "placed";
}

function buildOrderProgressMarkup(status, fulfillmentStatus) {
  const currentStepKey = getOrderProgressKey(status, fulfillmentStatus);
  const currentIndex = ORDER_PROGRESS_STEPS.findIndex((step) => step.key === currentStepKey);
  const isCancelled = currentStepKey === "cancelled";

  return ORDER_PROGRESS_STEPS.map((step, index) => {
    const isCurrent = step.key === currentStepKey;
    const isCompleted = !isCancelled && currentIndex > index;
    const backgroundColor = isCurrent ? step.color : isCompleted ? `${step.color}18` : "#f8fafc";
    const textColor = isCurrent ? "#ffffff" : isCompleted ? step.color : "#64748b";
    const borderColor = isCurrent ? step.color : isCompleted ? `${step.color}66` : "#dbe3f0";
    const fontWeight = isCurrent || isCompleted ? "700" : "600";

    return `
      <td align="center" style="padding:0 4px 0;vertical-align:top;">
        <div style="margin:0 auto 10px;height:44px;width:44px;border-radius:999px;border:1px solid ${borderColor};background:${backgroundColor};color:${textColor};font-size:13px;font-weight:800;line-height:42px;text-align:center;">
          ${index + 1}
        </div>
        <div style="font-size:12px;line-height:18px;color:${textColor};font-weight:${fontWeight};">${escapeHtml(step.label)}</div>
      </td>
    `;
  }).join("");
}

export async function sendOrderUpdateEmail({
  email,
  firstName,
  orderNumber,
  totalAmount,
  paymentType,
  status,
  fulfillmentStatus,
  subjectLine,
}) {
  const { appName } = getEmailConfig();
  const greetingName = firstName?.trim() || "there";
  const orderStatusLabel = formatLabel(status, "placed");
  const fulfillmentLabel = formatLabel(fulfillmentStatus, "unfulfilled");
  const paymentLabel = formatLabel(paymentType, "online");
  const progressMarkup = buildOrderProgressMarkup(status, fulfillmentStatus);

  return sendEmail({
    to: email,
    subject: subjectLine || `${appName} order update: ${orderNumber}`,
    html: `
      <div style="margin:0;padding:24px 12px;background:#eef4ff;font-family:Arial,sans-serif;color:#0f172a;">
        <div style="max-width:720px;margin:0 auto;overflow:hidden;border:1px solid #d8e3f3;border-radius:28px;background:#ffffff;box-shadow:0 20px 60px rgba(15,23,42,0.08);">
          <div style="padding:28px 32px;background:linear-gradient(135deg,#161f66 0%,#283593 55%,#dcc27a 140%);color:#ffffff;">
            <div style="display:inline-block;padding:7px 14px;border:1px solid rgba(255,255,255,0.22);border-radius:999px;background:rgba(255,255,255,0.12);font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
              ${escapeHtml(appName)} Order Update
            </div>
            <h1 style="margin:18px 0 8px;font-size:28px;line-height:34px;font-weight:800;">Your order is now ${escapeHtml(orderStatusLabel)}.</h1>
            <p style="margin:0;font-size:14px;line-height:22px;color:rgba(255,255,255,0.82);">
              Order <strong>${escapeHtml(orderNumber)}</strong> is being tracked in real time for you.
            </p>
          </div>

          <div style="padding:28px 32px 10px;">
            <p style="margin:0 0 8px;font-size:16px;line-height:26px;">Hi ${escapeHtml(greetingName)},</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:25px;color:#475569;">
              Here is the latest status for your GoModexa order. The active stage is highlighted below so you can quickly see where things stand.
            </p>

            <div style="display:inline-block;margin:0 0 22px;padding:10px 16px;border-radius:999px;background:#eef2ff;color:#161f66;font-size:13px;font-weight:800;">
              Current status: ${escapeHtml(orderStatusLabel)}
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;border-collapse:collapse;">
              <tr>
                ${progressMarkup}
              </tr>
            </table>

            <div style="margin:0 0 24px;padding:18px;border:1px solid #dbe4f0;border-radius:20px;background:linear-gradient(180deg,#fbfdff 0%,#f5f8ff 100%);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:0 0 12px;font-size:13px;color:#64748b;">Order number</td>
                  <td align="right" style="padding:0 0 12px;font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(orderNumber)}</td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px;font-size:13px;color:#64748b;">Fulfillment</td>
                  <td align="right" style="padding:0 0 12px;font-size:14px;font-weight:700;color:#0f172a;text-transform:capitalize;">${escapeHtml(fulfillmentLabel)}</td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px;font-size:13px;color:#64748b;">Payment type</td>
                  <td align="right" style="padding:0 0 12px;font-size:14px;font-weight:700;color:#0f172a;text-transform:capitalize;">${escapeHtml(paymentLabel)}</td>
                </tr>
                <tr>
                  <td style="padding:0;font-size:13px;color:#64748b;">Order total</td>
                  <td align="right" style="padding:0;font-size:18px;font-weight:800;color:#161f66;">${escapeHtml(formatPrice(totalAmount))}</td>
                </tr>
              </table>
            </div>

            <p style="margin:0 0 22px;font-size:14px;line-height:23px;color:#475569;">
              You can also review this progress anytime from the <strong>My Orders</strong> section in your account.
            </p>
          </div>

          <div style="padding:20px 32px 28px;border-top:1px solid #e2e8f0;background:#fcfdff;">
            <p style="margin:0;font-size:13px;line-height:22px;color:#64748b;">
              Thank you for shopping with ${escapeHtml(appName)}.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}

