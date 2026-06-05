// "use client";

// import Link from "next/link";
// import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
// import { useCart } from "./CartProvider";
// import { useWishlist } from "../wishlist/WishlistProvider";

// function formatPrice(value) {
//   return `Rs. ${Number(value || 0)}`;
// }

// function QuantityButton({ onClick, children, label }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       aria-label={label}
//       className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--brand-navy)] transition hover:border-[var(--brand-navy)] hover:bg-[var(--surface-soft)]"
//     >
//       {children}
//     </button>
//   );
// }

// export default function CartPageClient() {
//   const { items, subtotal, totalItems, updateQuantity, removeItem, isHydrated, isSyncing, isLoggedIn } = useCart();
//   const { toggleWishlist, isWishlisted, isPending: isWishlistPending } = useWishlist();

//   if (!isHydrated) {
//     return (
//       <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
//         <div className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)] p-8 text-center shadow-[0_20px_60px_-46px_rgba(66,72,121,0.16)]">
//           <p className="text-sm font-semibold text-slate-500">Loading your cart...</p>
//         </div>
//       </section>
//     );
//   }

//   if (!items.length) {
//     return (
//       <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
//         <div className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)] p-8 text-center shadow-[0_20px_60px_-46px_rgba(66,72,121,0.16)] sm:p-12">
//           <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
//             <ShoppingBag size={24} />
//           </span>
//           <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-slate-950">Your cart is empty</h1>
//           <p className="mt-3 text-sm leading-6 text-slate-500">
//             Add a few products and come back here to update quantity, remove items, or continue to checkout.
//           </p>
//           <Link
//             href="/shop"
//             className="mt-6 inline-flex items-center rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#353a66]"
//           >
//             Continue Shopping
//           </Link>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
//       <div className="mb-8">
//         <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Your Bag</p>
//         <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
//           Cart built for quick checkout
//         </h1>
//         <p className="mt-2 text-sm text-slate-500">{totalItems} item(s) ready to review.</p>
//         {!isLoggedIn ? (
//           <p className="mt-2 text-xs text-[var(--brand-navy)]">
//             Cart is currently saved in this browser. Sign in at checkout and we&apos;ll merge it into your account cart.
//           </p>
//         ) : null}
//         {!isLoggedIn ? (
//           <p className="mt-1 text-xs text-slate-500">
//             Wishlist saving is available after sign in.
//           </p>
//         ) : null}
//         {isSyncing ? <p className="mt-2 text-xs text-slate-500">Syncing your account cart...</p> : null}
//       </div>

//       <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
//         <div className="space-y-4">
//           {items.map((item) => (
//             <article
//               key={item.cartId}
//               className="grid gap-4 rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)] p-4 shadow-[0_20px_60px_-46px_rgba(66,72,121,0.16)] sm:grid-cols-[120px_1fr] sm:p-5"
//             >
//               <Link href={`/product/${item.productId}`} className="overflow-hidden rounded-[1.25rem] bg-slate-100">
//                 {item.image ? (
//                   <img src={item.image} alt={item.title} className="aspect-[4/4.5] h-full w-full object-cover" />
//                 ) : (
//                   <div className="flex h-full min-h-32 items-center justify-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">
//                     No image
//                   </div>
//                 )}
//               </Link>

//               <div className="flex flex-col justify-between gap-4">
//                 <div>
//                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.category}</p>
//                   <Link href={`/product/${item.productId}`}>
//                     <h2 className="mt-2 text-lg font-black tracking-tight text-slate-950 transition hover:text-slate-700">
//                       {item.title}
//                     </h2>
//                   </Link>
//                   <p className="mt-1 text-sm text-slate-500">Option: {item.optionLabel}</p>
//                 </div>

//                 <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//                   <div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-2xl font-black tracking-tight text-slate-950">
//                         {formatPrice(item.price_selling)}
//                       </span>
//                       {item.price_compare > item.price_selling ? (
//                         <span className="text-sm font-semibold text-slate-400 line-through">
//                           {formatPrice(item.price_compare)}
//                         </span>
//                       ) : null}
//                     </div>
//                     <p className="mt-1 text-xs text-slate-400">
//                       Line total: {formatPrice(item.price_selling * item.quantity)}
//                     </p>
//                   </div>

