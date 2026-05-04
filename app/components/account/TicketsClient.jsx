"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, SendHorizonal } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "order", label: "Order" },
  { value: "delivery", label: "Delivery" },
  { value: "payment", label: "Payment" },
  { value: "return", label: "Return" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClassName(status) {
  if (status === "resolved" || status === "closed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "in_progress") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function priorityClassName(priority) {
  if (priority === "high") {
    return "text-rose-600";
  }

  if (priority === "medium") {
    return "text-amber-600";
  }

  return "text-emerald-600";
}

function EmptyState({ onCreate }) {
  return (
    <section className="rounded-[1.8rem] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-8 text-center">
      <p className="text-lg font-black tracking-tight text-slate-950">No support tickets yet</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Raise a ticket for order issues, delivery concerns, payment questions, or anything else you want admin to review.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#161f66] px-5 py-3 text-sm font-bold text-white hover:bg-[#111952]"
      >
        <Plus size={16} />
        Raise Ticket
      </button>
    </section>
  );
}

function CreateTicketModal({ open, form, saving, errorMessage, orders, onClose, onChange, onSubmit }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-full w-full items-start justify-center sm:items-center">
        <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[1.6rem] border border-white/20 bg-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] sm:rounded-[2rem] md:max-h-[88vh]">
          <div className="shrink-0 bg-[linear-gradient(135deg,#161f66_0%,#27318e_55%,#dcb86a_150%)] px-5 py-4 text-white sm:px-7 sm:py-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">Support Desk</p>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] sm:text-2xl">Raise a new ticket</h2>
            <p className="mt-2 text-sm text-white/80">Share the issue clearly so admin can act faster.</p>
          </div>

          <form onSubmit={onSubmit} className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Subject</span>
                <input
                  value={form.subject}
                  onChange={(event) => onChange("subject", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#161f66] focus:bg-white"
                  placeholder="Briefly describe the issue"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Category</span>
                <select
                  value={form.category}
                  onChange={(event) => onChange("category", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#161f66] focus:bg-white"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Priority</span>
                <select
                  value={form.priority}
                  onChange={(event) => onChange("priority", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#161f66] focus:bg-white"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Related order</span>
                <select
                  value={form.orderId}
                  onChange={(event) => onChange("orderId", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#161f66] focus:bg-white"
                >
                  <option value="">No specific order</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.order_number}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Message</span>
                <textarea
                  value={form.message}
                  onChange={(event) => onChange("message", event.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#161f66] focus:bg-white"
                  placeholder="Explain the problem in detail"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-full bg-[#161f66] px-5 py-3 text-sm font-bold text-white hover:bg-[#111952] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <LoaderCircle size={16} className="mr-2 animate-spin" /> : null}
                Submit ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TicketsClient({ initialTickets, orders }) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [openTicketId, setOpenTicketId] = useState(initialTickets[0]?.id || "");
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [replyingId, setReplyingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [form, setForm] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    orderId: "",
    message: "",
  });

  const openTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === openTicketId) || tickets[0] || null,
    [openTicketId, tickets]
  );

  function refreshRoute() {
    startTransition(() => {
      router.refresh();
    });
  }

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCreateTicket(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create ticket.");
      }

      setTickets((current) => [data.ticket, ...current]);
      setOpenTicketId(data.ticket.id);
      setCreateOpen(false);
      setForm({
        subject: "",
        category: "general",
        priority: "medium",
        orderId: "",
        message: "",
      });
      refreshRoute();
    } catch (error) {
      setErrorMessage(error.message || "Failed to create ticket.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReply(ticketId) {
    const message = String(replyDrafts[ticketId] || "").trim();

    if (!message) {
      return;
    }

    setReplyingId(ticketId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send reply.");
      }

      setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? data.ticket : ticket)));
      setReplyDrafts((current) => ({ ...current, [ticketId]: "" }));
      refreshRoute();
    } catch (error) {
      setErrorMessage(error.message || "Failed to send reply.");
    } finally {
      setReplyingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#161f66] px-5 py-3 text-sm font-bold text-white hover:bg-[#111952]"
        >
          <Plus size={16} />
          Raise Ticket
        </button>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {tickets.length ? (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setOpenTicketId(ticket.id)}
                className={`w-full rounded-[1.6rem] border p-5 text-left shadow-[0_18px_45px_-42px_rgba(22,31,102,0.42)] transition ${
                  openTicket?.id === ticket.id
                    ? "border-[#161f66] bg-[linear-gradient(180deg,#ffffff_0%,#f5f8ff_100%)]"
                    : "border-[var(--line)] bg-white hover:border-[#161f66]/40"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClassName(ticket.status)}`}>
                    {ticket.status.replace(/_/g, " ")}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-[0.18em] ${priorityClassName(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-slate-400">{ticket.ticketNumber}</p>
                <h3 className="mt-2 text-lg font-black tracking-tight text-slate-950">{ticket.subject}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{ticket.message}</p>
                <p className="mt-3 text-xs text-slate-400">{formatDate(ticket.createdAt)}</p>
              </button>
            ))}
          </div>

          {openTicket ? (
            <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-4 shadow-[0_22px_55px_-44px_rgba(22,31,102,0.42)] sm:p-5 lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line-soft)] pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClassName(openTicket.status)}`}>
                      {openTicket.status.replace(/_/g, " ")}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-[0.18em] ${priorityClassName(openTicket.priority)}`}>
                      {openTicket.priority}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-slate-400">{openTicket.ticketNumber}</p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{openTicket.subject}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Category: {openTicket.category} {openTicket.order?.orderNumber ? `| Order: ${openTicket.order.orderNumber}` : ""}
                  </p>
                </div>
                <div className="w-full rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-slate-600 sm:w-auto">
                  Last updated<br />
                  <span className="font-bold text-slate-900">{formatDate(openTicket.updatedAt)}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-950">Conversation</p>
                    <p className="text-xs text-slate-400">
                      {openTicket.messages.length} message{openTicket.messages.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="max-h-[24rem] space-y-4 overflow-y-auto pr-1 sm:max-h-[30rem]">
                    {openTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`rounded-[1.4rem] p-4 ${
                          message.senderRole === "admin"
                            ? "border border-emerald-200 bg-emerald-50/70"
                            : "border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]"
                        }`}
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <p className="text-sm font-black capitalize text-slate-950">{message.senderRole}</p>
                          <p className="text-xs text-slate-400">{formatDate(message.createdAt)}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Reply to this ticket</span>
                      <textarea
                        rows={5}
                        value={replyDrafts[openTicket.id] || ""}
                        onChange={(event) => setReplyDrafts((current) => ({ ...current, [openTicket.id]: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#161f66]"
                        placeholder="Add more details or respond to admin"
                      />
                    </label>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => void handleReply(openTicket.id)}
                        disabled={replyingId === openTicket.id}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#161f66] px-5 py-3 text-sm font-bold text-white hover:bg-[#111952] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                      >
                        {replyingId === openTicket.id ? <LoaderCircle size={16} className="animate-spin" /> : <SendHorizonal size={16} />}
                        Send Reply
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                    <p className="text-sm font-black text-slate-950">Ticket details</p>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                      <div className="rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3">
                        Status: <span className="font-bold text-slate-900">{openTicket.status.replace(/_/g, " ")}</span>
                      </div>
                      <div className="rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3">
                        Priority: <span className="font-bold text-slate-900 capitalize">{openTicket.priority}</span>
                      </div>
                      <div className="rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3">
                        Created: <span className="font-bold text-slate-900">{formatDate(openTicket.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-[1.8rem] border border-dashed border-[var(--line)] bg-white p-8 text-center">
              <p className="text-lg font-black tracking-tight text-slate-950">Select a ticket</p>
              <p className="mt-2 text-sm text-slate-500">Choose a conversation from the left to view messages and reply.</p>
            </section>
          )}
        </div>
      ) : (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      )}

      <CreateTicketModal
        open={createOpen}
        form={form}
        saving={saving}
        errorMessage={errorMessage}
        orders={orders}
        onClose={() => {
          if (!saving) {
            setCreateOpen(false);
            setErrorMessage("");
          }
        }}
        onChange={updateForm}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}
