"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquareText, PackageCheck, ReceiptText, Settings, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/tickets", label: "Tickets", icon: MessageSquareText },
  { href: "/admin/products", label: "Products", icon: PackageCheck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ user, title, description, eyebrow = "Admin Panel", children }) {
  const pathname = usePathname();

  return (
    <section className="min-h-[calc(100vh-11rem)] bg-[radial-gradient(circle_at_top_left,rgba(220,184,106,0.28),transparent_24%),linear-gradient(180deg,#eef2ff_0%,#f8fafc_32%,#ffffff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(37,46,94,0.98)_0%,rgba(24,31,66,0.98)_100%)] p-5 text-white shadow-[0_28px_80px_-46px_rgba(15,23,42,0.65)]">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">GoModexa</p>
              <h1 className="mt-2 text-2xl font-black tracking-[-0.04em]">Admin Console</h1>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Monitor orders, operations, and the customer pipeline from one focused workspace.
              </p>
            </div>

            <nav className="mt-5 space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-[1.2rem] px-4 py-3 text-sm font-bold transition ${
                      isActive
                        ? "bg-white text-[var(--brand-navy)] shadow-[0_16px_32px_-24px_rgba(255,255,255,0.8)]"
                        : "text-white/74 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${isActive ? "bg-[var(--surface-soft)]" : "bg-white/10"}`}>
                      <Icon size={18} />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55">Signed In</p>
              <p className="mt-2 text-base font-black">{user.firstName || user.email}</p>
              <p className="mt-1 text-sm text-white/70">{user.email}</p>
            </div>
          </aside>

          <div className="space-y-6">
            <header className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_28px_80px_-52px_rgba(66,72,121,0.35)] backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">{title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p>
            </header>

            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

