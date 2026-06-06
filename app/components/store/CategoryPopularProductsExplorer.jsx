"use client";

import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import CategoryInlineProductCard from "./CategoryInlineProductCard";

const PAGE_SIZE = 12;
function normalizeProductPool(products) {
  const seen = new Set();

  return (products || []).filter((product) => {
    const key = String(product?.id || product?.slug || product?.handle || "");

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export default function CategoryPopularProductsExplorer({ products = [] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const normalizedProducts = normalizeProductPool(products);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = normalizedProducts.filter((product) => {
    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      product?.title,
      product?.name,
      product?.categoryLabel,
      product?.category,
      product?.short_description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-[1.45rem] font-semibold text-[var(--brand-navy)] sm:text-3xl">
            Top Products from Popular Categories
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Browse a wider product mix from the categories shoppers open most often.
          </p>
        </div>
        <label className="relative block w-full lg:max-w-sm">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={17} />
          </span>
          <input
            type="search"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search products in popular categories"
            className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-navy)]/30"
          />
        </label>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <CategoryInlineProductCard
              key={`popular-grid-${product.id}`}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.35rem] border border-[var(--line)] bg-white px-5 py-10 text-center text-sm leading-7 text-slate-500">
          No matching products were found in the popular category section.
        </div>
      )}

      {filteredProducts.length > PAGE_SIZE ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-[var(--line)] bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage === 1}
            className="inline-flex items-center rounded-full border border-[var(--line)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--brand-navy)] disabled:pointer-events-none disabled:bg-[var(--surface-soft)] disabled:text-slate-400"
          >
            Previous
          </button>
          <p className="text-sm font-semibold text-slate-500">
            Page {safePage} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={safePage === totalPages}
            className="inline-flex items-center rounded-full border border-[var(--line)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--brand-navy)] disabled:pointer-events-none disabled:bg-[var(--surface-soft)] disabled:text-slate-400"
          >
            Next
            <ArrowRight size={14} className="ml-2" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
