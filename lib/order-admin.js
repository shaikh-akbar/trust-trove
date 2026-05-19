import "server-only";
import { getSupabaseAdmin } from "./supabase-admin";
import { sendOrderUpdateEmail } from "./auth/mail";
import { restoreInventoryForItems } from "./inventory-server";

function normalizeText(value) {
  return String(value ?? "").trim();
}

const ALLOWED_ORDER_STATUSES = [
  "payment_pending",
  "placed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const ALLOWED_FULFILLMENT_STATUSES = [
  "unfulfilled",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

const ALLOWED_PAYMENT_STATUSES = [
  "pending",
  "authorized",
  "captured",
  "failed",
  "refunded",
];

function validateValue(value, allowedValues, fieldName) {
  const normalizedValue = normalizeText(value).toLowerCase();

  if (!allowedValues.includes(normalizedValue)) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return normalizedValue;
}

export async function updateOrderAdminStatus(orderId, payload) {
  const supabase = getSupabaseAdmin();
  const status = validateValue(payload?.status, ALLOWED_ORDER_STATUSES, "order status");
  const fulfillmentStatus = validateValue(
    payload?.fulfillmentStatus,
    ALLOWED_FULFILLMENT_STATUSES,
    "fulfillment status"
  );
  const paymentStatus = validateValue(payload?.paymentStatus, ALLOWED_PAYMENT_STATUSES, "payment status");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      user_id,
      total_amount,
      payment_type,
      paid_at,
      status,
      fulfillment_status,
      payment_status,
      order_items (
        variant_id,
        quantity,
        title
      )
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    throw new Error(orderError.message);
  }

  if (!order) {
    throw new Error("Order not found.");
  }

  const shouldRestoreInventory =
    status === "cancelled" &&
    order.status !== "cancelled" &&
    Array.isArray(order.order_items) &&
    order.order_items.length > 0;

  if (shouldRestoreInventory) {
    await restoreInventoryForItems(
      order.order_items.map((item) => ({
        variantId: item.variant_id,
        quantity: item.quantity,
        title: item.title,
      }))
    );
  }

  const updates = {
    status,
    fulfillment_status: fulfillmentStatus,
    payment_status: paymentStatus,
  };

  if ((paymentStatus === "captured" || paymentStatus === "authorized") && !order.paid_at) {
    updates.paid_at = new Date().toISOString();
  }

  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select(`
      id,
      order_number,
      total_amount,
      payment_type,
      status,
      fulfillment_status,
      payment_status,
      address_snapshot,
      users (
        first_name,
        email
      )
    `)
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  const recipientEmail = normalizeText(updated?.address_snapshot?.email) || normalizeText(updated?.users?.email);
  const recipientName = normalizeText(updated?.address_snapshot?.fullName) || normalizeText(updated?.users?.first_name);
  let emailStatus = {
    state: "skipped",
    message: "No recipient email available for this order.",
  };

  if (recipientEmail) {
    try {
      const emailResult = await sendOrderUpdateEmail({
        email: recipientEmail,
        firstName: recipientName,
        orderNumber: updated.order_number,
        totalAmount: updated.total_amount,
        paymentType: updated.payment_type,
        status: updated.status,
        fulfillmentStatus: updated.fulfillment_status,
        subjectLine: `GoModexa order status updated: ${updated.order_number}`,
      });

      emailStatus = emailResult?.skipped
        ? {
            state: "skipped",
            message: "Email delivery is not configured on the server.",
          }
        : {
            state: "sent",
            message: `Status email sent to ${recipientEmail}.`,
          };
    } catch (error) {
      console.error("Failed to send order status email:", error);
      emailStatus = {
        state: "failed",
        message: error.message,
      };
    }
  }

  return {
    ...updated,
    email_status: emailStatus,
  };
}

export const ADMIN_ORDER_STATUS_OPTIONS = ALLOWED_ORDER_STATUSES;
export const ADMIN_FULFILLMENT_STATUS_OPTIONS = ALLOWED_FULFILLMENT_STATUSES;
export const ADMIN_PAYMENT_STATUS_OPTIONS = ALLOWED_PAYMENT_STATUSES;

