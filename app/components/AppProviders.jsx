"use client";

import { CartProvider } from "./cart/CartProvider";
import RouteLoadingProvider from "./feedback/RouteLoadingProvider";
import { LocationProvider } from "./location/LocationProvider";
import { WishlistProvider } from "./wishlist/WishlistProvider";

export default function AppProviders({ children, initialUser, initialCart, initialWishlistProductIds }) {
  const providerKey = initialUser?.id || "guest";

  return (
    <RouteLoadingProvider>
      <LocationProvider>
        <CartProvider key={`cart-${providerKey}`} initialUser={initialUser} initialCart={initialCart}>
          <WishlistProvider
            key={`wishlist-${providerKey}`}
            initialUser={initialUser}
            initialWishlistProductIds={initialWishlistProductIds}
          >
            {children}
          </WishlistProvider>
        </CartProvider>
      </LocationProvider>
    </RouteLoadingProvider>
  );
}
