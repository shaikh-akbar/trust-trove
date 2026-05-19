import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, CircleDollarSign, Clock3, PackageCheck, TrendingUp, Users } from "lucide-react";
import { getAdminDashboardData, requireAdminUser } from "../../lib/admin-server";

function formatPrice(value) {
  return `Rs. ${Number(value || 0)}`;
}

const iconMap = {
  orders: PackageCheck,
  pending: Clock3,
  cod: CircleDollarSign,
  revenue: BadgeIndianRupee,
  profit: TrendingUp,
};

export const metadata = {
  title: "Admin Dashboard | GoModexa",
  description: "Overview of GoModexa store operations, orders, and customer activity.",
};

export default async function AdminDashboardPage() {
  await requireAdminUser();
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {data.metrics.map((metric) => {
          const Icon = iconMap[metric.id] || PackageCheck;

          return (
            <article
              key={metric.id}
              className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)]"
            >
              <div className="h-1.5 bg-[linear-gradient(90deg,#424879_0%,#dcb86a_100%)]" />
              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
                    <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">{metric.value}</p>
                  </div>
                  <span className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,#eef2ff_0%,#fff8eb_100%)] text-[var(--brand-navy)]">
                    <Icon size={24} />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {data.secondaryMetrics.map((metric) => {
          const Icon = metric.id === "customers" ? Users : PackageCheck;

          return (
            <article
              key={metric.id}
              className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)]"
            >
              <div className="h-1.5 bg-[linear-gradient(90deg,#dcb86a_0%,#424879_100%)]" />
              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
                    <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">{metric.value}</p>
                  </div>
                  <span className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,#eef2ff_0%,#fff8eb_100%)] text-[var(--brand-navy)]">
                    <Icon size={24} />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <article className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,#ffffff_0%,#f7f8fc_48%,#eef2ff_100%)] p-5 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Recent Orders</p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">Latest customer activity</h3>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-navy)]"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {data.recentOrders.map((order) => {
              const customerName = `${order.users?.first_name || ""} ${order.users?.last_name || ""}`.trim() || "Guest";

              return (
                <div key={order.id} className="rounded-[1.4rem] border border-[var(--line)] bg-white/90 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{order.order_number}</p>
                      <p className="mt-2 text-base font-black text-slate-950">{customerName}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {order.status.replace(/_/g, " ")} | {order.payment_status} | {order.fulfillment_status}
                      </p>
                    </div>
                    <p className="text-xl font-black tracking-tight text-slate-950">{formatPrice(order.total_amount)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,#252e5e_0%,#1b2349_100%)] p-5 text-white shadow-[0_20px_60px_-48px_rgba(15,23,42,0.55)]">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">Revenue Snapshot</p>
          <h3 className="mt-2 text-3xl font-black tracking-[-0.04em]">{formatPrice(data.revenuePreview)}</h3>
          <p className="mt-3 text-sm leading-6 text-white/72">
            Revenue is summed from non-cancelled order totals, and profit is estimated from saved sold price versus variant cost price.
          </p>

          <div className="mt-6 space-y-3">
            {[
              { label: "Estimated profit", description: formatPrice(data.totalProfit) },
              { label: "Order management", description: "Track customer flow, COD mix, and pending fulfillment." },
              { label: "Product ops", description: "Next module placeholder for inventory, pricing, and fee controls." },
              { label: "Store settings", description: "Next module placeholder for admin preferences and access policy." },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.3rem] border border-white/10 bg-white/8 p-4">
                <p className="text-sm font-black">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

