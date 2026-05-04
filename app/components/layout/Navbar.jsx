"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, LayoutDashboard, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { logoutAction } from "../../actions/auth";
import { useCart } from "../cart/CartProvider";
import { useWishlist } from "../wishlist/WishlistProvider";

function getWelcomeName(user) {
  if (!user) {
    return null;
  }

  return user.firstName || user.email?.split("@")[0] || "Member";
}

function buildSearchResults(items, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();

  if (!normalizedQuery) {
    return { products: [], categories: [] };
  }

  const products = items
    .filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(normalizedQuery))
    .slice(0, 6);

  const categories = [];
  const seenCategories = new Set();

  for (const item of items) {
    const label = String(item.category || "");

    if (!label.toLowerCase().includes(normalizedQuery) || seenCategories.has(item.categorySlug)) {
      continue;
    }

    seenCategories.add(item.categorySlug);
    categories.push({
      label,
      href: `/categories/${item.categorySlug}`,
    });

    if (categories.length === 4) {
      break;
    }
  }

  return { products, categories };
}

function SearchSuggestions({ results, query, onSelect, className = "" }) {
  if (!query.trim()) {
    return null;
  }

  if (!results.products.length && !results.categories.length) {
    return (
      <div className={`rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.28)] ${className}`}>
        <p className="text-sm font-bold text-slate-900">No matches found</p>
        <p className="mt-1 text-sm text-slate-500">Try a product name or category keyword.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.28)] ${className}`}>
      {results.products.length ? (
        <div>
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Products</p>
          {results.products.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onSelect}
              className="flex items-center gap-3 rounded-[1rem] px-3 py-3 transition hover:bg-slate-50"
            >
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingBag size={16} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                <p className="truncate text-xs text-slate-500">{item.category}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {results.categories.length ? (
        <div className={results.products.length ? "border-t border-slate-100 pt-2" : ""}>
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categories</p>
          {results.categories.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onSelect}
              className="block rounded-[1rem] px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Navbar({ user, navbarSearchItems = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [desktopSearch, setDesktopSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const profileMenuRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const welcomeName = getWelcomeName(user);
  const isLoggedIn = Boolean(user);
  const deferredDesktopSearch = useDeferredValue(desktopSearch);
  const deferredMobileSearch = useDeferredValue(mobileSearch);
  const desktopResults = useMemo(
    () => buildSearchResults(navbarSearchItems, deferredDesktopSearch),
    [deferredDesktopSearch, navbarSearchItems]
  );
  const mobileResults = useMemo(
    () => buildSearchResults(navbarSearchItems, deferredMobileSearch),
    [deferredMobileSearch, navbarSearchItems]
  );
  const navItems = [
    { href: "/shop", label: "Shop" },
    { href: "/categories", label: "Categories" },
    { href: "/new-arrivals", label: "New Arrivals" },
  ];
  const profileItems = [
    { href: "/profile", label: "My Profile" },
    { href: "/orders", label: "My Orders" },
    { href: "/my-tickets", label: "My Tickets" },
    { href: "/my-addresses", label: "My Addresses" },
    { href: "/wishlist", label: "My Wishlist" },
  ];
  const profileMenuItems = user?.isAdmin
    ? [{ href: "/admin", label: "Admin Panel" }, ...profileItems]
    : profileItems;

  useEffect(() => {
    function handleClickOutside(event) {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }

      if (!desktopSearchRef.current?.contains(event.target) && !mobileSearchRef.current?.contains(event.target)) {
        setDesktopSearch("");
        setMobileSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-slate-100/95 text-slate-900 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl">
       <div className="border-t border-slate-200 bg-[#161f66] text-white">
        <div className="overflow-hidden py-2">
          <div className="tt-marquee flex w-max items-center">
            <div className="flex shrink-0 items-center gap-10 px-5">
              <span className="text-sm font-semibold whitespace-nowrap text-white/95">
                Only a Few Left in Stock
              </span>
              <span className="text-sm font-semibold whitespace-nowrap text-white/70">
                •
              </span>
              <span className="text-sm font-semibold whitespace-nowrap text-white/95">
                Order Before It&apos;s Gone
              </span>
              <span className="text-sm font-semibold whitespace-nowrap text-white/70">
                •
              </span>
              <span className="text-sm font-semibold whitespace-nowrap text-white/95">
                Trending Picks Are Selling Fast
              </span>
            </div>
            <div aria-hidden="true" className="flex shrink-0 items-center gap-10 px-5">
              <span className="text-sm font-semibold whitespace-nowrap text-white/95">
                Only a Few Left in Stock
              </span>
              <span className="text-sm font-semibold whitespace-nowrap text-white/70">
                •
              </span>
              <span className="text-sm font-semibold whitespace-nowrap text-white/95">
                Order Before It&apos;s Gone
              </span>
              <span className="text-sm font-semibold whitespace-nowrap text-white/70">
                •
              </span>
              <span className="text-sm font-semibold whitespace-nowrap text-white/95">
                Trending Picks Are Selling Fast
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between sm:h-24">
          <div className="flex shrink-0 items-center overflow-visible">
            <Link href="/" className="group flex items-center gap-2">
              <img
                src="/assets/trust-1.png"
                alt="TrustTrove Logo"
                className="-ml-3 h-16 w-auto max-w-none object-contain object-left transition-transform group-hover:scale-105 sm:-ml-4 sm:h-20 md:-ml-5 md:h-24"
              />
            </Link>
          </div>

          <div className="hidden items-center space-x-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-600 hover:text-[var(--brand-navy)]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {isLoggedIn ? (
              <div ref={profileMenuRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-900 transition hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
                    <User size={18} strokeWidth={2.5} />
                  </span>
                  <span className="hidden text-left leading-tight lg:block">
                    <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Trove, welcome
                    </span>
                    <span className="block max-w-28 truncate text-sm font-bold text-slate-900">
                      {welcomeName}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isProfileOpen ? (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] w-56 rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-xl">
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsProfileOpen(false)}
                        className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                      >
                        Logout
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/signin"
                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-900 transition hover:bg-slate-50 sm:flex"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
                  <User size={18} strokeWidth={2.5} />
                </span>
                <span className="hidden leading-tight lg:block">
                  <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    My account
                  </span>
                  <span className="block max-w-28 truncate text-sm font-bold text-slate-900">
                    Sign in
                  </span>
                </span>
              </Link>
            )}

            <div ref={desktopSearchRef} className="relative hidden md:block">
              <form action="/shop" className="hidden items-center md:flex">
                <div
                  className={`flex items-center overflow-hidden rounded-full border border-slate-200 bg-white transition-all duration-300 ${
                    isSearchOpen ? "w-80 px-2 py-1.5" : "w-11 justify-center"
                  }`}
                >
                  <button
                    className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
                    onClick={() => setIsSearchOpen((open) => !open)}
                    type="button"
                    aria-label="Toggle search"
                  >
                    <Search size={18} strokeWidth={2.5} />
                  </button>
                  {isSearchOpen ? (
                    <input
                      name="q"
                      type="text"
                      placeholder="Search products or categories..."
                      value={desktopSearch}
                      onChange={(event) => setDesktopSearch(event.target.value)}
                      className="ml-2 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  ) : null}
                </div>
              </form>
              {isSearchOpen ? (
                <SearchSuggestions
                  results={desktopResults}
                  query={desktopSearch}
                  onSelect={() => {
                    setDesktopSearch("");
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-0 top-[calc(100%+0.75rem)] w-96"
                />
              ) : null}
            </div>

            <button
              className="rounded-full p-2 text-slate-700 transition hover:bg-slate-200 md:hidden"
              onClick={() => setIsSearchOpen((open) => !open)}
              aria-label="Toggle search"
            >
              <Search size={20} strokeWidth={2.5} />
            </button>

            {user?.isAdmin ? (
              <Link
                href="/admin"
                aria-label="Admin dashboard"
                className="relative rounded-full p-2 text-slate-700 transition hover:bg-slate-200"
              >
                <LayoutDashboard size={20} strokeWidth={2.5} />
              </Link>
            ) : null}

            <Link href="/cart" className="relative rounded-full p-2 text-slate-700 transition hover:bg-slate-200">
              <ShoppingBag size={20} strokeWidth={2.5} />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-navy)] text-[9px] font-black text-white">
                {totalItems}
              </span>
            </Link>

            <Link href="/wishlist" className="relative rounded-full p-2 text-slate-700 transition hover:bg-slate-200">
              <Heart size={20} strokeWidth={2.5} />
              {isLoggedIn ? (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-navy)] px-1 text-[9px] font-black text-white">
                  {totalWishlistItems}
                </span>
              ) : null}
            </Link>

            <button className="p-2 text-slate-900 md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

     

      {isSearchOpen ? (
        <div ref={mobileSearchRef} className="border-t border-slate-200 bg-slate-100 px-4 py-4 md:hidden sm:px-6">
          <form action="/shop" className="mx-auto max-w-7xl">
            <div className="flex items-center rounded-full border border-slate-200 bg-white px-4 py-3">
              <Search size={18} className="text-slate-500" />
              <input
                name="q"
                type="text"
                placeholder="Search products or categories..."
                value={mobileSearch}
                onChange={(event) => setMobileSearch(event.target.value)}
                className="ml-3 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </form>
          <SearchSuggestions
            results={mobileResults}
            query={mobileSearch}
            onSelect={() => {
              setMobileSearch("");
              setIsSearchOpen(false);
            }}
            className="mx-auto mt-3 max-w-7xl"
          />
        </div>
      ) : null}

      {isOpen ? (
        <div className="absolute left-0 top-full w-full space-y-4 border-b border-slate-200 bg-slate-100 px-4 py-6 shadow-xl md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block text-lg font-black uppercase tracking-[0.18em] text-slate-900"
            >
              {item.label}
            </Link>
          ))}
          <hr className="border-slate-200" />
          {user?.isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
                <LayoutDashboard size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                  Admin
                </span>
                <span className="block truncate text-sm font-bold text-slate-900">Open dashboard</span>
              </span>
            </Link>
          ) : null}
          <Link
            href="/cart"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
              <ShoppingBag size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                Cart
              </span>
              <span className="block truncate text-sm font-bold text-slate-900">{totalItems} item(s)</span>
            </span>
          </Link>
          <Link
            href={isLoggedIn ? "/wishlist" : "/signin?redirectTo=/wishlist"}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
              <Heart size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                Wishlist
              </span>
              <span className="block truncate text-sm font-bold text-slate-900">
                {isLoggedIn ? `${totalWishlistItems} saved item(s)` : "Sign in to save"}
              </span>
            </span>
          </Link>
          <Link
            href={isLoggedIn ? "/profile" : "/signin"}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
              <User size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                {isLoggedIn ? "Trove, welcome" : "My account"}
              </span>
              <span className="block truncate text-sm font-bold text-slate-900">
                {isLoggedIn ? welcomeName : "Sign in"}
              </span>
            </span>
          </Link>
          {isLoggedIn ? (
            <div className="space-y-2">
              {profileMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              ))}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="block w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                >
                  Logout
                </button>
              </form>
            </div>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
