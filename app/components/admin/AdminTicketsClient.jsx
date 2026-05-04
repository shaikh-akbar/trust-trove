"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LoaderCircle, MessageSquareText, SendHorizonal, ShieldAlert } from "lucide-react";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];
const PAGE_SIZE = 2;

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

export default function AdminTicketsClient({ initialTickets }) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedId, setSelectedId] = useState(initialTickets[0]?.id || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [replyDraft, setReplyDraft] = useState("");
  const [savingStatus, setSavingStatus] = useState("");
  const [replyingId, setReplyingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [adminNotes, setAdminNotes] = useState(
    Object.fromEntries(initialTickets.map((ticket) => [ticket.id, ticket.adminNotes || ""]))
  );

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) || tickets[0] || null,
    [selectedId, tickets]
  );
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return tickets.slice(start, start + PAGE_SIZE);
  }, [currentPage, tickets]);

  function refreshRoute() {
    startTransition(() => {
      router.refresh();
    });
  }

  function selectPage(nextPage) {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    const nextTickets = tickets.slice((safePage - 1) * PAGE_SIZE, (safePage - 1) * PAGE_SIZE + PAGE_SIZE);
    setCurrentPage(safePage);

    if (!nextTickets.find((ticket) => ticket.id === selectedId) && nextTickets[0]) {
      setSelectedId(nextTickets[0].id);
    }
  }

  async function handleStatusSave(ticketId, status) {
    setSavingStatus(ticketId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes[ticketId] || "",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update ticket.");
      }

      setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? data.ticket : ticket)));
      setSelectedId(ticketId);
      refreshRoute();
    } catch (error) {
      setErrorMessage(error.message || "Failed to update ticket.");
    } finally {
      setSavingStatus("");
    }
  }

  async function handleReply(ticketId) {
    const message = replyDraft.trim();

    if (!message) {
      return;
    }

    setReplyingId(ticketId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send admin reply.");
      }

      setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? data.ticket : ticket)));
      setSelectedId(ticketId);
      setReplyDraft("");
      refreshRoute();
    } catch (error) {
      setErrorMessage(error.message || "Failed to send admin reply.");
    } finally {
      setReplyingId("");
    }
  }

  return (
    <div className="space-y-5">
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="space-y-4">
          <div className="rounded-[1.8rem] border border-[var(--line)] bg-white p-4 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Ticket Queue</p>
                <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950">
                  {tickets.length} support ticket{tickets.length === 1 ? "" : "s"}
                </h3>
              </div>
              <div className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-bold text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {paginatedTickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedId(ticket.id)}
                className={`w-full rounded-[1.6rem] border p-5 text-left shadow-[0_18px_45px_-42px_rgba(22,31,102,0.42)] transition ${
                  selectedTicket?.id === ticket.id
                    ? "border-[#161f66] bg-[linear-gradient(180deg,#ffffff_0%,#f5f8ff_100%)]"
                    : "border-[var(--line)] bg-white hover:border-[#161f66]/40"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-bold text-[var(--brand-navy)]">
                    {ticket.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {ticket.priority}
                  </span>
                </div>
                <p className="mt-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{ticket.ticketNumber}</p>
                <h3 className="mt-2 text-lg font-black tracking-tight text-slate-950">{ticket.subject}</h3>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {ticket.user?.firstName} {ticket.user?.lastName}
                </p>
                <p className="mt-1 truncate text-sm text-slate-500">{ticket.user?.email}</p>
                <p className="mt-3 text-xs text-slate-400">{formatDate(ticket.createdAt)}</p>
              </button>
            ))}
          </div>

          {tickets.length > PAGE_SIZE ? (
            <div className="flex items-center justify-between rounded-[1.6rem] border border-[var(--line)] bg-white p-4 shadow-[0_18px_45px_-42px_rgba(22,31,102,0.24)]">
              <button
                type="button"
                onClick={() => selectPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <p className="text-sm font-bold text-slate-600">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                {Math.min(currentPage * PAGE_SIZE, tickets.length)} of {tickets.length}
              </p>
              <button
                type="button"
                onClick={() => selectPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </section>

        {selectedTicket ? (
          <section className="rounded-[2rem] border border-[var(--line)] bg-white p-4 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)] sm:p-5">
            <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{selectedTicket.ticketNumber}</p>
                <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl">{selectedTicket.subject}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedTicket.user?.firstName} {selectedTicket.user?.lastName} | {selectedTicket.user?.email}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Category: {selectedTicket.category} | Priority: {selectedTicket.priority}
                  {selectedTicket.order?.orderNumber ? ` | Order: ${selectedTicket.order.orderNumber}` : ""}
                </p>
              </div>

              <div className="w-full rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4 sm:max-w-xs">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(event) => {
                      const nextStatus = event.target.value;
                      setTickets((current) => current.map((ticket) => (
                        ticket.id === selectedTicket.id ? { ...ticket, status: nextStatus } : ticket
                      )));
                    }}
                    className="w-full rounded-full border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => void handleStatusSave(selectedTicket.id, selectedTicket.status)}
                  disabled={savingStatus === selectedTicket.id}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white disabled:opacity-70"
                >
                  {savingStatus === selectedTicket.id ? <LoaderCircle size={16} className="mr-2 animate-spin" /> : null}
                  Save status
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                {selectedTicket.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-[1.4rem] p-4 ${
                      message.senderRole === "admin"
                        ? "border border-sky-200 bg-sky-50/70"
                        : "border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black capitalize text-slate-950">{message.senderRole}</p>
                      <p className="text-xs text-slate-400">{formatDate(message.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{message.message}</p>
                  </div>
                ))}

                <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">Reply as admin</span>
                    <textarea
                      rows={4}
                      value={replyDraft}
                      onChange={(event) => setReplyDraft(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                      placeholder="Write a response for the customer"
                    />
                  </label>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleReply(selectedTicket.id)}
                      disabled={replyingId === selectedTicket.id}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-navy)] px-5 py-3 text-sm font-bold text-white disabled:opacity-70"
                    >
                      {replyingId === selectedTicket.id ? <LoaderCircle size={16} className="animate-spin" /> : <SendHorizonal size={16} />}
                      Send reply
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <ShieldAlert size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-black text-slate-950">Admin notes</p>
                    <p className="text-sm text-slate-500">Visible to internal team only.</p>
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={adminNotes[selectedTicket.id] || ""}
                  onChange={(event) => setAdminNotes((current) => ({ ...current, [selectedTicket.id]: event.target.value }))}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  placeholder="Add context for operations or follow-up"
                />
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-[var(--line)] bg-white p-8 text-center">
            <MessageSquareText className="mx-auto text-slate-300" size={30} />
            <p className="mt-4 text-lg font-black tracking-tight text-slate-950">No tickets available</p>
          </section>
        )}
      </div>
    </div>
  );
}
