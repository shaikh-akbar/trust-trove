"use client";

import { createContext, useContext, useState } from "react";

const WishlistContext = createContext(null);

async function requestWishlist(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Wishlist request failed.");
  }

  return data;
}

export function WishlistProvider({ children, initialUser = null, initialWishlistProductIds = [] }) {
  const isLoggedIn = Boolean(initialUser?.id);
  const [productIds, setProductIds] = useState(initialWishlistProductIds || []);
  const [pendingProductIds, setPendingProductIds] = useState([]);

  function isWishlisted(productId) {
    return productIds.includes(productId);
  }

  function isPending(productId) {
    return pendingProductIds.includes(productId);
  }

  async function toggleWishlist(productId) {
    if (!isLoggedIn || !productId) {
      throw new Error("Please sign in to save products to your wishlist.");
    }

    setPendingProductIds((current) => [...current, productId]);

    try {
      const currentlyWishlisted = productIds.includes(productId);
      const data = currentlyWishlisted
        ? await requestWishlist(`/api/wishlist?productId=${encodeURIComponent(productId)}`, { method: "DELETE" })
        : await requestWishlist("/api/wishlist", {
            method: "POST",
            body: JSON.stringify({ productId }),
          });

      setProductIds(data.productIds || []);
    } finally {
      setPendingProductIds((current) => current.filter((value) => value !== productId));
    }
  }

  const value = {
    isLoggedIn,
    productIds,
    totalWishlistItems: productIds.length,
    isWishlisted,
    isPending,
    toggleWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider.");
  }

  return context;
}
