import "server-only";
import { getSupabaseAdmin } from "./supabase-admin";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeNullableText(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeCategory(value) {
  return normalizeText(value).toLowerCase() || "general";
}

function normalizePriority(value) {
  const normalized = normalizeText(value).toLowerCase() || "medium";
  if (!["low", "medium", "high"].includes(normalized)) {
    throw new Error("Invalid priority.");
  }
  return normalized;
}

function normalizeStatus(value) {
  const normalized = normalizeText(value).toLowerCase() || "open";
  if (!["open", "in_progress", "resolved", "closed"].includes(normalized)) {
    throw new Error("Invalid ticket status.");
  }
  return normalized;
}

function generateTicketNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TTK-${datePart}-${randomPart}`;
}

function formatTicket(ticket) {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticket_number,
    userId: ticket.user_id,
    orderId: ticket.order_id || "",
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    message: ticket.message,
    adminNotes: ticket.admin_notes || "",
    resolvedAt: ticket.resolved_at || "",
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    user: ticket.users
      ? {
          firstName: ticket.users.first_name || "",
          lastName: ticket.users.last_name || "",
          email: ticket.users.email || "",
        }
      : null,
    order: ticket.orders
      ? {
          orderNumber: ticket.orders.order_number || "",
          totalAmount: ticket.orders.total_amount || 0,
          status: ticket.orders.status || "",
        }
      : null,
    messages: Array.isArray(ticket.support_ticket_messages)
      ? ticket.support_ticket_messages.map((item) => ({
          id: item.id,
          message: item.message,
          senderRole: item.sender_role,
          senderUserId: item.sender_user_id || "",
          createdAt: item.created_at,
        }))
      : [],
  };
}

function validateTicketInput(payload) {
  const subject = normalizeText(payload?.subject);
  const message = normalizeText(payload?.message);

  if (!subject) {
    throw new Error("Subject is required.");
  }

  if (!message) {
    throw new Error("Message is required.");
  }

  return {
    orderId: normalizeNullableText(payload?.orderId),
    subject,
    category: normalizeCategory(payload?.category),
    priority: normalizePriority(payload?.priority),
    message,
  };
}

export async function getTicketsForUser(userId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("support_tickets")
    .select(`
      *,
      orders (
        order_number,
        total_amount,
        status
      ),
      support_ticket_messages (
        id,
        message,
        sender_role,
        sender_user_id,
        created_at
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(formatTicket);
}

export async function createTicketForUser(userId, payload) {
  const supabase = getSupabaseAdmin();
  const data = validateTicketInput(payload);
  const ticketNumber = generateTicketNumber();

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      ticket_number: ticketNumber,
      user_id: userId,
      order_id: data.orderId,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      message: data.message,
      status: "open",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: messageError } = await supabase
    .from("support_ticket_messages")
    .insert({
      ticket_id: ticket.id,
      sender_user_id: userId,
      sender_role: "customer",
      message: data.message,
    });

  if (messageError) {
    throw new Error(messageError.message);
  }

  const created = await getTicketByIdForUser(userId, ticket.id);
  return created;
}

export async function getTicketByIdForUser(userId, ticketId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("support_tickets")
    .select(`
      *,
      orders (
        order_number,
        total_amount,
        status
      ),
      support_ticket_messages (
        id,
        message,
        sender_role,
        sender_user_id,
        created_at
      )
    `)
    .eq("id", ticketId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Ticket not found.");
  }

  return formatTicket(data);
}

export async function addCustomerTicketReply(userId, ticketId, message) {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    throw new Error("Reply message is required.");
  }

  await getTicketByIdForUser(userId, ticketId);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("support_ticket_messages")
    .insert({
      ticket_id: ticketId,
      sender_user_id: userId,
      sender_role: "customer",
      message: normalizedMessage,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { error: updateError } = await supabase
    .from("support_tickets")
    .update({
      status: "open",
    })
    .eq("id", ticketId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return getTicketByIdForUser(userId, ticketId);
}

export async function getAdminTickets() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("support_tickets")
    .select(`
      *,
      users (
        first_name,
        last_name,
        email
      ),
      orders (
        order_number,
        total_amount,
        status
      ),
      support_ticket_messages (
        id,
        message,
        sender_role,
        sender_user_id,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(formatTicket);
}

export async function updateAdminTicket(ticketId, payload) {
  const supabase = getSupabaseAdmin();
  const nextStatus = normalizeStatus(payload?.status);
  const adminNotes = normalizeNullableText(payload?.adminNotes);
  const nextValues = {
    status: nextStatus,
    admin_notes: adminNotes,
    resolved_at: nextStatus === "resolved" || nextStatus === "closed" ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from("support_tickets")
    .update(nextValues)
    .eq("id", ticketId);

  if (error) {
    throw new Error(error.message);
  }

  return getAdminTicketById(ticketId);
}

export async function addAdminTicketReply(adminUserId, ticketId, message) {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    throw new Error("Reply message is required.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("support_ticket_messages")
    .insert({
      ticket_id: ticketId,
      sender_user_id: adminUserId,
      sender_role: "admin",
      message: normalizedMessage,
    });

  if (error) {
    throw new Error(error.message);
  }

  return getAdminTicketById(ticketId);
}

export async function getAdminTicketById(ticketId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("support_tickets")
    .select(`
      *,
      users (
        first_name,
        last_name,
        email
      ),
      orders (
        order_number,
        total_amount,
        status
      ),
      support_ticket_messages (
        id,
        message,
        sender_role,
        sender_user_id,
        created_at
      )
    `)
    .eq("id", ticketId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Ticket not found.");
  }

  return formatTicket(data);
}
