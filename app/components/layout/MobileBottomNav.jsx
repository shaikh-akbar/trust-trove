"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, LayoutDashboard, LayoutGrid, ShoppingBag, User } from "lucide-react";

const mobileNavItems = [
  {
    href: "/shop",
    label: "Shop",
    icon: ShoppingBag,
    match: (pathname) => pathname.startsWith("/shop") || pathname.startsWith("/cart"),
  },
  {
    href: "/new-arrivals",
    label: "Explore",
    icon: Compass,
    match: (pathname) => pathname.startsWith("/new-arrivals"),
  },
  {
    href: "/categories",
    label: "Category",
    icon: LayoutGrid,
    match: (pathname) => pathname.startsWith("/categories"),
  },
];

export default function MobileBottomNav({ user }) {
  const pathname = usePathname();
  const isProductDetailPage = pathname.startsWith("/product/");
  const isAdmin = Boolean(user?.isAdmin);
  const profileHref = isAdmin ? "/admin" : user ? "/profile" : "/signin";
  const profileActive =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/my-tickets") ||
    pathname.startsWith("/my-addresses");

  if (isProductDetailPage) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-2 z-50 px-4 md:hidden">
      <div className="pointer-events-auto mx-auto max-w-sm">
        <div className="relative rounded-[1.6rem] border border-slate-200/85 bg-slate-100/92 px-2.5 pb-2 pt-1.5 shadow-[0_16px_36px_-20px_rgba(15,23,42,0.28)] backdrop-blur-xl">
          <div className="grid grid-cols-5 items-end gap-1">
            {mobileNavItems.slice(0, 2).map(({ href, label, icon: Icon, match }) => {
              const isActive = match(pathname);

              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className={`flex flex-col items-center justify-center rounded-[1rem] px-1.5 py-1.5 text-center transition ${
                    isActive ? "bg-white text-[var(--brand-navy)] shadow-[0_10px_24px_-18px_rgba(15,23,42,0.24)]" : "text-slate-500"
                  }`}
                >
                  <Icon size={16} strokeWidth={2.4} />
                  <span className={`mt-1 text-[8px] font-black uppercase tracking-[0.12em] ${isActive ? "text-[var(--brand-navy)]" : "text-slate-500"}`}>
                    {label}
                  </span>
                </Link>
              );
            })}

            <div className="flex justify-center">
              <Link
                href="/"
                aria-label="GoModexa home"
                className={`flex min-h-[44px] flex-col items-center justify-center rounded-[1rem] px-1.5 py-1.5 text-center transition ${
                  pathname === "/"
                    ? "bg-[var(--brand-navy)] text-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.24)]"
                    : "text-slate-500"
                }`}
              >
                <Home size={16} strokeWidth={2.4} className={pathname === "/" ? "text-white" : "text-slate-500"} />
                <span
                  className={`mt-1 text-[8px] font-black uppercase tracking-[0.08em] ${
                    pathname === "/" ? "text-white" : "text-slate-500"
                  }`}
                >
                  Home
                </span>
              </Link>
            </div>

            <Link
              href={mobileNavItems[2].href}
              aria-label={mobileNavItems[2].label}
              className={`flex flex-col items-center justify-center rounded-[1rem] px-1.5 py-1.5 text-center transition ${
                mobileNavItems[2].match(pathname)
                  ? "bg-white text-[var(--brand-navy)] shadow-[0_10px_24px_-18px_rgba(15,23,42,0.24)]"
                  : "text-slate-500"
              }`}
            >
              <LayoutGrid size={16} strokeWidth={2.4} />
              <span
                className={`mt-1 text-[8px] font-black uppercase tracking-[0.12em] ${
                  mobileNavItems[2].match(pathname) ? "text-[var(--brand-navy)]" : "text-slate-500"
                }`}
              >
                {mobileNavItems[2].label}
              </span>
            </Link>

            <Link
              href={profileHref}
              aria-label={isAdmin ? "Admin" : "Profile"}
              className={`flex flex-col items-center justify-center rounded-[1rem] px-1.5 py-1.5 text-center transition ${
                profileActive ? "bg-white text-[var(--brand-navy)] shadow-[0_10px_24px_-18px_rgba(15,23,42,0.24)]" : "text-slate-500"
              }`}
            >
              {isAdmin ? <LayoutDashboard size={16} strokeWidth={2.4} /> : <User size={16} strokeWidth={2.4} />}
              <span className={`mt-1 text-[8px] font-black uppercase tracking-[0.12em] ${profileActive ? "text-[var(--brand-navy)]" : "text-slate-500"}`}>
                {isAdmin ? "Admin" : "Profile"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

