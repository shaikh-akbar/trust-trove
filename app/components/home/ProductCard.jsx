"use client";

import React, { useState } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import Link from 'next/link';
import { buildCartItem, useCart } from '../cart/CartProvider';

export default function ProductCard({ product, compact = false }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const title = product?.name || product?.title || 'Untitled Product';
  const imageUrl = product?.image_url || product?.main_image || product?.product_images?.[0]?.src || '';
  const sellingPrice = Number(product?.price_selling || product?.variants?.[0]?.price_selling || 0);
  const comparePrice = Number(
    product?.price_compare ||
      product?.variants?.[0]?.price_compare ||
      (sellingPrice > 0 ? Math.round(sellingPrice * 1.4) : 0)
  );
  const description = product?.short_description || product?.description || 'Freshly added to the latest drops collection.';

  function handleAddToCart() {
    void addItem(buildCartItem(product, product?.variants?.[0], 1));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  const cardClassName = compact
    ? "group flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-[var(--line)] bg-white shadow-[0_18px_48px_-36px_rgba(8,15,43,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_-36px_rgba(8,15,43,0.4)]"
    : "group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_34px_120px_-56px_rgba(8,15,43,0.56)]";
  const imageClassName = compact ? "relative aspect-[4/3.7] overflow-hidden bg-[var(--surface-soft)]" : "relative aspect-[4/4.7] overflow-hidden bg-[var(--surface-soft)]";
  const bodyClassName = compact ? "flex flex-1 flex-col p-3" : "flex flex-1 flex-col p-5";
  const titleClassName = compact
    ? "font-display line-clamp-2 min-h-[2.5rem] text-base leading-tight text-[var(--brand-navy)] transition-colors group-hover:text-slate-700 sm:text-lg"
    : "font-display line-clamp-2 min-h-[3.5rem] text-2xl leading-tight text-[var(--brand-navy)] transition-colors group-hover:text-slate-700";
  const descriptionClassName = compact
    ? "mt-1.5 line-clamp-2 min-h-[2.25rem] text-[11px] leading-4.5 text-slate-500"
    : "mt-3 line-clamp-2 min-h-[3.25rem] text-sm leading-6 text-slate-500";
  const topMetaClassName = compact
    ? "mt-2.5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.16em] text-slate-400"
    : "mt-5 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.22em] text-slate-400";
  const priceWrapClassName = compact ? "mt-auto flex items-end justify-between pt-2.5" : "mt-auto flex items-end justify-between pt-5";
  const priceClassName = compact ? "text-base font-black tracking-tight text-[var(--brand-navy)] sm:text-lg" : "text-2xl font-black tracking-tight text-[var(--brand-navy)]";
  const cartButtonClassName = compact
    ? "rounded-xl bg-[var(--brand-navy)] p-2.5 text-white transition-all hover:scale-105 hover:bg-[#353a66] active:scale-95"
    : "rounded-2xl bg-[var(--brand-navy)] p-3 text-white transition-all hover:scale-105 hover:bg-slate-800 active:scale-95";

  return (
    <article className={cardClassName}>
      <div className={imageClassName}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--surface-soft)] text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            No Image
          </div>
        )}

        <div className={`absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(16,25,58,0.72))] ${compact ? "h-20" : "h-28"}`} />

        <Link
          href={`/product/${product.id}`}
          className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <div className={`rounded-full bg-white text-slate-900 shadow-lg transition-transform hover:scale-110 ${compact ? "p-2.5" : "p-3"}`}>
            <Eye size={compact ? 18 : 20} />
          </div>
        </Link>

        {comparePrice > sellingPrice ? (
          <span className={`absolute right-2.5 top-2.5 rounded-full bg-[var(--brand-navy)] font-black uppercase text-white ${compact ? "px-2 py-1 text-[8px] tracking-[0.16em]" : "px-3 py-1.5 text-[10px] tracking-[0.2em]"}`}>
            Save {Math.round(((comparePrice - sellingPrice) / comparePrice) * 100)}%
          </span>
        ) : null}
      </div>

      <div className={bodyClassName}>
        <Link href={`/product/${product.id}`}>
          <h3 className={titleClassName}>
            {title}
          </h3>
        </Link>
        <p className={descriptionClassName}>
          {description}
        </p>

        <div className={topMetaClassName}>
          <span>Curated pick</span>
          <Link
            href={`/product/${product.id}`}
            aria-label={`View details for ${title}`}
            className="text-[var(--brand-navy)]"
          >
            <span className="sm:hidden">
              <Eye size={compact ? 16 : 18} />
            </span>
            <span className="hidden sm:inline">View details</span>
          </Link>
        </div>

        <div className={priceWrapClassName}>
          <div className={compact ? "space-y-0.5" : "space-y-1"}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={priceClassName}>Rs. {sellingPrice}</span>
              {comparePrice > sellingPrice ? (
                <span className={compact ? "text-[10px] font-bold text-slate-400 line-through" : "text-xs font-bold text-slate-400 line-through"}>
                  Rs. {comparePrice}
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={cartButtonClassName}
            aria-label={`Add ${title} to cart`}
          >
            {added ? (
              <span className="text-[10px] font-black uppercase tracking-[0.16em]">Added</span>
            ) : (
              <ShoppingCart size={18} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
