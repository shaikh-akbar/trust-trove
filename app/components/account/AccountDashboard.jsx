import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  CreditCard,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Ticket,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";

const navItems = [
  { href: "/profile", label: "My Profile", icon: UserRound },
  { href: "/orders", label: "My Orders", icon: ClipboardList },
  { href: "/my-tickets", label: "My Tickets", icon: Ticket },
  { href: "/my-addresses", label: "My Addresses", icon: MapPin },
];

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

function formatStatusLabel(value, fallback = "Pending") {
  const normalizedValue = String(value || fallback).trim();
  return normalizedValue ? normalizedValue.replace(/_/g, " ") : fallback;
}

function getInitials(profile) {
  return `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.trim().toUpperCase() || profile.email?.[0]?.toUpperCase() || "U";
}

function getStatusMeta(order) {
  const orderStatus = String(order.status || "").toLowerCase();
  const fulfillmentStatus = String(order.fulfillment_status || "").toLowerCase();

  if (orderStatus === "cancelled") {
    return {
      label: "Cancelled",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  if (fulfillmentStatus === "delivered") {
    return {
      label: "Delivered",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (orderStatus === "out_for_delivery") {
    return {
      label: "Out for delivery",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (orderStatus === "shipped" || fulfillmentStatus === "shipped") {
    return {
      label: "Shipped",
      className: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  if (orderStatus === "payment_pending") {
    return {
      label: "Payment pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Processing",
    className: "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--brand-navy)]",
  };
}

const ORDER_PROGRESS_STEPS = [
  { key: "placed", label: "Placed", icon: CheckCircle2, activeClass: "border-violet-200 bg-violet-50 text-violet-700", iconClass: "bg-violet-500 text-white", doneClass: "border-violet-100 bg-violet-50 text-violet-600" },
  { key: "processing", label: "In Progress", icon: Clock3, activeClass: "border-amber-200 bg-amber-50 text-amber-700", iconClass: "bg-amber-500 text-white", doneClass: "border-amber-100 bg-amber-50 text-amber-600" },
  { key: "shipped", label: "Shipped", icon: Package, activeClass: "border-sky-200 bg-sky-50 text-sky-700", iconClass: "bg-sky-500 text-white", doneClass: "border-sky-100 bg-sky-50 text-sky-600" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck, activeClass: "border-blue-200 bg-blue-50 text-blue-700", iconClass: "bg-blue-600 text-white", doneClass: "border-blue-100 bg-blue-50 text-blue-600" },
  { key: "delivered", label: "Delivered", icon: CheckCircle2, activeClass: "border-emerald-200 bg-emerald-50 text-emerald-700", iconClass: "bg-emerald-500 text-white", doneClass: "border-emerald-100 bg-emerald-50 text-emerald-600" },
  { key: "cancelled", label: "Cancelled", icon: XCircle, activeClass: "border-rose-200 bg-rose-50 text-rose-700", iconClass: "bg-rose-500 text-white", doneClass: "border-rose-100 bg-rose-50 text-rose-600" },
];

function getOrderProgressKey(order) {
  const orderStatus = String(order.status || "").toLowerCase();
  const fulfillmentStatus = String(order.fulfillment_status || "").toLowerCase();

  if (orderStatus === "cancelled" || fulfillmentStatus === "cancelled") {
    return "cancelled";
  }

  if (orderStatus === "delivered" || fulfillmentStatus === "delivered") {
    return "delivered";
  }

  if (orderStatus === "out_for_delivery") {
    return "out_for_delivery";
  }

  if (orderStatus === "shipped" || fulfillmentStatus === "shipped") {
    return "shipped";
  }

  if (orderStatus === "processing" || fulfillmentStatus === "processing" || fulfillmentStatus === "packed") {
    return "processing";
  }

  return "placed";
}

function getOrderProgressSteps(order) {
  const currentKey = getOrderProgressKey(order);
  const currentIndex = ORDER_PROGRESS_STEPS.findIndex((step) => step.key === currentKey);
  const isCancelled = currentKey === "cancelled";

  return ORDER_PROGRESS_STEPS.map((step, index) => ({
    ...step,
    state:
      step.key === currentKey
        ? "current"
        : !isCancelled && currentIndex > index
          ? "complete"
          : "upcoming",
  }));
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1.6rem] border border-[var(--line)] bg-white p-5 shadow-[0_20px_45px_-40px_rgba(22,31,102,0.45)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(22,31,102,0.08)] text-[#161f66]">
        <Icon size={22} />
      </div>
      <p className="mt-5 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-4xl font-black tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function SidebarNav({ currentPath, logoutButton }) {
  return (
    <aside className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_60px_-48px_rgba(22,31,102,0.48)]">
      <div className="border-b border-[var(--line-soft)] px-5 py-5">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#161f66]/70">Account Center</p>
      </div>
      <nav className="p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = currentPath === href;

          return (
            <Link
              key={href}
              href={href}
              className={`mb-2 flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition ${
                isActive
                  ? "bg-[rgba(22,31,102,0.08)] text-[#161f66]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--line-soft)] p-4">{logoutButton}</div>
    </aside>
  );
}

