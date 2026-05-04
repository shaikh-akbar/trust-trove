"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";
import { buildCartItem, useCart } from "../cart/CartProvider";

function formatPrice(value) {
  return `Rs. ${Number(value || 0)}`;
}

function getProductImage(product) {
  return product?.image_url || product?.main_image || product?.product_images?.[0]?.src || "";
}

function getComparePrice(product, sellingPrice) {
  return Number(
    product?.price_compare ||
      product?.variants?.[0]?.price_compare ||
      (sellingPrice > 0 ? Math.round(sellingPrice * 1.35) : 0)
  );
}

export default function FeaturedProducts({ products = [] }) {
  const { addItem } = useCart();
  const primaryProduct = products[0];
  const secondaryProducts = products.slice(1, 5);

  if (!primaryProduct) {
    return null;
  }

  const primaryTitle = primaryProduct?.name || primaryProduct?.title || "Featured Product";
  const primaryImage = getProductImage(primaryProduct);
  const primaryPrice = Number(primaryProduct?.price_selling || primaryProduct?.variants?.[0]?.price_selling || 0);
  const primaryComparePrice = getComparePrice(primaryProduct, primaryPrice);
  const primaryDescription =
    primaryProduct?.short_description ||
    primaryProduct?.description ||
    "Handpicked from the latest arrivals to give the homepage a stronger feature moment.";

  function handleAddPrimary() {
    void addItem(buildCartItem(primaryProduct, primaryProduct?.variants?.[0], 1));
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,#f9f6ef_0%,#ffffff_42%,#eef3ff_100%)] shadow-[0_32px_90px_-60px_rgba(8,15,43,0.38)]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute left-[-4rem] top-[-4rem] h-44 w-44 rounded-full bg-amber-100/70 blur-3xl" />
            <div className="absolute bottom-[-4rem] right-[-2rem] h-52 w-52 rounded-full bg-sky-100/60 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-amber-700 backdrop-blur">
                <Star size={14} className="fill-current" />
                Featured Products
              </div>

              <h2 className="mt-5 max-w-xl font-display text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Handpicked products with a stronger spotlight on the homepage.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Discover a premium mix of trending picks, standout pricing, and faster product entry points without
                scanning the full grid first.
              </p>

              <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.45)]">
                <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
                  <Link href={`/product/${primaryProduct.id}`} className="relative block bg-slate-100">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={primaryTitle}
                        className="aspect-[4/4.3] h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/4.3] items-center justify-center text-sm font-bold text-slate-400">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(15,23,42,0.5)_100%)]" />
                    {primaryComparePrice > primaryPrice ? (
                      <span className="absolute left-4 top-4 rounded-full bg-[#161f66] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                        Save {Math.round(((primaryComparePrice - primaryPrice) / primaryComparePrice) * 100)}%
                      </span>
                    ) : null}
                  </Link>

                  <div className="flex flex-col justify-between p-5 sm:p-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                        {primaryProduct.category || primaryProduct.product_type || "Featured Collection"}
                      </p>
                      <Link href={`/product/${primaryProduct.id}`}>
                        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-[-0.03em] text-[var(--brand-navy)] sm:text-3xl">
                          {primaryTitle}
                        </h3>
                      </Link>
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        {primaryDescription}
                      </p>
                    </div>

                    <div className="mt-6">
                      <div className="flex flex-wrap items-end gap-3">
                        <span className="text-3xl font-black tracking-tight text-slate-950">
                          {formatPrice(primaryPrice)}
                        </span>
                        {primaryComparePrice > primaryPrice ? (
                          <span className="text-sm font-semibold text-slate-400 line-through">
                            {formatPrice(primaryComparePrice)}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <Link
                          href={`/product/${primaryProduct.id}`}
                          aria-label={`View ${primaryTitle}`}
                          className="inline-flex h-13 w-13 items-center justify-center rounded-full bg-[#161f66] text-white transition hover:bg-[#10184f]"
                        >
                          <ArrowRight size={18} className="shrink-0" />
                        </Link>
                        <button
                          type="button"
                          onClick={handleAddPrimary}
                          aria-label={`Add ${primaryTitle} to cart`}
                          className="inline-flex h-13 w-13 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition hover:border-[#161f66] hover:bg-[#161f66]/5 hover:text-[#161f66]"
                        >
                          <ShoppingCart size={18} className="shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--line)] bg-white/70 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">More highlights</p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Quick picks
                </h3>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.18em] text-[var(--brand-navy)]"
              >
                Shop all <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {secondaryProducts.map((product, index) => {
                const title = product?.name || product?.title || "Product";
                const image = getProductImage(product);
                const price = Number(product?.price_selling || product?.variants?.[0]?.price_selling || 0);
                const comparePrice = getComparePrice(product, price);

                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group flex items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-3 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:border-slate-300"
                  >
                    <div className="relative h-22 w-20 overflow-hidden rounded-[1rem] bg-slate-100">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Featured 0{index + 2}
                      </p>
                      <h4 className="mt-1 line-clamp-2 font-display text-lg font-semibold leading-tight tracking-[-0.02em] text-slate-950">
                        {title}
                      </h4>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-base font-black text-[var(--brand-navy)]">{formatPrice(price)}</span>
                        {comparePrice > price ? (
                          <span className="text-xs font-semibold text-slate-400 line-through">
                            {formatPrice(comparePrice)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
