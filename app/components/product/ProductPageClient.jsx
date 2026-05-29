"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Heart,
  Mail,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProductCard from "../home/ProductCard";
import { buildCartItem, getCartItemKey, useCart } from "../cart/CartProvider";
import { useWishlist } from "../wishlist/WishlistProvider";
import { getProductHref } from "../../../lib/product-route";
import { getSiteUrl } from "../../../lib/seo";

function formatPrice(value) {
  return `Rs. ${Number(value || 0)}`;
}

function stripHtml(value) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function ProductPageClient({
  product,
  relatedProducts = [],
  relatedPosts = [],
  reviewSummary = null,
  categoryPath = "/categories",
  seoCopy = null,
  faqs = [],
}) {
  const router = useRouter();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [mainImage, setMainImage] = useState(
    product?.main_image || product?.image_url || ""
  );
  const [copied, setCopied] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlistFeedback, setWishlistFeedback] = useState("");
  const { addItem, getItemAction, isItemPending } = useCart();
  const {
    isLoggedIn,
    isPending: isWishlistPending,
    isWishlisted,
    toggleWishlist,
  } = useWishlist();

  const currentVariant =
    product?.variants?.[selectedVariantIndex] || product?.variants?.[0];
  const plainDescription = useMemo(
    () => stripHtml(product?.description),
    [product?.description]
  );
  const shortSummary =
    product?.short_description ||
    plainDescription ||
    "Curated product details, trusted quality, and a clean presentation pulled directly from your catalog data.";
  const productUrl =
    typeof window !== "undefined"
      ? window.location.href
      : getSiteUrl(getProductHref(product));
  const shareText = product
    ? `Check out ${product.title} on GoModexa`
    : "Check this out on GoModexa";
  const mailHref = `mailto:?subject=${encodeURIComponent(
    shareText
  )}&body=${encodeURIComponent(`${shareText}\n\n${productUrl}`)}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `${shareText} ${productUrl}`
  )}`;
  const shouldShowReadMore = shortSummary.length > 140;

  async function handleCopyLink() {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(productUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function handleAddToCart() {
    if (!product || !currentVariant) {
      return;
    }

    await addItem(buildCartItem(product, currentVariant, 1));
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 1400);
  }

  async function handleWishlistToggle() {
    if (!product?.id) {
      return;
    }

    if (!isLoggedIn) {
      router.push(
        `/signin?redirectTo=${encodeURIComponent(getProductHref(product))}`
      );
      return;
    }

    try {
      const nextWishlistedState = !isWishlisted(product.id);
      await toggleWishlist(product.id);
      setWishlistFeedback(
        nextWishlistedState ? "Added to wishlist" : "Removed from wishlist"
      );
      window.setTimeout(() => setWishlistFeedback(""), 1600);
    } catch (error) {
      setWishlistFeedback(error?.message || "Unable to update wishlist");
      window.setTimeout(() => setWishlistFeedback(""), 2000);
    }
  }

  if (!product) {
    return null;
  }

  const savings =
    currentVariant?.price_compare > currentVariant?.price_selling
      ? Math.round(
          ((currentVariant.price_compare - currentVariant.price_selling) /
            currentVariant.price_compare) *
            100
        )
      : 0;
  const productWishlisted = isWishlisted(product.id);
  const wishlistBusy = isWishlistPending(product.id);
  const cartItemKey = getCartItemKey(product, currentVariant);
  const cartAction = getItemAction(cartItemKey);
  const cartBusy = isItemPending(cartItemKey);
  const addToCartLabel =
    cartAction === "add"
      ? "Adding..."
      : addedToCart
        ? "Added to Cart"
        : "Add to Bag";
  const averageRating = Number(reviewSummary?.averageRating || 0);
  const reviewCount = Number(reviewSummary?.reviewCount || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
        >
          <ArrowLeft size={16} /> Back to Shop
        </Link>
        <div className="hidden gap-2 text-xs text-slate-400 md:flex">
          <span>Home</span> / <span>{product.category || "Collection"}</span> /{" "}
          <span className="text-slate-900">{product.title}</span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 sm:pb-16 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="relative aspect-[4/3.2] sm:aspect-[4/3.1] lg:aspect-[4/3.15]">
                <Image
                  src={mainImage || product.main_image}
                  alt={product.title}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover"
                />
                <div className="absolute left-3 top-3 max-w-[78%] truncate rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 shadow-sm sm:left-4 sm:top-4 sm:max-w-none sm:text-[11px]">
                  {product.category || "Featured"}
                </div>
              </div>
            </div>

            {product.product_images?.length > 1 ? (
              <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2 rounded-3xl border border-slate-200 bg-white p-3 sm:grid-cols-5 sm:gap-3 sm:p-4">
                {product.product_images.map((img, index) => (
                  <button
                    key={img.id || index}
                    type="button"
                    onClick={() => setMainImage(img.src)}
                    className={`overflow-hidden rounded-2xl border transition ${
                      mainImage === img.src
                        ? "border-rose-500 ring-2 ring-rose-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt || `${product.title} view ${index + 1}`}
                      width={160}
                      height={160}
                      sizes="(max-width: 640px) 20vw, 10vw"
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                  <Sparkles size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Additional Information
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Full description and product details from your catalog.
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-200 pt-4">
                <details
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4"
                  open
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900">
                    Product Description
                    <ChevronDown
                      size={16}
                      className="transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div
                    className="prose prose-sm mt-4 max-w-none text-slate-600 prose-headings:text-slate-900 prose-strong:text-slate-900"
                    dangerouslySetInnerHTML={{
                      __html:
                        product.description || `<p>${shortSummary}</p>`,
                    }}
                  />
                </details>

                <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900">
                    Shipping & Returns
                    <ChevronDown
                      size={16}
                      className="transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Orders are usually dispatched within 24 to 48 hours and
                    delivered in 3 to 7 business days depending on location.
                    Returns can be handled for unused items with original
                    packaging intact.
                  </p>
                </details>

                <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900">
                    Product Details
                    <ChevronDown
                      size={16}
                      className="transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Vendor
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {product.vendor || "GoModexa"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Category
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {product.category || "Uncategorized"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Product Type
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {product.product_type || "General"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Selected Option
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {currentVariant?.option1_value || "Default"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        SKU
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {currentVariant?.sku || "N/A"}
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {seoCopy ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Buying Guide
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
                  {seoCopy.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {seoCopy.intro}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {seoCopy.body}
                </p>
                {Array.isArray(seoCopy.checklist) && seoCopy.checklist.length > 0 ? (
                  <ul className="mt-5 space-y-3">
                    {seoCopy.checklist.map((item) => (
                      <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {faqs.length > 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Product FAQs
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
                  Common questions before ordering
                </h2>
                <div className="mt-5 space-y-3">
                  {faqs.map((faq) => (
                    <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                        {faq.question}
                        <ChevronDown
                          size={16}
                          className="shrink-0 transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2 text-amber-500">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} size={14} fill="currentColor" />
                ))}
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Trusted pick
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                {product.title}
              </h1>

              <div className="mt-3">
                <p
                  className={`text-sm leading-6 text-slate-600 ${
                    showFullSummary ? "" : "line-clamp-3"
                  }`}
                >
                  {shortSummary}
                </p>
                {shouldShowReadMore ? (
                  <button
                    type="button"
                    onClick={() => setShowFullSummary((current) => !current)}
                    className="mt-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700"
                  >
                    {showFullSummary ? "Read less" : "Read more"}
                  </button>
                ) : null}
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-2xl font-bold text-slate-950 sm:text-3xl">
                    {formatPrice(currentVariant?.price_selling)}
                  </span>
                  {currentVariant?.price_compare >
                  currentVariant?.price_selling ? (
                    <>
                      <span className="text-base text-slate-400 line-through">
                        {formatPrice(currentVariant.price_compare)}
                      </span>
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-semibold text-rose-700">
                        {savings}% off
                      </span>
                    </>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Inclusive of all taxes
                </p>
              </div>

              {product.variants?.length > 1 ? (
                <div className="mt-5 space-y-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Select Option:{" "}
                    <span className="text-slate-600">
                      {currentVariant?.option1_value}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, index) => (
                      <button
                        key={variant.sku || index}
                        type="button"
                        onClick={() => setSelectedVariantIndex(index)}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                          selectedVariantIndex === index
                            ? "border-rose-500 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {variant.option1_value}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => void handleAddToCart()}
                  disabled={cartBusy}
                  className={`hidden h-14 w-full items-center justify-center gap-3 rounded-xl bg-[var(--brand-navy)] text-base font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-navy)] md:flex ${
                    cartBusy ? "cursor-wait opacity-70" : "hover:bg-slate-800"
                  }`}
                >
                  <ShoppingBag size={20} /> {addToCartLabel}
                </button>

                <button
                  type="button"
                  onClick={() => void handleWishlistToggle()}
                  disabled={wishlistBusy}
                  className={`hidden h-14 w-full items-center justify-center gap-3 rounded-xl border text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-navy)] md:flex ${
                    productWishlisted
                      ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
                  } ${wishlistBusy ? "cursor-wait opacity-70" : ""}`}
                >
                  <Heart
                    size={20}
                    className={productWishlisted ? "fill-current" : ""}
                  />
                  {wishlistBusy
                    ? "Updating..."
                    : productWishlisted
                      ? "Wishlisted"
                      : "Wishlist"}
                </button>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <a
                    href={mailHref}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    <Mail size={16} /> Email
                  </a>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition hover:border-slate-400 sm:col-span-1"
                  >
                    <Copy size={16} /> {copied ? "Copied" : "Copy Link"}
                  </button>
                </div>

                {wishlistFeedback ? (
                  <p className="text-sm font-medium text-slate-600">
                    {wishlistFeedback}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {averageRating > 0 && reviewCount > 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Store rating
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">
                        {averageRating}/5 from {reviewCount} approved customer review{reviewCount === 1 ? "" : "s"}
                      </p>
                      <p className="mt-1 text-xs leading-6 text-slate-500">
                        This reflects the overall GoModexa shopping experience and helps new visitors gauge trust before ordering.
                      </p>
                    </div>
                    <Link
                      href="/share-feedback"
                      className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700"
                    >
                      Add rating
                    </Link>
                  </div>
                </div>
              ) : null}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-slate-100 p-3 text-slate-900">
                    <Truck size={18} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Dispatch
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      Ships in 24-48 hours
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-slate-100 p-3 text-slate-900">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Promise
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      Quality checked
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Discovery links
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950 sm:text-xl">
                Keep exploring this product topic
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={categoryPath}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-400"
                >
                  Shop {product.category || product.product_type || "Category"}
                </Link>
                <Link
                  href="/blogs"
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-400"
                >
                  Read buying guides
                </Link>
              </div>
              {relatedPosts.length > 0 ? (
                <div className="mt-5 grid gap-3">
                  {relatedPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blogs/${post.slug}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-400 hover:bg-white"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {post.category}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                        {post.title}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                More to Explore
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
                Related Products
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-slate-900 transition hover:text-slate-600"
            >
              View Full Shop
            </Link>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
              <p className="text-lg font-semibold text-slate-700">
                More related products will appear here as your catalog grows.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/96 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(15,23,42,0.24)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl gap-3">
          <button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={cartBusy}
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand-navy)] px-4 text-sm font-semibold text-white transition ${
              cartBusy ? "cursor-wait opacity-70" : "hover:bg-slate-800"
            }`}
          >
            <ShoppingBag size={18} />
            {addToCartLabel}
          </button>
          <button
            type="button"
            onClick={() => void handleWishlistToggle()}
            disabled={wishlistBusy}
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
              productWishlisted
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-white text-slate-800"
            } ${wishlistBusy ? "cursor-wait opacity-70" : "hover:border-slate-400"}`}
          >
            <Heart
              size={18}
              className={productWishlisted ? "fill-current" : ""}
            />
            {wishlistBusy
              ? "Updating..."
              : productWishlisted
                ? "Wishlisted"
                : "Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
}
