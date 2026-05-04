"use client";

import { CartProvider } from "./cart/CartProvider";
import { WishlistProvider } from "./wishlist/WishlistProvider";

export default function AppProviders({ children, initialUser, initialCart, initialWishlistProductIds }) {
  const providerKey = initialUser?.id || "guest";

  return (
    <CartProvider key={`cart-${providerKey}`} initialUser={initialUser} initialCart={initialCart}>
      <WishlistProvider
        key={`wishlist-${providerKey}`}
        initialUser={initialUser}
        initialWishlistProductIds={initialWishlistProductIds}
      >
        {children}
      </WishlistProvider>
    </CartProvider>
  );
}
