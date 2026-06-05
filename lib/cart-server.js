import "server-only";
import { getSupabaseAdmin } from "./supabase-admin";
import { resolveEffectiveSellingPrice } from "./supplier-pricing";
import { getProductHref, getProductSlug } from "./product-route";

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isActiveStatus(value) {
  return String(value || "active").trim().toLowerCase() === "active";
}

function validatePurchasableVariant({ product, variant, quantity, existingQuantity = 0 }) {
  if (!variant) {
    throw new Error("Variant not found.");
  }

  if (!isActiveStatus(product?.status)) {
    throw new Error(`"${product?.title || "This product"}" is no longer available.`);
  }

  if (!isActiveStatus(variant?.status)) {
    throw new Error("This variant is no longer available.");
  }

  const inventoryQuantity = Math.max(0, normalizeNumber(variant.inventory_quantity, 0));
  const requestedQuantity = Math.max(0, normalizeNumber(quantity, 0));
  const nextQuantity = existingQuantity > 0 ? existingQuantity + requestedQuantity : requestedQuantity;

  if (inventoryQuantity <= 0) {
    throw new Error(`"${product?.title || "This product"}" is out of stock.`);
  }

  if (nextQuantity > inventoryQuantity) {
    throw new Error(
      `Only ${inventoryQuantity} unit${inventoryQuantity === 1 ? "" : "s"} available for "${product?.title || "this product"}".`
    );
  }
}

function sortImages(images) {
  return [...(images || [])].sort((a, b) => Number(a?.position || 0) - Number(b?.position || 0));
}

function formatCartItem(row) {
  const product = row?.product || {};
  const variant = row?.variant || {};
  const sortedImages = sortImages(product?.product_images);
  const cartIdKey = `${product.id}:${variant.sku || variant.id || "default"}`;

  return {
    cartItemId: row.id,
    cartId: cartIdKey,
    cartIdKey,
    parentCartId: row.cart_id,
    productId: product.id,
    productSlug: getProductSlug(product),
    productPath: getProductHref(product),
    variantId: variant.id,
    variantSku: variant.sku || null,
    title: product.title || "Untitled Product",
    image: product.main_image || sortedImages[0]?.src || "",
    vendor: product.vendor || "GoModexa",
    category: product.category || product.product_type || "Uncategorized",
    product_status: product.status || "active",
    variant_status: variant.status || "active",
    optionLabel: variant.option1_value || "Default",
    price_selling: resolveEffectiveSellingPrice({
      priceSelling: normalizeNumber(variant.price_selling ?? row.price_selling, 0),
      costPrice: normalizeNumber(variant.cost_price, 0),
      gstPercent: normalizeNumber(variant.gst_percent, 0),
      weightGrams: normalizeNumber(variant.weight_grams, 0),
    }),
    price_compare: normalizeNumber(variant.price_compare),
    quantity: normalizeNumber(row.quantity, 1),
    inventory_quantity: normalizeNumber(variant.inventory_quantity, 0),
    weight_grams: normalizeNumber(variant.weight_grams, 0),
    gst_percent: normalizeNumber(variant.gst_percent, 0),
    is_cod_available: product.is_cod_available !== false,
    shipping_charge: normalizeNumber(product.shipping_charge, 0),
    cod_charge: normalizeNumber(product.cod_charge, 0),
    platform_fee: normalizeNumber(product.platform_fee, 0),
    convenience_fee: normalizeNumber(product.convenience_fee, 0),
  };
}

function buildSnapshot(items) {
  const normalizedItems = items.map(formatCartItem);

  return {
    items: normalizedItems,
    totalItems: normalizedItems.reduce((total, item) => total + item.quantity, 0),
    subtotal: normalizedItems.reduce((total, item) => total + item.quantity * item.price_selling, 0),
  };
}