export function AccountDashboardShell({
  currentPath,
  title,
  description,
  action,
  profile,
  stats,
  logoutButton,
  children,
}) {
  return (
    <section className="bg-[linear-gradient(180deg,#f7f9ff_0%,#ffffff_30%,#f5f8ff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <SidebarNav currentPath={currentPath} logoutButton={logoutButton} />

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_28px_80px_-56px_rgba(22,31,102,0.5)]">
              <div className="bg-[linear-gradient(135deg,#161f66_0%,#27318e_55%,#dcb86a_150%)] px-6 py-7 text-white sm:px-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[1.6rem] bg-white/14 text-3xl font-black uppercase text-white backdrop-blur">
                      {getInitials(profile)}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">GoModexa Member</p>
                      <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                        {title}
                      </h1>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/82 sm:text-base">{description}</p>
                    </div>
                  </div>
                  {action ? <div className="shrink-0">{action}</div> : null}
                </div>
              </div>

              <div className="grid gap-5 border-t border-white/10 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[rgba(22,31,102,0.08)] text-3xl font-black text-[#161f66]">
                    {getInitials(profile)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-2xl font-black tracking-tight text-slate-950">
                        {profile.fullName || profile.email}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <ShieldCheck size={14} />
                        Verified
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                      <span className="inline-flex items-center gap-2">
                        <Mail size={16} className="text-[#161f66]" />
                        {profile.email}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Phone size={16} className="text-[#161f66]" />
                        {profile.phone || "Add phone number"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-5 py-4">
                  <p className="text-sm text-slate-500">Member since</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-lg font-black tracking-tight text-slate-950">
                    <CalendarDays size={18} className="text-[#161f66]" />
                    {formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Package} label="Total orders" value={stats.totalOrders} />
              <StatCard icon={Clock3} label="Pending orders" value={stats.pendingOrders} />
              <StatCard icon={Truck} label="Delivered orders" value={stats.deliveredOrders} />
              <StatCard icon={XCircle} label="Cancelled orders" value={stats.cancelledOrders} />
            </div>

            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProfileOverview({ profile, addresses, stats, editProfileAction }) {
  const primaryAddress = addresses.find((address) => address.isDefault) || addresses[0] || null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_-42px_rgba(22,31,102,0.42)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">Personal information</h2>
              <p className="mt-1 text-sm text-slate-500">Core account details for your dashboard.</p>
            </div>
            {editProfileAction}
          </div>

          <div className="space-y-4">
            <InfoRow icon={UserRound} label="Full name" value={profile.fullName || "Not added yet"} />
            <InfoRow icon={Mail} label="Email address" value={profile.email} />
            <InfoRow icon={Phone} label="Mobile number" value={profile.phone || "Not added yet"} />
            <InfoRow icon={MapPin} label="City" value={profile.city || "Not added yet"} />
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_-42px_rgba(22,31,102,0.42)]">
          <h2 className="text-xl font-black tracking-tight text-slate-950">Account security</h2>
          <p className="mt-1 text-sm text-slate-500">Keep your account protected and easy to recover.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <MiniCard
              icon={CreditCard}
              title="Password"
              text="Manage sign-in access and reset credentials if needed."
              actionHref="/forgot-password"
              actionLabel="Change password"
            />
            <MiniCard
              icon={ShieldCheck}
              title="Support"
              text="Need account help? Reach support with your latest order details."
              actionHref="/contact-us"
              actionLabel="Get help"
            />
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_-42px_rgba(22,31,102,0.42)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">Saved address</h2>
              <p className="mt-1 text-sm text-slate-500">Your default delivery location for fast checkout.</p>
            </div>
            <Link href="/my-addresses" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold text-[#161f66] hover:border-[#161f66] hover:bg-slate-50">
              Manage
              <ChevronRight size={16} />
            </Link>
          </div>

          {primaryAddress ? (
            <AddressCard address={primaryAddress} />
          ) : (
            <EmptyState
              title="No saved address yet"
              text="Add your first address to speed up checkout and order delivery."
              href="/checkout"
              cta="Add address"
            />
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <MiniStatCard label="Saved addresses" value={stats.savedAddresses} />
          <MiniStatCard label="Completed orders" value={stats.deliveredOrders} />
        </section>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-[1.4rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] px-4 py-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(22,31,102,0.08)] text-[#161f66]">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="truncate text-base font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function MiniCard({ icon: Icon, title, text, actionHref, actionLabel }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(22,31,102,0.08)] text-[#161f66]">
        <Icon size={18} />
      </div>
      <h3 className="mt-4 text-lg font-black tracking-tight text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
      <Link href={actionHref} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#161f66] hover:text-[#111952]">
        {actionLabel}
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

function MiniStatCard({ label, value }) {
  return (
    <div className="rounded-[1.6rem] border border-[var(--line)] bg-[linear-gradient(135deg,#ffffff_0%,#f6f9ff_100%)] p-5 shadow-[0_18px_40px_-38px_rgba(22,31,102,0.4)]">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function EmptyState({ title, text, href, cta }) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] px-5 py-8 text-center">
      <p className="text-lg font-black tracking-tight text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
      <Link href={href} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#161f66] px-5 py-3 text-sm font-bold text-white hover:bg-[#111952]">
        {cta}
      </Link>
    </div>
  );
}

export function OrdersPanel({ orders }) {
  return (
    <section className="space-y-4">
      {orders.length ? (
        orders.map((order) => {
          const status = getStatusMeta(order);

          return (
            <article key={order.id} className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_22px_55px_-44px_rgba(22,31,102,0.42)]">
              <div className="flex flex-col gap-5 border-b border-[var(--line-soft)] pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black tracking-tight text-slate-950">{order.order_number}</h2>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Placed on {formatDate(order.created_at)}</p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-sm text-slate-500">{order.items_count || order.order_items?.length || 0} item(s)</p>
                  <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{formatPrice(order.total_amount)}</p>
                </div>
              </div>

              <div className="space-y-5 pt-5">
                <div className="space-y-3">
                  {(order.order_items || []).map((item) => (
                    <div key={item.id} className="flex items-start gap-4 rounded-[1.4rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <Package size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">Qty {item.quantity}</p>
                        <p className="mt-2 text-sm font-black text-slate-950">{formatPrice(item.line_total)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.5rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,#fbfcff_0%,#f5f8ff_100%)] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#161f66]/70">Order status</p>
                  <OrderStatusRail order={order} />
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <StatusPill label="Order" value={formatStatusLabel(order.status, "placed")} />
                    <StatusPill label="Fulfillment" value={formatStatusLabel(order.fulfillment_status, "unfulfilled")} />
                    <StatusPill label="Payment" value={`${formatStatusLabel(order.payment_status, "pending")} | ${formatStatusLabel(order.payment_type, "online")}`} />
                  </div>
                  <p className="mt-4 text-xs text-slate-500">Last updated view based on your current order, fulfillment, and payment status.</p>
                </div>
              </div>
            </article>
          );
        })
      ) : (
        <EmptyState
          title="No orders yet"
          text="Your upcoming purchases will appear here with status, totals, and item details."
          href="/shop"
          cta="Start shopping"
        />
      )}
    </section>
  );
}

function OrderStatusRail({ order }) {
  const steps = getOrderProgressSteps(order);

  return (
    <div className="mt-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-start gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCurrent = step.state === "current";
          const isComplete = step.state === "complete";
          const cardClass = isCurrent
            ? step.activeClass
            : isComplete
              ? step.doneClass
              : "border-slate-200 bg-white text-slate-400";
          const iconClass = isCurrent
            ? step.iconClass
            : isComplete
              ? "bg-white text-current"
              : "bg-slate-100 text-slate-400";
          const connectorClass = isCurrent || isComplete ? "bg-[#cfd8ff]" : "bg-slate-200";

          return (
            <div key={step.key} className="flex items-center gap-2">
              <div className={`w-[108px] rounded-[1.35rem] border px-3 py-3 text-center transition ${cardClass}`}>
                <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-current/10 ${iconClass}`}>
                  <Icon size={18} />
                </div>
                <p className="mt-3 text-sm font-black leading-4">{step.label}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  {isCurrent ? "Current" : isComplete ? "Done" : "Waiting"}
                </p>
              </div>
              {index < steps.length - 1 ? <div className={`hidden h-1 w-7 rounded-full md:block ${connectorClass}`} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({ label, value }) {
  return (
    <div className="rounded-[1.15rem] border border-[var(--line-soft)] bg-white px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold capitalize text-slate-900">{value}</p>
    </div>
  );
}

export function AddressesPanel({ addresses }) {
  const defaultCount = addresses.filter((address) => address.isDefault).length;
  const otherCount = Math.max(0, addresses.length - defaultCount);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MiniStatCard label="Total" value={addresses.length} />
        <MiniStatCard label="Default" value={defaultCount} />
        <MiniStatCard label="Others" value={otherCount} />
      </div>

      {addresses.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No delivery address saved"
          text="Add a home or work address so checkout is faster the next time you shop."
          href="/checkout"
          cta="Add new address"
        />
      )}
    </div>
  );
}

function AddressCard({ address }) {
  const lines = [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    `${address.city}, ${address.state} - ${address.postalCode}`,
    address.country,
  ].filter(Boolean);

  return (
    <div className="rounded-[1.7rem] border border-[var(--line)] bg-white p-5 shadow-[0_20px_50px_-42px_rgba(22,31,102,0.42)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {address.isDefault ? (
              <span className="rounded-full bg-[#161f66] px-3 py-1 text-xs font-bold text-white">Default</span>
            ) : null}
            <p className="text-lg font-black tracking-tight text-slate-950">{address.fullName}</p>
          </div>
          <p className="mt-1 text-sm capitalize text-slate-500">{address.addressType || "home"}</p>
        </div>
        <Link href="/checkout" className="inline-flex items-center gap-2 text-sm font-bold text-[#161f66] hover:text-[#111952]">
          <Edit3 size={16} />
          Edit
        </Link>
      </div>

      <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--line-soft)] pt-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <Phone size={15} className="text-[#161f66]" />
          {address.phone}
        </span>
        {address.email ? (
          <span className="inline-flex items-center gap-2">
            <Mail size={15} className="text-[#161f66]" />
            {address.email}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function TicketsPanel() {
  return (
    <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_22px_55px_-44px_rgba(22,31,102,0.42)]">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-[rgba(22,31,102,0.08)] text-[#161f66]">
          <Ticket size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Support tickets</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Ticket history is not connected yet, but we have added the dashboard section so the user flow matches the account center design.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-6">
        <p className="text-lg font-black tracking-tight text-slate-950">Need help with an order or account issue?</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Reach out through contact support and include your latest order number for a faster response.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/contact-us" className="inline-flex items-center gap-2 rounded-full bg-[#161f66] px-5 py-3 text-sm font-bold text-white hover:bg-[#111952]">
            Contact support
          </Link>
          <Link href="/orders" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 text-sm font-bold text-[#161f66] hover:border-[#161f66] hover:bg-slate-50">
            View my orders
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LogoutSidebarButton({ children }) {
  return (
    <div className="rounded-2xl text-rose-600 [&_button]:flex [&_button]:w-full [&_button]:items-center [&_button]:justify-center [&_button]:gap-2 [&_button]:rounded-2xl [&_button]:border [&_button]:border-rose-200 [&_button]:bg-rose-50 [&_button]:px-4 [&_button]:py-3 [&_button]:text-sm [&_button]:font-bold [&_button]:text-rose-600 hover:[&_button]:bg-rose-100">
      <LogOut size={16} className="hidden" />
      {children}
    </div>
  );
}

