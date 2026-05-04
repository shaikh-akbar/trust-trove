import "server-only";

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  const appName = process.env.AUTH_APP_NAME ?? "TrustTrove";

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

  return sendEmail({
    to: email,
    subject: subjectLine || `${appName} order update: ${orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p>Hi ${greetingName},</p>
        <p>Your order <strong>${orderNumber}</strong> has been updated.</p>
        <div style="margin:16px 0;padding:16px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc">
          <p style="margin:0 0 8px"><strong>Status:</strong> ${String(status || "pending").replace(/_/g, " ")}</p>
          <p style="margin:0 0 8px"><strong>Fulfillment:</strong> ${String(fulfillmentStatus || "unfulfilled").replace(/_/g, " ")}</p>
          <p style="margin:0 0 8px"><strong>Payment Type:</strong> ${paymentType || "online"}</p>
          <p style="margin:0"><strong>Total:</strong> ${formatPrice(totalAmount)}</p>
        </div>
        <p>Thank you for shopping with ${appName}.</p>
      </div>
    `,
  });
}
