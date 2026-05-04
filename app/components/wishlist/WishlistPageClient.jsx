"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import ProductCard from "../home/ProductCard";
import { useWishlist } from "./WishlistProvider";

export default function WishlistPageClient({ products = [] }) {
  const { productIds } = useWishlist();
  const visibleProducts = products.filter((product) => productIds.includes(product.id));

  if (!visibleProducts.length) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)] p-8 text-center shadow-[0_20px_60px_-46px_rgba(66,72,121,0.16)] sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
            <Heart size={24} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950">Your wishlist is empty</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Save standout pieces from the cart or product cards and they&apos;ll show up here for later.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#353a66]"
          >
            Explore products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Saved Products</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
          Your wishlist, ready when you are
        </h1>
        <p className="mt-2 text-sm text-slate-500">{visibleProducts.length} saved product(s).</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </section>
  );
}
