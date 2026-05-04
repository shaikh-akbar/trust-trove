import "server-only";
import { getSupabaseAdmin } from "./supabase-admin";
import { getOrdersForUser, getUserAddresses } from "./checkout-server";

function normalizeName(user) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
}

function isDeliveredOrder(order) {
  return String(order.fulfillment_status || "").toLowerCase() === "delivered";
}

function isCancelledOrder(order) {
  return String(order.status || "").toLowerCase() === "cancelled";
}

function isPendingOrder(order) {
  const status = String(order.status || "").toLowerCase();
  const fulfillment = String(order.fulfillment_status || "").toLowerCase();
  return !isCancelledOrder(order) && !isDeliveredOrder(order) && (status === "payment_pending" || fulfillment !== "delivered");
}

export async function getAccountProfile(userId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, phone, city, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("User profile not found.");
  }

  return {
    id: data.id,
    firstName: data.first_name || "",
    lastName: data.last_name || "",
    fullName: normalizeName(data),
    email: data.email || "",
    phone: data.phone || "",
    city: data.city || "",
    createdAt: data.created_at || "",
  };
}

export async function getAccountDashboardData(userId) {
  const [profile, orders, addresses] = await Promise.all([
    getAccountProfile(userId),
    getOrdersForUser(userId),
    getUserAddresses(userId),
  ]);

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(isPendingOrder).length,
    deliveredOrders: orders.filter(isDeliveredOrder).length,
    cancelledOrders: orders.filter(isCancelledOrder).length,
    savedAddresses: addresses.length,
  };

  return {
    profile,
    orders,
    addresses,
    stats,
  };
}
