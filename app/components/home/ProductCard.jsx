"use client";

import React, { useState } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { buildCartItem, getCartItemKey, useCart } from '../cart/CartProvider';
import { getProductHref } from '../../../lib/product-route';

function isLadiesBagCategory(product) {
  const categorySignals = [
    product?.category,
    product?.categoryLabel,
    product?.product_type,
    product?.slug,
  ]
    .map((value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
    )
    .filter(Boolean);

  return categorySignals.some(
    (value) => value === 'ladiesbag' || value.includes('ladiesbag')
  );
}

function formatInventoryLabel(inventory) {
  return `${inventory} pcs left`;
}

export default function ProductCard({ product, compact = false }) {
  const { addItem, isItemPending } = useCart();
  const [added, setAdded] = useState(false);
  const title = product?.name || product?.title || 'Untitled Product';
  const imageUrl = product?.image_url || product?.main_image || product?.product_images?.[0]?.src || '';
  const categoryLabel = product?.category || product?.product_type || 'Curated edit';
  const sellingPrice = Number(product?.price_selling || product?.variants?.[0]?.price_selling || 0);
  const comparePrice = Number(
    product?.price_compare ||
      product?.variants?.[0]?.price_compare ||
      (sellingPrice > 0 ? Math.round(sellingPrice * 1.4) : 0)
  );
  const description = product?.short_description || product?.description || 'Freshly added to the latest drops collection.';
  const inventory = Number(
    product?.inventory_quantity || product?.variants?.[0]?.inventory_quantity || product?.primary_variant?.inventory_quantity || 0
  );
  const isOutOfStock = inventory <= 1;
  const hideInventoryForCategory = isLadiesBagCategory(product);

  const cartItemKey = getCartItemKey(product, product?.variants?.[0]);
  const cartBusy = isItemPending(cartItemKey);
  const productHref = getProductHref(product);

  async function handleAddToCart() {
    await addItem(buildCartItem(product, product?.variants?.[0], 1));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  const cardClassName = compact
    ? "group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-[linear-gradient(180deg,#fffdfa_0%,#f9f3ea_100%)] shadow-[0_18px_48px_-36px_rgba(8,15,43,0.26)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_-36px_rgba(8,15,43,0.36)]"
    : "group flex h-full flex-col overflow-hidden rounded-[1.95rem] border border-[var(--line)] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f2e8_100%)] shadow-[0_30px_90px_-58px_rgba(8,15,43,0.38)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_34px_120px_-56px_rgba(8,15,43,0.48)]";
  const imageClassName = compact ? "relative aspect-[4/3.5] overflow-hidden bg-[var(--surface-soft)]" : "relative aspect-[4/4.9] overflow-hidden bg-[var(--surface-soft)]";
  const bodyClassName = compact ? "flex flex-1 flex-col p-3 sm:p-3.5" : "flex flex-1 flex-col p-5";
  const titleClassName = compact
    ? "tt-clamp-2 min-h-[2.35rem] break-words text-[14px] font-normal leading-[1.24] text-[var(--brand-navy)] transition-colors group-hover:text-slate-700 sm:min-h-[2.55rem] sm:text-[15px]"
    : "line-clamp-2 min-h-[3.5rem] text-2xl font-normal leading-[1.18] text-[var(--brand-navy)] transition-colors group-hover:text-slate-700";
  const descriptionClassName = compact
    ? "tt-clamp-2 mt-1.5 min-h-[2rem] text-[11px] leading-[1.36] text-slate-500"
    : "mt-3 line-clamp-2 min-h-[3.25rem] text-sm leading-6 text-slate-500";
  const topMetaClassName = compact
    ? "mt-2.5 flex items-center justify-between gap-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400"
    : "mt-5 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.22em] text-slate-400";
  const priceWrapClassName = compact ? "mt-auto flex items-end justify-between gap-3 pt-2.5" : "mt-auto flex items-end justify-between pt-5";
  const priceClassName = compact ? "text-base font-black tracking-tight text-[var(--brand-navy)] sm:text-lg" : "text-2xl font-black tracking-tight text-[var(--brand-navy)]";
  const cartButtonClassName = compact
    ? "rounded-full bg-[var(--brand-navy)] p-2.5 text-white transition-all hover:scale-105 hover:bg-[#353a66] active:scale-95"
    : "rounded-full bg-[var(--brand-navy)] p-3 text-white transition-all hover:scale-105 hover:bg-slate-800 active:scale-95";

  return (
    <article className={cardClassName}>
      <div className={imageClassName}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            sizes={
              compact
                ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            }
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--surface-soft)] text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            No Image
          </div>
        )}

        <div className={`absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(16,25,58,0.72))] ${compact ? "h-20" : "h-28"}`} />

        <div className={`absolute bottom-3 left-3 z-10 inline-flex rounded-full border border-white/20 bg-white/88 text-[var(--brand-navy)] shadow-[0_12px_24px_-16px_rgba(20,29,96,0.28)] backdrop-blur ${compact ? "px-2.5 py-1 text-[8px] tracking-[0.16em]" : "px-3 py-1.5 text-[10px] tracking-[0.2em]"} font-black uppercase`}>
          {categoryLabel}
        </div>

        <Link
          href={productHref}
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
        <Link href={productHref}>
          <h3 className={titleClassName}>
            {title}
          </h3>
        </Link>
        <p className={descriptionClassName}>
          {description}
        </p>

        <div className={topMetaClassName}>
          <span>{comparePrice > sellingPrice ? "Limited pricing" : "Curated pick"}</span>
          <Link
            href={productHref}
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
            {!hideInventoryForCategory ? (
              <div>
                <span className={`text-xs font-semibold ${isOutOfStock ? "text-rose-600" : "text-slate-500"}`}>
                  {isOutOfStock ? "Out of stock" : formatInventoryLabel(inventory)}
                </span>
              </div>
            ) : null}
          </div>

          {isOutOfStock ? (
            <span className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-rose-700">
              Out of stock
            </span>
          ) : (
            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={cartBusy}
              className={`${cartButtonClassName} ${cartBusy ? "cursor-wait opacity-70 hover:scale-100" : ""}`}
              aria-label={`Add ${title} to cart`}
            >
              {cartBusy ? (
                <span className="text-[10px] font-black uppercase tracking-[0.16em]">Adding</span>
              ) : added ? (
                <span className="text-[10px] font-black uppercase tracking-[0.16em]">Added</span>
              ) : (
                <ShoppingCart size={18} />
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
