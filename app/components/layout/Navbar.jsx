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

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchScore(item, normalizedQuery) {
  if (!normalizedQuery) {
    return 0;
  }

  const title = normalizeSearchText(item.title);
  const category = normalizeSearchText(item.category);
  const slug = normalizeSearchText(item.slug);
  const vendor = normalizeSearchText(item.vendor);
  const handle = normalizeSearchText(item.handle);
  const queryTerms = normalizedQuery.split(" ").filter(Boolean);

  let score = 0;

  if (title === normalizedQuery) score += 120;
  if (slug === normalizedQuery) score += 100;
  if (title.startsWith(normalizedQuery)) score += 80;
  if (category.startsWith(normalizedQuery)) score += 40;
  if (vendor.startsWith(normalizedQuery)) score += 20;
  if (title.includes(normalizedQuery)) score += 35;
  if (category.includes(normalizedQuery)) score += 18;
  if (slug.includes(normalizedQuery)) score += 28;
  if (handle.includes(normalizedQuery)) score += 22;

  for (const term of queryTerms) {
    if (title.includes(term)) score += 8;
    if (category.includes(term)) score += 4;
    if (vendor.includes(term)) score += 3;
    if (slug.includes(term) || handle.includes(term)) score += 5;
  }

  return score;
}

function buildSearchResults(items, query) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return { products: [], categories: [] };
  }

  const products = items
    .map((item) => ({
      item,
      score: getSearchScore(item, normalizedQuery),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title))
    .map(({ item }) => item)
    .slice(0, 6);

  const categories = [];
  const seenCategories = new Set();

  for (const item of items) {
    const label = String(item.category || "");

    if (!normalizeSearchText(label).includes(normalizedQuery) || seenCategories.has(item.categorySlug)) {
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
      <div className={`rounded-[1.6rem] border border-[var(--line)] bg-[rgba(255,253,250,0.98)] p-4 shadow-[0_24px_60px_-40px_rgba(20,29,96,0.28)] backdrop-blur ${className}`}>
        <p className="text-sm font-bold text-[var(--brand-navy)]">No matches found</p>
        <p className="mt-1 text-sm text-slate-500">Try a product name or category keyword.</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[rgba(255,253,250,0.98)] p-2 shadow-[0_24px_60px_-40px_rgba(20,29,96,0.28)] backdrop-blur ${className}`}>
      <div className="max-h-[26rem] overflow-y-auto pr-1 sm:max-h-[30rem]">
        {results.products.length ? (
          <div>
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-navy)]/45">Products</p>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {results.products.length} suggestions
              </span>
            </div>
          {results.products.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onSelect}
              className="flex items-center gap-3 rounded-[1.1rem] px-3 py-3 transition hover:bg-[var(--surface-soft)]"
            >
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)]">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingBag size={16} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="truncate rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--brand-navy)]/70">
                    {item.category}
                  </span>
                  {item.vendor ? (
                    <span className="truncate text-[11px] text-slate-500">{item.vendor}</span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
          </div>
        ) : null}

        {results.categories.length ? (
          <div className={results.products.length ? "border-t border-[var(--line-soft)] pt-2" : ""}>
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-navy)]/45">Categories</p>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {results.categories.length} matches
              </span>
            </div>
            <div className="flex flex-wrap gap-2 px-3 pb-2 pt-1">
              {results.categories.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onSelect}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-700 transition hover:bg-[var(--surface-soft)] hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Navbar({ user, navbarSearchItems = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [desktopSearch, setDesktopSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const [desktopRemoteItems, setDesktopRemoteItems] = useState([]);
  const [mobileRemoteItems, setMobileRemoteItems] = useState([]);
  const profileMenuRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const welcomeName = getWelcomeName(user);
  const isLoggedIn = Boolean(user);
  const deferredDesktopSearch = useDeferredValue(desktopSearch);
  const deferredMobileSearch = useDeferredValue(mobileSearch);
  const desktopSearchItems =
    deferredDesktopSearch.trim().length >= 2 && desktopRemoteItems.length ? desktopRemoteItems : navbarSearchItems;
  const mobileSearchItems =
    deferredMobileSearch.trim().length >= 2 && mobileRemoteItems.length ? mobileRemoteItems : navbarSearchItems;
  const desktopResults = useMemo(
    () => buildSearchResults(desktopSearchItems, deferredDesktopSearch),
    [deferredDesktopSearch, desktopSearchItems]
  );
  const mobileResults = useMemo(
    () => buildSearchResults(mobileSearchItems, deferredMobileSearch),
    [deferredMobileSearch, mobileSearchItems]
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

  useEffect(() => {
    const normalizedQuery = deferredDesktopSearch.trim();

    if (normalizedQuery.length < 2) {
      return undefined;
    }

    const controller = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(normalizedQuery)}&limit=30`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to search products.");
        }

        setDesktopRemoteItems(payload.items || []);
      })
      .catch((error) => {
        if (error?.name === "AbortError") {
          return;
        }

        console.error("Desktop navbar search failed:", error);
        setDesktopRemoteItems([]);
      });

    return () => controller.abort();
  }, [deferredDesktopSearch]);

  useEffect(() => {
    const normalizedQuery = deferredMobileSearch.trim();

    if (normalizedQuery.length < 2) {
      return undefined;
    }

    const controller = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(normalizedQuery)}&limit=30`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to search products.");
        }

        setMobileRemoteItems(payload.items || []);
      })
      .catch((error) => {
        if (error?.name === "AbortError") {
          return;
        }

        console.error("Mobile navbar search failed:", error);
        setMobileRemoteItems([]);
      });

    return () => controller.abort();
  }, [deferredMobileSearch]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--line)] bg-[rgba(252,248,241,0.94)] text-slate-900 shadow-[0_18px_44px_-34px_rgba(20,29,96,0.32)] backdrop-blur-xl">
      <div className="border-b border-[var(--line)] bg-[var(--brand-navy)] text-white">
        <div className="overflow-hidden py-2">
          <div className="tt-marquee flex w-max items-center">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} aria-hidden={index === 1} className="flex shrink-0 items-center gap-10 px-5">
                <span className="text-xs font-extrabold uppercase tracking-[0.18em] whitespace-nowrap text-[var(--brand-gold)]">
                  GoModexa Edit
                </span>
                <span className="text-sm font-semibold whitespace-nowrap text-white/70">/</span>
                <span className="text-sm font-semibold whitespace-nowrap text-white/95">Only a Few Left in Stock</span>
                <span className="text-sm font-semibold whitespace-nowrap text-white/70">/</span>
                <span className="text-sm font-semibold whitespace-nowrap text-white/95">Order Before It&apos;s Gone</span>
                <span className="text-sm font-semibold whitespace-nowrap text-white/70">/</span>
                <span className="text-sm font-semibold whitespace-nowrap text-white/95">Trending Picks Are Selling Fast</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--line)] bg-[rgba(255,253,250,0.96)]">
        <div className="overflow-hidden py-2">
          <div className="tt-marquee flex w-max items-center">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} aria-hidden={index === 1} className="flex shrink-0 items-center gap-4 px-5">
                <span className="rounded-full bg-[var(--brand-navy)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] whitespace-nowrap text-white">
                  Dropshipping Notice
                </span>
                <p className="text-xs font-semibold whitespace-nowrap text-slate-600 sm:text-sm">
                  We work as a dropshipping mediator, helping arrange your product with our supplier network and guiding your order through fulfillment.
                </p>
                <span className="text-sm font-semibold whitespace-nowrap text-slate-300">/</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between gap-3 sm:h-24 sm:gap-6">
          <div className="flex items-center md:hidden">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition hover:bg-[var(--surface-soft)]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 md:static md:left-auto md:translate-x-0">
            <Link href="/" className="group flex items-center justify-center gap-2">
              <img
                src="/assets/gomodexa-13.png"
                alt="GoModexa Logo"
                className="h-20 w-auto max-w-none object-contain transition-transform group-hover:scale-105 sm:h-10 md:-ml-4 md:h-30"
              />
            </Link>
          </div>

          <div className="hidden items-center space-x-7 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display text-[1.05rem] font-semibold tracking-[0.01em] text-slate-700 hover:text-[var(--brand-navy)]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center justify-end gap-0.5 sm:gap-4">
            {isLoggedIn ? (
              <div ref={profileMenuRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/90 px-3 py-2 text-slate-900 shadow-[0_18px_40px_-34px_rgba(20,29,96,0.22)] transition hover:bg-[var(--surface-soft)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
                    <User size={18} strokeWidth={2.5} />
                  </span>
                  <span className="hidden text-left leading-tight lg:block">
                    <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[var(--brand-navy)]/42">
                    GoModexa, welcome
                    </span>
                    <span className="block max-w-28 truncate font-display text-lg font-semibold text-[var(--brand-navy)]">
                      {welcomeName}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--brand-navy)]/56 transition ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isProfileOpen ? (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] w-56 rounded-[1.6rem] border border-[var(--line)] bg-[rgba(255,253,250,0.98)] p-2 shadow-[0_30px_80px_-48px_rgba(20,29,96,0.34)] backdrop-blur">
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsProfileOpen(false)}
                        className="block rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-[var(--surface-soft)] hover:text-slate-950"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="block w-full rounded-[1rem] px-4 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50"
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
                className="hidden items-center gap-2 rounded-full border border-[var(--line)] bg-white/90 px-3 py-2 text-slate-900 shadow-[0_18px_40px_-34px_rgba(20,29,96,0.22)] transition hover:bg-[var(--surface-soft)] sm:flex"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
                  <User size={18} strokeWidth={2.5} />
                </span>
                <span className="hidden leading-tight lg:block">
                  <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[var(--brand-navy)]/42">
                    My account
                  </span>
                  <span className="block max-w-28 truncate font-display text-lg font-semibold text-[var(--brand-navy)]">
                    Sign in
                  </span>
                </span>
              </Link>
            )}

            <div ref={desktopSearchRef} className="relative hidden md:block">
              <form action="/shop" className="hidden items-center md:flex">
                <div
                  className={`flex items-center overflow-hidden rounded-full border border-[var(--line)] bg-white/90 shadow-[0_18px_40px_-34px_rgba(20,29,96,0.18)] transition-all duration-300 ${
                    isSearchOpen ? "w-80 px-2 py-1.5" : "w-11 justify-center"
                  }`}
                >
                  <button
                    className="rounded-full p-2 text-slate-600 hover:bg-[var(--surface-soft)]"
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
              className="rounded-full p-1 text-slate-700 transition hover:bg-[var(--surface-soft)] md:hidden"
              onClick={() => setIsSearchOpen((open) => !open)}
              aria-label="Toggle search"
            >
              <Search size={17} strokeWidth={2.2} />
            </button>

            {user?.isAdmin ? (
              <Link
                href="/admin"
                aria-label="Admin dashboard"
                className="relative rounded-full p-2 text-slate-700 transition hover:bg-[var(--surface-soft)]"
              >
                <LayoutDashboard size={20} strokeWidth={2.5} />
              </Link>
            ) : null}

            <Link
              href="/cart"
              className="relative rounded-full p-1 text-slate-700 transition hover:bg-[var(--surface-soft)] sm:p-2"
            >
              <ShoppingBag size={17} strokeWidth={2.2} className="sm:h-5 sm:w-5" />
              <span className="absolute right-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--brand-navy)] px-0.5 text-[8px] font-black text-white sm:right-1 sm:top-1 sm:h-4 sm:min-w-4 sm:px-1 sm:text-[9px]">
                {totalItems}
              </span>
            </Link>

            <Link
              href="/wishlist"
              className="relative rounded-full p-1 text-slate-700 transition hover:bg-[var(--surface-soft)] sm:p-2"
            >
              <Heart size={17} strokeWidth={2.2} className="sm:h-5 sm:w-5" />
              {isLoggedIn ? (
                <span className="absolute right-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--brand-navy)] px-0.5 text-[8px] font-black text-white sm:right-1 sm:top-1 sm:h-4 sm:min-w-4 sm:px-1 sm:text-[9px]">
                  {totalWishlistItems}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      {isSearchOpen ? (
        <div ref={mobileSearchRef} className="border-t border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 md:hidden sm:px-6">
          <form action="/shop" className="mx-auto max-w-7xl">
            <div className="flex items-center rounded-full border border-[var(--line)] bg-white px-4 py-3">
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
        <div className="absolute left-0 top-full w-full space-y-4 border-b border-[var(--line)] bg-[rgba(252,248,241,0.98)] px-4 py-6 shadow-[0_28px_70px_-48px_rgba(20,29,96,0.32)] backdrop-blur md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block font-display text-[1rem] font-semibold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[1.8rem]"
            >
              {item.label}
            </Link>
          ))}
          <hr className="border-[var(--line)]" />
          {user?.isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-slate-900"
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
            className="flex items-center gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-slate-900"
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
            className="flex items-center gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-slate-900"
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
            className="flex items-center gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-slate-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
              <User size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                {isLoggedIn ? "GoModexa, welcome" : "My account"}
              </span>
              <span className="block truncate text-sm font-bold text-slate-900">
                {isLoggedIn ? welcomeName : "Sign in"}
              </span>
            </span>
          </Link>
          {isLoggedIn ? (
            <p className="rounded-[1.25rem] border border-dashed border-[var(--line)] bg-white/70 px-4 py-3 text-xs font-semibold text-slate-500">
              Use the bottom Profile tab to open My Profile, Orders, Addresses, Wishlist, and more.
            </p>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
