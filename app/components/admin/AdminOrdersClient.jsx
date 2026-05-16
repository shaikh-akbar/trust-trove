"use client";

import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

function formatPrice(value) {
  return `Rs. ${Number(value || 0)}`;
}

function formatDate(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AdminOrdersClient({
  orders,
  initialStartDate = "",
  initialEndDate = "",
  statusOptions,
  fulfillmentOptions,
  paymentOptions,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [orderStates, setOrderStates] = useState(() =>
    Object.fromEntries(
      orders.map((order) => [
        order.id,
        {
          status: order.status,
          fulfillmentStatus: order.fulfillment_status,
          paymentStatus: order.payment_status,
          saving: false,
          error: "",
          success: "",
        },
      ])
    )
  );
  const deferredQuery = useDeferredValue(query);

  const statuses = useMemo(() => {
    const values = new Set(["all"]);

    for (const order of orders) {
      if (order.status) {
        values.add(order.status);
      }
    }

    return Array.from(values);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = `${order.users?.first_name || ""} ${order.users?.last_name || ""}`.trim().toLowerCase();
      const customerEmail = String(order.users?.email || "").toLowerCase();
      const orderNumber = String(order.order_number || "").toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        customerName.includes(normalizedQuery) ||
        customerEmail.includes(normalizedQuery) ||
        orderNumber.includes(normalizedQuery);
      const matchesStatus = status === "all" || order.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [deferredQuery, orders, status]);

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-[var(--line)] bg-white p-4 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)] sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)]"
              />
            </label>

            <div className="flex gap-2 lg:pt-7">
              <button
                type="button"
                onClick={() => applyDateFilters({ router, searchParams, startDate, endDate })}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white"
              >
                Apply Dates
              </button>
              <button
                type="button"
                onClick={() => clearDateFilters({ router, searchParams, setStartDate, setEndDate })}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-700"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order number, customer, or email"
              className="w-full rounded-full border border-[var(--line)] bg-[var(--surface-soft)] py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
            />
          </label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)]"
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "All statuses" : value.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {filteredOrders.map((order) => {
          const customerName = `${order.users?.first_name || ""} ${order.users?.last_name || ""}`.trim() || "Guest";
          const orderState = orderStates[order.id] || {
            status: order.status,
            fulfillmentStatus: order.fulfillment_status,
            paymentStatus: order.payment_status,
            saving: false,
            error: "",
            success: "",
          };

          return (
            <article
              key={order.id}
              className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)] p-5 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)]"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{order.order_number}</p>
                  <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">{customerName}</h3>
                  <p className="mt-1 text-sm text-slate-500">{order.users?.email || "No email available"}</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[320px]">
                  <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{order.status.replace(/_/g, " ")}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {order.payment_status} ({order.payment_type})
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Placed On" value={formatDate(order.created_at)} />
                <StatCard label="Subtotal" value={formatPrice(order.subtotal)} />
                <StatCard label="Shipping" value={formatPrice(order.shipping_amount)} />
                <StatCard label="Charges" value={formatPrice(Number(order.cod_charge_amount || 0) + Number(order.platform_fee_amount || 0) + Number(order.convenience_fee_amount || 0))} />
                <StatCard label="Total" value={formatPrice(order.total_amount)} highlight />
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-[var(--line)] bg-white p-4">
                <div className="grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end">
                  <StatusField
                    label="Order status"
                    value={orderState.status}
                    onChange={(value) => updateOrderState(setOrderStates, order.id, { status: value, success: "", error: "" })}
                    options={statusOptions}
                  />
                  <StatusField
                    label="Fulfillment"
                    value={orderState.fulfillmentStatus}
                    onChange={(value) => updateOrderState(setOrderStates, order.id, { fulfillmentStatus: value, success: "", error: "" })}
                    options={fulfillmentOptions}
                  />
                  <StatusField
                    label="Payment"
                    value={orderState.paymentStatus}
                    onChange={(value) => updateOrderState(setOrderStates, order.id, { paymentStatus: value, success: "", error: "" })}
                    options={paymentOptions}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      startTransition(() => {
                        void saveOrderStatus(order.id, orderState, setOrderStates);
                      });
                    }}
                    disabled={orderState.saving}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white disabled:opacity-70"
                  >
                    {orderState.saving ? "Saving..." : "Save Status"}
                  </button>
                </div>
                {orderState.error ? <p className="mt-3 text-sm text-rose-600">{orderState.error}</p> : null}
                {orderState.success ? <p className="mt-3 text-sm text-emerald-600">{orderState.success}</p> : null}
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {(order.order_items || []).map((item) => (
                  <div key={item.id} className="rounded-[1.3rem] border border-[var(--line)] bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">Quantity {item.quantity}</p>
                      </div>
                      <p className="text-sm font-black text-slate-900">{formatPrice(item.line_total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}

        {!filteredOrders.length ? (
          <div className="rounded-[2rem] border border-dashed border-[var(--line)] bg-white/80 p-10 text-center">
            <p className="text-lg font-black text-slate-900">No matching orders</p>
            <p className="mt-2 text-sm text-slate-500">Try a different order number, customer, or status filter.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function StatCard({ label, value, highlight = false }) {
  return (
    <div className={`rounded-[1.3rem] border px-4 py-3 ${highlight ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white" : "border-[var(--line)] bg-white"}`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${highlight ? "text-white/60" : "text-slate-400"}`}>{label}</p>
      <p className={`mt-2 text-sm font-black ${highlight ? "text-white" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}

function StatusField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function updateOrderState(setOrderStates, orderId, patch) {
  setOrderStates((current) => ({
    ...current,
    [orderId]: {
      ...current[orderId],
      ...patch,
    },
  }));
}

async function saveOrderStatus(orderId, orderState, setOrderStates) {
  updateOrderState(setOrderStates, orderId, {
    saving: true,
    error: "",
    success: "",
  });

  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: orderState.status,
        fulfillmentStatus: orderState.fulfillmentStatus,
        paymentStatus: orderState.paymentStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Failed to update order.");
    }

    updateOrderState(setOrderStates, orderId, {
      saving: false,
      error: "",
      success:
        data.order?.email_status?.state === "sent"
          ? data.order.email_status.message
          : data.order?.email_status?.state === "failed"
            ? `Status updated, but email failed: ${data.order.email_status.message}`
            : data.order?.email_status?.message || "Status updated.",
      status: data.order.status,
      fulfillmentStatus: data.order.fulfillment_status,
      paymentStatus: data.order.payment_status,
    });
  } catch (error) {
    updateOrderState(setOrderStates, orderId, {
      saving: false,
      error: error.message,
      success: "",
    });
  }
}

function applyDateFilters({ router, searchParams, startDate, endDate }) {
  const params = new URLSearchParams(searchParams.toString());

  if (startDate) {
    params.set("startDate", startDate);
  } else {
    params.delete("startDate");
  }

  if (endDate) {
    params.set("endDate", endDate);
  } else {
    params.delete("endDate");
  }

  router.push(`/admin/orders${params.toString() ? `?${params.toString()}` : ""}`);
}

function clearDateFilters({ router, searchParams, setStartDate, setEndDate }) {
  setStartDate("");
  setEndDate("");

  const params = new URLSearchParams(searchParams.toString());
  params.delete("startDate");
  params.delete("endDate");
  router.push(`/admin/orders${params.toString() ? `?${params.toString()}` : ""}`);
}
