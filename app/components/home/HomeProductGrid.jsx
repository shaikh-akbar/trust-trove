"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";

const INITIAL_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function HomeProductGrid({ products }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = products.length > visibleCount;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + LOAD_MORE_COUNT)}
            className="inline-flex rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)] transition hover:border-slate-500 hover:bg-slate-50"
          >
            Load More
          </button>
        </div>
      ) : null}
    </div>
  );
}
