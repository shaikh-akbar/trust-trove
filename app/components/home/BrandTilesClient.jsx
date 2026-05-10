"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";

function buildBrandDescription(brand) {
  if (brand?.description) {
    return brand.description;
  }

  return `Explore ${brand.title} products in a dedicated brand page with pagination and focused browsing.`;
}

function formatProductCount(count) {
  return `${count} ${count === 1 ? "product" : "products"}`;
}

export default function BrandTilesClient({ brands = [] }) {
  const [query, setQuery] = useState("");

  const filteredBrands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sortedBrands = [...brands].sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.title.localeCompare(right.title);
    });

    if (!normalizedQuery) {
      return sortedBrands;
    }

    return sortedBrands.filter((brand) => {
      const searchableText = [brand.title, brand.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [brands, query]);

  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-white p-4 shadow-[0_24px_70px_-52px_rgba(20,29,96,0.18)] sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--brand-navy)]/45">
            {filteredBrands.length} brands
          </p>
          <p className="mt-1 text-sm text-slate-500">Search brand name and open its dedicated product page.</p>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search brand"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-navy)] focus:bg-white"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear brand search"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {filteredBrands.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <p className="text-lg font-semibold text-slate-700">No brand matched your search.</p>
          <p className="mt-2 text-sm text-slate-500">Try a different brand name or clear the search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {filteredBrands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="group rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#faf7f2_100%)] p-3 text-center shadow-[0_16px_34px_-30px_rgba(20,29,96,0.16)] transition hover:-translate-y-1 hover:shadow-[0_22px_44px_-30px_rgba(20,29,96,0.22)] sm:p-4"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.4rem] border-4 border-[var(--surface-soft)] bg-[linear-gradient(135deg,#eef2ff_0%,#f8fafc_50%,#fff7ed_100%)] shadow-[0_18px_32px_-24px_rgba(20,29,96,0.24)] sm:h-24 sm:w-24">
                {brand.image ? (
                  <img
                    src={brand.image}
                    alt={brand.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="px-3 text-center font-display text-base font-semibold leading-tight text-[var(--brand-navy)]">
                    {brand.title}
                  </span>
                )}
              </div>
              <h3 className="mt-4 line-clamp-2 font-display text-base font-semibold leading-tight text-[var(--brand-navy)] sm:text-lg">
                {brand.title}
              </h3>
              <p className="mt-2 inline-flex rounded-full border border-[var(--brand-navy)]/12 bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--brand-navy)]/72">
                {formatProductCount(brand.count)}
              </p>
              <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500 sm:text-sm">
                {buildBrandDescription(brand)}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--brand-navy)]/56">
                <span>Explore brand</span>
                <ArrowRight size={12} className="transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
