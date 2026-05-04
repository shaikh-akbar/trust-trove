import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser } from "./auth/session";
import { getSupabaseAdmin } from "./supabase-admin";
import { isAdminEmail } from "./admin-access";

export async function requireAdminUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin?redirectTo=/admin");
  }

  const isAdmin = Boolean(user.isAdmin) || isAdminEmail(user.email);

  if (!isAdmin) {
    redirect("/");
  }

  return user;
}

function formatCurrency(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function normalizeDateInput(value) {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    throw new Error("Invalid date filter.");
  }

  return normalizedValue;
}

export async function getAdminDashboardData() {
  const supabase = getSupabaseAdmin();

  const [
    { count: totalOrders, error: totalOrdersError },
    { count: pendingOrders, error: pendingOrdersError },
    { count: codOrders, error: codOrdersError },
    { count: totalCustomers, error: totalCustomersError },
    { data: revenueOrders, error: revenueOrdersError },
    { data: profitOrders, error: profitOrdersError },
    { data: recentOrders, error: recentOrdersError },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["payment_pending", "placed"]),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("payment_type", "cod"),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, total_amount")
      .not("status", "eq", "cancelled"),
    supabase
      .from("order_items")
      .select("quantity, unit_price, product_snapshot")
      .not("order_id", "is", null),
    supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        payment_status,
        payment_type,
        fulfillment_status,
        total_amount,
        created_at,
        users (
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  for (const error of [
    totalOrdersError,
    pendingOrdersError,
    codOrdersError,
    totalCustomersError,
    revenueOrdersError,
    profitOrdersError,
    recentOrdersError,
  ]) {
    if (error) {
      throw new Error(error.message);
    }
  }

  const totalRevenue = formatCurrency(
    (revenueOrders || []).reduce((total, order) => total + Number(order.total_amount || 0), 0)
  );
  const totalProfit = formatCurrency(
    (profitOrders || []).reduce((total, item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unit_price || 0);
      const costPrice = Number(item.product_snapshot?.cost_price || item.product_snapshot?.variant?.cost_price || 0);

      return total + Math.max(0, unitPrice - costPrice) * quantity;
    }, 0)
  );

  return {
    metrics: [
      {
        id: "orders",
        label: "Total Orders",
        value: totalOrders || 0,
        tone: "navy",
      },
      {
        id: "pending",
        label: "Active Pipeline",
        value: pendingOrders || 0,
        tone: "gold",
      },
      {
        id: "cod",
        label: "COD Orders",
        value: codOrders || 0,
        tone: "slate",
      },
      {
        id: "revenue",
        label: "Total Revenue",
        value: totalRevenue,
        tone: "emerald",
      },
      {
        id: "profit",
        label: "Total Profit",
        value: totalProfit,
        tone: "gold",
      },
    ],
    secondaryMetrics: [
      {
        id: "customers",
        label: "Customers",
        value: totalCustomers || 0,
      },
    ],
    revenuePreview: totalRevenue,
    totalProfit,
    recentOrders: recentOrders || [],
  };
}

export async function getAdminOrders(filters = {}) {
  const supabase = getSupabaseAdmin();
  const startDate = normalizeDateInput(filters.startDate);
  const endDate = normalizeDateInput(filters.endDate);

  let query = supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      payment_status,
      payment_type,
      fulfillment_status,
      subtotal,
      discount_amount,
      shipping_amount,
      cod_charge_amount,
      platform_fee_amount,
      convenience_fee_amount,
      total_amount,
      created_at,
      users (
        first_name,
        last_name,
        email
      ),
      order_items (
        id,
        title,
        quantity,
        line_total
      )
    `)
    .order("created_at", { ascending: false });

  if (startDate) {
    query = query.gte("created_at", `${startDate}T00:00:00.000Z`);
  }

  if (endDate) {
    query = query.lte("created_at", `${endDate}T23:59:59.999Z`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getAdminCustomers() {
  const supabase = getSupabaseAdmin();
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, phone, city, created_at")
    .order("created_at", { ascending: false });

  if (usersError) {
    throw new Error(usersError.message);
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, user_id, total_amount, created_at");

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  const { data: tickets, error: ticketsError } = await supabase
    .from("support_tickets")
    .select("id, user_id, status, created_at");

  if (ticketsError) {
    throw new Error(ticketsError.message);
  }

  return (users || []).map((user) => {
    const customerOrders = (orders || []).filter((order) => order.user_id === user.id);
    const customerTickets = (tickets || []).filter((ticket) => ticket.user_id === user.id);
    const totalSpent = customerOrders.reduce((total, order) => total + Number(order.total_amount || 0), 0);

    return {
      id: user.id,
      fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
      email: user.email || "",
      phone: user.phone || "",
      city: user.city || "",
      createdAt: user.created_at || "",
      totalOrders: customerOrders.length,
      totalTickets: customerTickets.length,
      openTickets: customerTickets.filter((ticket) => ["open", "in_progress"].includes(ticket.status)).length,
      totalSpent,
      lastOrderAt: customerOrders[0]?.created_at || "",
    };
  });
}