//                   <div className="flex flex-wrap items-center gap-3">
//                     <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2 py-2">
//                       <QuantityButton
//                         onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
//                         label={`Decrease quantity for ${item.title}`}
//                       >
//                         <Minus size={14} />
//                       </QuantityButton>
//                       <span className="min-w-8 text-center text-sm font-black text-slate-900">{item.quantity}</span>
//                       <QuantityButton
//                         onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
//                         label={`Increase quantity for ${item.title}`}
//                       >
//                         <Plus size={14} />
//                       </QuantityButton>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={() => removeItem(item.cartId)}
//                       className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-navy)] transition hover:border-[var(--brand-navy)] hover:bg-[var(--surface-soft)]"
//                     >
//                       <Trash2 size={14} />
//                       Remove
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => void toggleWishlist(item.productId)}
//                       disabled={!isLoggedIn || isWishlistPending(item.productId)}
//                       className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
//                         isWishlisted(item.productId)
//                           ? "border-[var(--brand-navy)] bg-[var(--surface-soft)] text-[var(--brand-navy)]"
//                           : "border-[var(--line)] bg-white text-[var(--brand-navy)] hover:border-[var(--brand-navy)] hover:bg-[var(--surface-soft)]"
//                       }`}
//                     >
//                       <Heart size={14} className={isWishlisted(item.productId) ? "fill-current" : ""} />
//                       {isWishlisted(item.productId) ? "Saved" : "Wishlist"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </article>
//           ))}
//         </div>

//         <aside className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)] p-5 shadow-[0_24px_80px_-52px_rgba(66,72,121,0.22)] lg:sticky lg:top-6 lg:self-start">
//           <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Order Summary</p>
//           <div className="mt-5 space-y-3 border-b border-slate-200 pb-5 text-sm text-slate-600">
//             <div className="flex items-center justify-between">
//               <span>Items</span>
//               <span>{totalItems}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span>Subtotal</span>
//               <span>{formatPrice(subtotal)}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span>Shipping</span>
//               <span>Calculated at checkout</span>
//             </div>
//           </div>

//           <div className="mt-5 flex items-center justify-between">
//             <span className="text-sm font-bold text-slate-500">Estimated Total</span>
//             <span className="text-2xl font-black tracking-tight text-slate-950">{formatPrice(subtotal)}</span>
//           </div>

//           <Link
//             href="/checkout"
//             className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-navy)] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#353a66]"
//           >
//             Proceed to Checkout
//           </Link>
//         </aside>
//       </div>
//     </section>
//   );
// }


"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Gift,
  Heart,
  MapPin,
  Minus,
  Navigation,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "./CartProvider";
import { useLocation } from "../location/LocationProvider";
import { useWishlist } from "../wishlist/WishlistProvider";

function formatPrice(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amount % 1 ? 2 : 0,
  }).format(amount);
}

function getCartItemHref(item) {
  if (item?.productPath) {
    return item.productPath;
  }

  if (item?.productSlug) {
    return `/product/${item.productSlug}`;
  }

  return item?.productId ? `/product/${item.productId}` : "/shop";
}

function getItemSavings(item) {
  const selling = Number(item.price_selling || 0);
  const compare = Number(item.price_compare || 0);
  const quantity = Number(item.quantity || 1);

  if (compare <= selling) return 0;

  return (compare - selling) * quantity;
}

function getDiscountPercent(item) {
  const selling = Number(item.price_selling || 0);
  const compare = Number(item.price_compare || 0);

  if (!compare || compare <= selling) return 0;

  return Math.round(((compare - selling) / compare) * 100);
}