export async function getOrCreateActiveCart(userId) {
  const supabase = getSupabaseAdmin();
  const { data: existing, error: existingError } = await supabase
    .from("carts")
    .select("id, user_id, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("carts")
    .insert({
      user_id: userId,
      status: "active",
    })
    .select("id, user_id, status")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCartSnapshotForUser(userId) {
  const supabase = getSupabaseAdmin();
  const cart = await getOrCreateActiveCart(userId);
  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      cart_id,
      quantity,
      price_selling,
      product:products!cart_items_product_id_fkey (
        id,
        title,
        vendor,
        category,
        product_type,
        main_image,
        status,
        is_cod_available,
        shipping_charge,
        cod_charge,
        platform_fee,
        convenience_fee,
        product_images (
          id,
          src,
          position,
          alt_text
        )
      ),
      variant:variants!cart_items_variant_id_fkey (
        id,
        sku,
        option1_value,
        price_selling,
        price_compare,
        cost_price,
        inventory_quantity,
        weight_grams,
        gst_percent,
        status
      )
    `)
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return {
    cartId: cart.id,
    ...buildSnapshot(data || []),
  };
}

async function getVariantWithProduct(variantId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("variants")
    .select(`
      id,
      product_id,
      sku,
      option1_value,
      price_selling,
      price_compare,
      cost_price,
      inventory_quantity,
      weight_grams,
      gst_percent,
      status,
      product:products!variants_product_id_fkey (
        id,
        title,
        status
      )
    `)
    .eq("id", variantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function addCartItemForUser(userId, payload) {
  const supabase = getSupabaseAdmin();
  const cart = await getOrCreateActiveCart(userId);
  const quantity = Math.max(1, normalizeNumber(payload?.quantity, 1));
  const variant = await getVariantWithProduct(payload?.variantId);

  if (!variant) {
    throw new Error("Variant not found.");
  }

  if (payload?.productId && variant.product_id !== payload.productId) {
    throw new Error("Variant does not belong to the selected product.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cart.id)
    .eq("variant_id", variant.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  validatePurchasableVariant({
    product: variant.product,
    variant,
    quantity,
    existingQuantity: normalizeNumber(existing?.quantity, 0),
  });

  if (existing) {
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity: existing.quantity + quantity,
        price_selling: normalizeNumber(variant.price_selling, 0),
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  } else {
    const { error: insertError } = await supabase
      .from("cart_items")
      .insert({
        cart_id: cart.id,
        product_id: variant.product_id,
        variant_id: variant.id,
        quantity,
        price_selling: normalizeNumber(variant.price_selling, 0),
      });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return getCartSnapshotForUser(userId);
}

export async function updateCartItemQuantityForUser(userId, cartItemId, quantity) {
  const supabase = getSupabaseAdmin();
  const cart = await getOrCreateActiveCart(userId);
  const nextQuantity = normalizeNumber(quantity, 1);

  const { data: item, error: itemError } = await supabase
    .from("cart_items")
    .select("id, variant_id")
    .eq("id", cartItemId)
    .eq("cart_id", cart.id)
    .maybeSingle();

  if (itemError) {
    throw new Error(itemError.message);
  }

  if (!item) {
    throw new Error("Cart item not found.");
  }

  if (nextQuantity <= 0) {
    const { error: deleteError } = await supabase.from("cart_items").delete().eq("id", cartItemId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  } else {
    const variant = await getVariantWithProduct(item.variant_id);

    validatePurchasableVariant({
      product: variant?.product,
      variant,
      quantity: nextQuantity,
    });

    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity: nextQuantity })
      .eq("id", cartItemId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  return getCartSnapshotForUser(userId);
}

export async function removeCartItemForUser(userId, cartItemId) {
  const supabase = getSupabaseAdmin();
  const cart = await getOrCreateActiveCart(userId);
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("cart_id", cart.id);

  if (error) {
    throw new Error(error.message);
  }

  return getCartSnapshotForUser(userId);
}

export async function clearCartForUser(userId) {
  const supabase = getSupabaseAdmin();
  const cart = await getOrCreateActiveCart(userId);
  const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.id);

  if (error) {
    throw new Error(error.message);
  }

  return getCartSnapshotForUser(userId);
}

export async function mergeGuestCartForUser(userId, guestItems) {
  const items = Array.isArray(guestItems) ? guestItems : [];

  for (const item of items) {
    if (!item?.variantId) {
      continue;
    }

    await addCartItemForUser(userId, {
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    });
  }

  return getCartSnapshotForUser(userId);
}
