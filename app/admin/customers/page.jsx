import { Mail, MapPin, Phone, ShoppingBag, Ticket } from "lucide-react";
import { getAdminCustomers, requireAdminUser } from "../../../lib/admin-server";

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatPrice(value) {
  return `Rs. ${Number(value || 0)}`;
}

export const metadata = {
  title: "Admin Customers | GoModexa",
  description: "Review GoModexa customers, order history, and ticket activity.",
};

export default async function AdminCustomersPage() {
  await requireAdminUser();
  const customers = await getAdminCustomers();

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total customers" value={customers.length} />
        <MetricCard label="Customers with tickets" value={customers.filter((customer) => customer.totalTickets > 0).length} />
        <MetricCard label="Active support load" value={customers.reduce((total, customer) => total + customer.openTickets, 0)} />
      </section>

      <section className="space-y-4">
        {customers.map((customer) => (
          <article
            key={customer.id}
            className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)]"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Customer</p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">{customer.fullName}</h3>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Mail size={16} />
                    {customer.email}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Phone size={16} />
                    {customer.phone || "No phone"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} />
                    {customer.city || "No city"}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                <SmallStat icon={ShoppingBag} label="Orders" value={customer.totalOrders} />
                <SmallStat icon={Ticket} label="Open tickets" value={customer.openTickets} />
                <SmallStat icon={ShoppingBag} label="Spent" value={formatPrice(customer.totalSpent)} />
                <SmallStat icon={Ticket} label="Total tickets" value={customer.totalTickets} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-slate-600">
                Joined on <span className="font-bold text-slate-900">{formatDate(customer.createdAt)}</span>
              </div>
              <div className="rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-slate-600">
                Last order <span className="font-bold text-slate-900">{formatDate(customer.lastOrderAt)}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)]">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">{value}</p>
    </article>
  );
}

function SmallStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={15} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

