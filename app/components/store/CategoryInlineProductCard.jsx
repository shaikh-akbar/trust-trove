"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { buildCartItem, getCartItemKey, useCart } from "../cart/CartProvider";
import { getProductHref } from "../../../lib/product-route";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=80";

function formatPrice(value) {
  return `Rs. ${Number(value || 0)}`;
}

export default function CategoryInlineProductCard({ product, showNewBadge = false }) {
  const { addItem, isItemPending } = useCart();
  const [added, setAdded] = useState(false);
  const productHref = getProductHref(product);
  const variant = product?.variants?.[0];
  const cartItemKey = getCartItemKey(product, variant);
  const cartBusy = isItemPending(cartItemKey);
  const inventory = Number(
    product?.inventory_quantity ??
      variant?.inventory_quantity ??
      product?.primary_variant?.inventory_quantity ??
      0
  );

  async function handleAddToCart() {
    await addItem(buildCartItem(product, variant, 1));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-white p-3 shadow-[0_20px_48px_-40px_rgba(8,15,43,0.24)]">
      <Link href={productHref} className="block">
        <div className="relative overflow-hidden rounded-[1rem] bg-[var(--surface-soft)]">
          {showNewBadge ? (
            <span className="absolute left-3 top-3 z-10 inline-flex rounded-md bg-[#ff4d6d] px-2 py-1 text-[10px] font-extrabold uppercase text-white">
              New
            </span>
          ) : null}
          <img
            src={product.main_image || product.image_url || FALLBACK_IMAGE}
            alt={product.title}
            className="aspect-[1/1.04] w-full object-cover"
          />
        </div>
      </Link>
      <p className="mt-3 text-xs font-medium text-slate-400">
        {product.categoryLabel || product.category}
      </p>
      <Link href={productHref} className="block">
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-900 sm:text-[15px] sm:leading-6">
          {product.title}
        </h3>
      </Link>
      <div className="mt-3 flex items-end gap-2">
        <p className="text-base font-black text-[var(--brand-navy)] sm:text-lg">
          {formatPrice(product.price_selling)}
        </p>
        {product.price_compare > product.price_selling ? (
          <p className="text-xs text-slate-400 line-through">
            {formatPrice(product.price_compare)}
          </p>
        ) : null}
      </div>
      {Number.isFinite(inventory) ? (
        <p className="mt-1.5 text-xs font-medium text-emerald-700">
          {inventory} pcs left
        </p>
      ) : null}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => void handleAddToCart()}
          disabled={cartBusy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-navy)] px-3 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white disabled:cursor-wait disabled:opacity-70"
        >
          {cartBusy ? "Adding" : added ? "Added" : "Add to Bag"}
          <ShoppingBag size={14} />
        </button>
      </div>
    </article>
  );
}
