"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "trusttrove_cart";

const CartContext = createContext(null);

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildCartId(productId, variantSku) {
  return `${productId}:${variantSku || "default"}`;
}

export function getCartItemKey(product, variant) {
  const safeVariant = variant || product?.variants?.[0] || {};
  return buildCartId(product?.id, safeVariant?.sku);
}

function persistCart(items) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function readGuestCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function clearGuestCart() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

function defer(callback) {
  Promise.resolve().then(callback);
}

export function buildCartItem(product, variant, quantity = 1) {
  const safeVariant = variant || product?.variants?.[0] || {};
  const cartId = getCartItemKey(product, safeVariant);

  return {
    cartItemId: null,
    cartId,
    cartIdKey: cartId,
    productId: product?.id,
    variantId: safeVariant?.id || null,
    variantSku: safeVariant?.sku || null,
    title: product?.title || product?.name || "Untitled Product",
    image: product?.main_image || product?.image_url || product?.product_images?.[0]?.src || "",
    category: product?.category || product?.product_type || "Uncategorized",
    optionLabel: safeVariant?.option1_value || "Default",
    price_selling: normalizeNumber(safeVariant?.price_selling ?? product?.price_selling),
    price_compare: normalizeNumber(safeVariant?.price_compare ?? product?.price_compare),
    quantity: Math.max(1, normalizeNumber(quantity, 1)),
    inventory_quantity: Math.max(0, normalizeNumber(safeVariant?.inventory_quantity ?? product?.inventory_quantity, 0)),
  };
}

function buildSnapshot(items) {
  const normalizedItems = items || [];

  return {
    items: normalizedItems,
    totalItems: normalizedItems.reduce((total, item) => total + item.quantity, 0),
    subtotal: normalizedItems.reduce((total, item) => total + item.price_selling * item.quantity, 0),
  };
}

async function requestCart(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Cart request failed.");
  }

  return data;
}

export function CartProvider({ children, initialUser = null, initialCart = null }) {
  const isLoggedIn = Boolean(initialUser?.id);
  const [items, setItems] = useState(() => (isLoggedIn ? initialCart?.items || [] : []));
  const [isHydrated, setIsHydrated] = useState(false);
  const [itemActionState, setItemActionState] = useState({});
  const hasMergedGuestCart = useRef(false);

  function setItemAction(cartId, action) {
    setItemActionState((current) => {
      if (!cartId) {
        return current;
      }

      if (!action) {
        if (!(cartId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[cartId];
        return next;
      }

      return {
        ...current,
        [cartId]: action,
      };
    });
  }

  function getItemAction(cartId) {
    return itemActionState[cartId] || null;
  }

  function isItemPending(cartId) {
    return Boolean(cartId && itemActionState[cartId]);
  }

  useEffect(() => {
    if (!isLoggedIn) {
      defer(() => {
        setItems(readGuestCart());
        setIsHydrated(true);
      });
      return;
    }

    if (hasMergedGuestCart.current) {
      defer(() => {
        setIsHydrated(true);
      });
      return;
    }

    const guestItems = readGuestCart();

    if (!guestItems.length) {
      hasMergedGuestCart.current = true;
      defer(() => {
        setItems(initialCart?.items || []);
        setIsHydrated(true);
      });
      return;
    }

    hasMergedGuestCart.current = true;

    void requestCart("/api/cart", {
      method: "POST",
      body: JSON.stringify({
        action: "sync",
        items: guestItems,
      }),
    })
      .then((snapshot) => {
        setItems(snapshot.items || []);
        clearGuestCart();
      })
      .catch((error) => {
        console.error("Guest cart merge failed:", error);
        setItems(initialCart?.items || []);
      })
      .finally(() => {
        setIsHydrated(true);
      });
  }, [initialCart?.items, isLoggedIn]);

  async function addItem(nextItem, quantity = 1) {
    const item = {
      ...nextItem,
      quantity: Math.max(1, normalizeNumber(quantity, 1)),
    };
    const cartId = item.cartId || item.cartIdKey;

    setItemAction(cartId, "add");

    try {
      if (!isLoggedIn) {
        setItems((current) => {
          const existing = current.find((entry) => entry.cartId === item.cartId);

          if (!existing) {
            const next = [...current, item];
            persistCart(next);
            return next;
          }

          const next = current.map((entry) =>
            entry.cartId === item.cartId
              ? {
                  ...entry,
                  quantity: entry.quantity + item.quantity,
                }
              : entry
          );
          persistCart(next);
          return next;
        });
        return;
      }

      const snapshot = await requestCart("/api/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        }),
      });

      setItems(snapshot.items || []);
    } finally {
      setItemAction(cartId, null);
    }
  }

  async function updateQuantity(cartId, quantity) {
    const nextQuantity = normalizeNumber(quantity, 1);
    setItemAction(cartId, "update");

    try {
      if (!isLoggedIn) {
        setItems((current) => {
          if (nextQuantity <= 0) {
            const next = current.filter((item) => item.cartId !== cartId);
            persistCart(next);
            return next;
          }

          const next = current.map((item) =>
            item.cartId === cartId
              ? {
                  ...item,
                  quantity: nextQuantity,
                }
              : item
          );
          persistCart(next);
          return next;
        });
        return;
      }

      const target = items.find((item) => item.cartId === cartId || item.cartIdKey === cartId);

      if (!target?.cartItemId) {
        return;
      }

      const snapshot = await requestCart("/api/cart", {
        method: "PATCH",
        body: JSON.stringify({
          cartItemId: target.cartItemId,
          quantity: nextQuantity,
        }),
      });

      setItems(snapshot.items || []);
    } finally {
      setItemAction(cartId, null);
    }
  }

  async function removeItem(cartId) {
    setItemAction(cartId, "remove");

    try {
      if (!isLoggedIn) {
        setItems((current) => {
          const next = current.filter((item) => item.cartId !== cartId);
          persistCart(next);
          return next;
        });
        return;
      }

      const target = items.find((item) => item.cartId === cartId || item.cartIdKey === cartId);

      if (!target?.cartItemId) {
        return;
      }

      const snapshot = await requestCart(`/api/cart?cartItemId=${encodeURIComponent(target.cartItemId)}`, {
        method: "DELETE",
      });

      setItems(snapshot.items || []);
    } finally {
      setItemAction(cartId, null);
    }
  }

  async function clearCart() {
    if (!isLoggedIn) {
      persistCart([]);
      setItems([]);
      return;
    }

    const snapshot = await requestCart("/api/cart?mode=clear", {
      method: "DELETE",
    });

    setItems(snapshot.items || []);
  }

  const snapshot = buildSnapshot(items);
  const value = {
    items,
    isHydrated,
    isLoggedIn,
    isSyncing: false,
    totalItems: snapshot.totalItems,
    subtotal: snapshot.subtotal,
    getItemAction,
    isItemPending,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}
