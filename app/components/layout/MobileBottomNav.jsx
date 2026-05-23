"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, Home, LayoutDashboard, LayoutGrid, ShoppingBag, User, X } from "lucide-react";
import { logoutAction } from "../../actions/auth";

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
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const isProductDetailPage = pathname.startsWith("/product/");
  const isAdmin = Boolean(user?.isAdmin);
  const profileHref = isAdmin ? "/admin" : user ? "/profile" : "/signin";
  const profileLabel = isAdmin ? "Admin" : "Profile";
  const profileActive =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/my-tickets") ||
    pathname.startsWith("/my-addresses") ||
    pathname.startsWith("/wishlist");
  const profileMenuItems = useMemo(() => {
    if (isAdmin) {
      return [{ href: "/admin", label: "Admin Panel" }];
    }

    if (!user) {
      return [];
    }

    return [
      { href: "/profile", label: "My Profile" },
      { href: "/orders", label: "My Orders" },
      { href: "/my-tickets", label: "My Tickets" },
      { href: "/my-addresses", label: "My Addresses" },
      { href: "/wishlist", label: "My Wishlist" },
    ];
  }, [isAdmin, user]);

  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isProductDetailPage) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-2 z-50 px-4 md:hidden">
      <div ref={profileMenuRef} className="pointer-events-auto mx-auto max-w-sm">
        {isProfileMenuOpen ? (
          <div className="mb-3 overflow-hidden rounded-[1.5rem] border border-slate-200/85 bg-[rgba(252,248,241,0.98)] p-2 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-3 py-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--brand-navy)]/45">
                  {user ? "Account" : "Welcome"}
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--brand-navy)]">
                  {user ? "Quick profile access" : "Sign in to see your menu"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(false)}
                aria-label="Close profile menu"
                className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-[var(--brand-navy)]"
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            {user ? (
              <div className="space-y-1">
                {profileMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block rounded-[1rem] bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-[var(--surface-soft)] hover:text-slate-950"
                  >
                    {item.label}
                  </Link>
                ))}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="block w-full rounded-[1rem] bg-rose-50 px-4 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href={profileHref}
                onClick={() => setIsProfileMenuOpen(false)}
                className="block rounded-[1rem] bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-[var(--surface-soft)] hover:text-slate-950"
              >
                Sign in
              </Link>
            )}
          </div>
        ) : null}

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

            <button
              type="button"
              aria-label={profileLabel}
              aria-expanded={isProfileMenuOpen}
              onClick={() => {
                if (!user && !isAdmin) {
                  router.push(profileHref);
                  return;
                }

                setIsProfileMenuOpen((open) => !open);
              }}
              className={`flex flex-col items-center justify-center rounded-[1rem] px-1.5 py-1.5 text-center transition ${
                profileActive || isProfileMenuOpen
                  ? "bg-white text-[var(--brand-navy)] shadow-[0_10px_24px_-18px_rgba(15,23,42,0.24)]"
                  : "text-slate-500"
              }`}
            >
              {isAdmin ? <LayoutDashboard size={16} strokeWidth={2.4} /> : <User size={16} strokeWidth={2.4} />}
              <span
                className={`mt-1 text-[8px] font-black uppercase tracking-[0.12em] ${
                  profileActive || isProfileMenuOpen ? "text-[var(--brand-navy)]" : "text-slate-500"
                }`}
              >
                {profileLabel}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