function QuantityButton({ onClick, children, label, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[#161f66] shadow-sm transition hover:-translate-y-0.5 hover:border-[#161f66] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}

function InfoPill({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.35)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#161f66] text-white">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-sm font-black text-slate-950">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

export default function CartPageClient() {
  const {
    items,
    subtotal,
    totalItems,
    updateQuantity,
    removeItem,
    isHydrated,
    isSyncing,
    isLoggedIn,
    getItemAction,
    isItemPending,
  } = useCart();

  const {
    toggleWishlist,
    isWishlisted,
    isPending: isWishlistPending,
  } = useWishlist();
  const { location, openModal } = useLocation();

  const totalSavings = items.reduce((sum, item) => sum + getItemSavings(item), 0);

  if (!isHydrated) {
    return (
      <section className="min-h-[60vh] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_25px_80px_-55px_rgba(15,23,42,0.55)] sm:p-12">
            <span className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-[#161f66] text-white">
              <ShoppingBag size={24} />
            </span>

            <h1 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Loading your cart...
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we prepare your shopping bag.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="min-h-[70vh] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white p-8 text-center shadow-[0_30px_100px_-70px_rgba(15,23,42,0.55)] sm:p-14">
            <div className="relative">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[#161f66] text-white shadow-[0_22px_60px_-32px_rgba(22,31,102,0.8)]">
                <ShoppingBag size={30} />
              </span>

              <p className="mt-7 text-xs font-black uppercase tracking-[0.28em] text-slate-400">
                Your Bag
              </p>

              <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
                Your cart is empty
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">
                Looks like you have not added anything yet. Explore products and
                add your favourites to start checkout.
              </p>

              <Link
                href="/shop"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#161f66] px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_20px_50px_-28px_rgba(22,31,102,0.8)] transition hover:-translate-y-0.5 hover:bg-[#10184f]"
              >
                Continue Shopping
                <ArrowRight size={16} />
              </Link>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <InfoPill
                  icon={Truck}
                  title="Easy delivery"
                  text="Shipping details are calculated during checkout."
                />
                <InfoPill
                  icon={ShieldCheck}
                  title="Secure checkout"
                  text="Your cart is safely prepared for the next step."
                />
                <InfoPill
                  icon={Gift}
                  title="Great picks"
                  text="Add products and review them anytime here."
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative mb-8 overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-[0_25px_90px_-70px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                <Sparkles size={14} className="text-[#161f66]" />
                Your Shopping Bag
              </div>

              <h1 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-5xl">
                Review your cart
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                You have{" "}
                <span className="font-black text-slate-950">
                  {totalItems} item{totalItems > 1 ? "s" : ""}
                </span>{" "}
                ready for checkout. Update quantity, save products to wishlist,
                or remove items before placing your order.
              </p>

              {!isLoggedIn ? (
                <div className="mt-4 rounded-2xl border border-[#161f66]/15 bg-[#161f66]/5 px-4 py-3 text-xs leading-5 text-slate-600">
                  <span className="font-black text-[#161f66]">Note:</span>{" "}
                  Cart is saved in this browser. Sign in at checkout and we will
                  merge it into your account cart. Wishlist saving is available
                  after sign in.
                </div>
              ) : null}

              {isSyncing ? (
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  Syncing your account cart...
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.45)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Items
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  {totalItems}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.45)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Subtotal
                </p>
                <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  {formatPrice(subtotal)}
                </p>
              </div>

              <div className="rounded-3xl border border-[#161f66] bg-[#161f66] p-4 text-white shadow-[0_18px_55px_-34px_rgba(22,31,102,0.85)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  Savings
                </p>
                <p className="mt-2 text-2xl font-black tracking-tight">
                  {formatPrice(totalSavings)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_90px_-75px_rgba(15,23,42,0.75)]">
              <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#161f66] text-white shadow-[0_18px_45px_-28px_rgba(22,31,102,0.75)]">
                    <MapPin size={20} />
                  </span>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                      Delivery Location
                    </p>
                    <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.02em] text-slate-950">
                      {location?.postalCode
                        ? `Pincode ${location.postalCode}`
                        : "Choose your pincode"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      {location?.message ||
                        "Check your delivery pincode before checkout to confirm serviceability and COD access."}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] ${
                          location?.deliveryAvailable
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {location?.deliveryAvailable
                          ? "Delivery Available"
                          : "Check Deliverability"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] ${
                          location?.codAvailable
                            ? "bg-sky-50 text-sky-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {location?.codAvailable
                          ? "COD Available"
                          : "COD May Be Unavailable"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openModal()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#161f66] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_50px_-28px_rgba(22,31,102,0.8)] transition hover:-translate-y-0.5 hover:bg-[#10184f]"
                >
                  <Navigation size={16} />
                  {location?.postalCode ? "Change Location" : "Choose Location"}
                </button>
              </div>
            </section>

            {items.map((item) => {
              const discountPercent = getDiscountPercent(item);
              const lineTotal =
                Number(item.price_selling || 0) * Number(item.quantity || 1);
              const itemSaving = getItemSavings(item);
              const productTitle = item.title || "Product";
              const productHref = getCartItemHref(item);
              const itemAction = getItemAction(item.cartId);
              const itemBusy = isItemPending(item.cartId);
              const quantityBusy = itemAction === "update";
              const removingItem = itemAction === "remove";

              return (
                <article
                  key={item.cartId}
                  className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_90px_-75px_rgba(15,23,42,0.75)] transition hover:-translate-y-1 hover:shadow-[0_35px_100px_-75px_rgba(15,23,42,0.9)]"
                >
                  <div className="grid gap-0 md:grid-cols-[190px_minmax(0,1fr)]">
                    <Link
                      href={productHref}
                      className="relative block overflow-hidden bg-slate-100 md:min-h-[230px]"
                    >
                      {discountPercent ? (
                        <span className="absolute left-4 top-4 z-10 rounded-full bg-[#161f66] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-lg">
                          {discountPercent}% Off
                        </span>
                      ) : null}

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={productTitle}
                          className="h-full min-h-[230px] w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full min-h-[230px] items-center justify-center bg-slate-100 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                          No image
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-col justify-between gap-6 p-5 sm:p-6">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                              {item.category || "Featured"}
                            </span>

                            {item.optionLabel ? (
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                {item.optionLabel}
                              </span>
                            ) : null}
                          </div>

                          <Link href={productHref}>
                            <h2 className="mt-4 font-display line-clamp-2 text-lg font-semibold tracking-[-0.02em] text-slate-950 transition hover:text-[#161f66] sm:text-xl">
                              {productTitle}
                            </h2>
                          </Link>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <BadgeCheck size={14} className="text-green-600" />
                              Quality checked
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <Truck size={14} className="text-[#161f66]" />
                              Delivery at checkout
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 rounded-3xl bg-slate-50 p-4 xl:text-right">
                          <div className="flex items-center gap-2 xl:justify-end">
                            <span className="text-2xl font-black tracking-tight text-slate-950">
                              {formatPrice(item.price_selling)}
                            </span>

                            {Number(item.price_compare || 0) >
                            Number(item.price_selling || 0) ? (
                              <span className="text-sm font-semibold text-slate-400 line-through">
                                {formatPrice(item.price_compare)}
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            Line total:{" "}
                            <span className="text-slate-700">
                              {formatPrice(lineTotal)}
                            </span>
                          </p>

                          {itemSaving > 0 ? (
                            <p className="mt-1 text-xs font-black text-green-600">
                              You save {formatPrice(itemSaving)}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-2">
                          <QuantityButton
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity - 1)
                            }
                            label={`Decrease quantity for ${productTitle}`}
                            disabled={itemBusy}
                          >
                            <Minus size={14} />
                          </QuantityButton>

                          <span
                            className={`min-w-10 text-center text-sm font-black ${
                              quantityBusy ? "text-slate-400" : "text-slate-950"
                            }`}
                          >
                            {quantityBusy ? "..." : item.quantity}
                          </span>

                          <QuantityButton
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity + 1)
                            }
                            label={`Increase quantity for ${productTitle}`}
                            disabled={itemBusy}
                          >
                            <Plus size={14} />
                          </QuantityButton>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => void toggleWishlist(item.productId)}
                            disabled={
                              !isLoggedIn || isWishlistPending(item.productId)
                            }
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              isWishlisted(item.productId)
                                ? "border-[#161f66] bg-[#161f66]/5 text-[#161f66]"
                                : "border-slate-200 bg-white text-slate-700 hover:border-[#161f66] hover:bg-[#161f66]/5 hover:text-[#161f66]"
                            }`}
                          >
                            <Heart
                              size={14}
                              className={
                                isWishlisted(item.productId)
                                  ? "fill-current"
                                  : ""
                              }
                            />
                            {isWishlisted(item.productId) ? "Saved" : "Wishlist"}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeItem(item.cartId)}
                            disabled={itemBusy}
                            className={`inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-red-600 transition ${
                              itemBusy
                                ? "cursor-wait opacity-70"
                                : "hover:border-red-200 hover:bg-red-100"
                            }`}
                          >
                            <Trash2 size={14} />
                            {removingItem ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </div>

                      {quantityBusy ? (
                        <p className="text-xs font-semibold text-slate-400">
                          Updating quantity...
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_100px_-70px_rgba(15,23,42,0.65)]">
              <div className="bg-[#161f66] p-6 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-white/50">
                      Order Summary
                    </p>
                    <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em]">
                      Ready to checkout
                    </h2>
                  </div>

                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <CreditCard size={22} />
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Total items</span>
                    <span className="font-black text-slate-950">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-black text-slate-950">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Total savings</span>
                    <span className="font-black text-green-600">
                      {formatPrice(totalSavings)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Shipping</span>
                    <span className="text-right font-semibold text-slate-700">
                      {location?.postalCode
                        ? `Based on ${location.postalCode}`
                        : "Calculated at checkout"}
                    </span>
                  </div>
                </div>

                <div className="my-6 border-t border-dashed border-slate-200" />

                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-500">
                      Estimated Total
                    </span>
                    <span className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Final shipping, taxes, and any applicable charges will be
                    calculated during checkout{location?.postalCode ? ` for ${location.postalCode}` : ""}.
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#161f66] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_20px_55px_-30px_rgba(22,31,102,0.85)] transition hover:-translate-y-0.5 hover:bg-[#10184f]"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/shop"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-slate-800 transition hover:border-[#161f66] hover:bg-[#161f66]/5 hover:text-[#161f66]"
                >
                  Continue Shopping
                </Link>

                <div className="mt-6 grid gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#161f66]/5 text-[#161f66]">
                      <ShieldCheck size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        Secure checkout
                      </p>
                      <p className="text-xs text-slate-500">
                        Safe and smooth checkout flow.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                      <Truck size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        Delivery details
                      </p>
                      <p className="text-xs text-slate-500">
                        Address and delivery charges come next.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
