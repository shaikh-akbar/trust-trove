import "server-only";
import { getSupabaseAdmin } from "./supabase-admin";

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isActiveStatus(value) {
  return String(value || "active").trim().toLowerCase() === "active";
}

function groupItemsByVariant(items = []) {
  const grouped = new Map();

  for (const item of items) {
    const variantId = item?.variantId || item?.variant_id;

    if (!variantId) {
      continue;
    }

    const quantity = Math.max(0, normalizeNumber(item?.quantity, 0));
    const current = grouped.get(variantId);

    if (current) {
      current.quantity += quantity;
      continue;
    }

    grouped.set(variantId, {
      variantId,
      quantity,
      title: item?.title || "This product",
    });
  }

  return Array.from(grouped.values());
}

async function fetchVariantRecord(supabase, variantId) {
  const { data, error } = await supabase
    .from("variants")
    .select(`
      id,
      inventory_quantity,
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

async function updateVariantInventory({
  supabase,
  variantId,
  quantity,
  mode,
  title,
}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const variant = await fetchVariantRecord(supabase, variantId);

    if (!variant) {
      throw new Error(`Variant not found for "${title || "this product"}".`);
    }

    const productTitle = variant.product?.title || title || "This product";
    const currentInventory = Math.max(0, normalizeNumber(variant.inventory_quantity, 0));
    const nextInventory =
      mode === "reserve"
        ? currentInventory - quantity
        : currentInventory + quantity;

    if (mode === "reserve") {
      if (!isActiveStatus(variant.product?.status)) {
        throw new Error(`"${productTitle}" is no longer available.`);
      }

      if (!isActiveStatus(variant.status)) {
        throw new Error(`A selected option for "${productTitle}" is no longer available.`);
      }

      if (currentInventory < quantity) {
        throw new Error(
          `Only ${currentInventory} unit${currentInventory === 1 ? "" : "s"} available for "${productTitle}".`
        );
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("variants")
      .update({
        inventory_quantity: nextInventory,
      })
      .eq("id", variantId)
      .eq("inventory_quantity", currentInventory)
      .select("id")
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (updated) {
      return;
    }
  }

  throw new Error(`Inventory changed while updating "${title || "this product"}". Please try again.`);
}

export async function reserveInventoryForItems(items = []) {
  const supabase = getSupabaseAdmin();
  const groupedItems = groupItemsByVariant(items);
  const reserved = [];

  try {
    for (const item of groupedItems) {
      await updateVariantInventory({
        supabase,
        variantId: item.variantId,
        quantity: item.quantity,
        mode: "reserve",
        title: item.title,
      });

      reserved.push(item);
    }

    return reserved;
  } catch (error) {
    if (reserved.length) {
      await restoreInventoryForItems(reserved);
    }

    throw error;
  }
}

export async function restoreInventoryForItems(items = []) {
  const supabase = getSupabaseAdmin();
  const groupedItems = groupItemsByVariant(items);

  for (const item of groupedItems) {
    await updateVariantInventory({
      supabase,
      variantId: item.variantId,
      quantity: item.quantity,
      mode: "restore",
      title: item.title,
    });
  }
}
