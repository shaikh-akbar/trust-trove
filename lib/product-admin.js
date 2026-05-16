import "server-only";

import { getSupabaseAdmin } from "./supabase-admin";

const ADMIN_PRODUCT_STATUSES = ["active", "inactive", "draft"];

function normalizeText(value, { maxLength = null, allowEmpty = true } = {}) {
  const normalized = String(value ?? "").trim();

  if (!allowEmpty && !normalized) {
    throw new Error("This field is required.");
  }

  if (maxLength && normalized.length > maxLength) {
    throw new Error(`Text is too long. Maximum ${maxLength} characters allowed.`);
  }

  return normalized;
}

function normalizeNullableText(value, options = {}) {
  const normalized = normalizeText(value, options);
  return normalized || null;
}

function normalizeStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (!ADMIN_PRODUCT_STATUSES.includes(normalized)) {
    throw new Error(`Unsupported status. Allowed values: ${ADMIN_PRODUCT_STATUSES.join(", ")}.`);
  }

  return normalized;
}

function formatAdminProduct(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const primaryVariant =
    variants.find((variant) => variant?.is_default) || variants[0] || null;

  return {
    id: product.id,
    title: product.title || "",
    slug: product.slug || product.handle || "",
    status: product.status || "active",
    is_featured: Boolean(product.is_featured),
    seo_title: product.seo_title || "",
    seo_description: product.seo_description || "",
    short_description: product.short_description || "",
    category: product.category || product.product_type || "",
    product_type: product.product_type || "",
    vendor: product.vendor || "",
    brand: product.brand || "",
    supplier_name: product.supplier_name || "",
    supplier_product_code: product.supplier_product_code || "",
    image: product.main_image || "",
    created_at: product.created_at || "",
    updated_at: product.updated_at || "",
    primary_variant: primaryVariant
      ? {
          id: primaryVariant.id,
          sku: primaryVariant.sku || "",
          price_selling: Number(primaryVariant.price_selling || 0),
          inventory_quantity: Number(primaryVariant.inventory_quantity || 0),
          status: primaryVariant.status || "active",
        }
      : null,
  };
}

export async function getAdminProducts() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      title,
      handle,
      slug,
      status,
      is_featured,
      seo_title,
      seo_description,
      short_description,
      category,
      product_type,
      vendor,
      brand,
      supplier_name,
      supplier_product_code,
      main_image,
      created_at,
      updated_at,
      variants (
        id,
        sku,
        price_selling,
        inventory_quantity,
        is_default,
        status
      )
    `)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(formatAdminProduct);
}

export async function updateAdminProduct(productId, payload = {}) {
  const supabase = getSupabaseAdmin();
  const updates = {
    title: normalizeText(payload.title, { maxLength: 255, allowEmpty: false }),
    slug: normalizeText(payload.slug, { maxLength: 255, allowEmpty: false }),
    status: normalizeStatus(payload.status),
    is_featured: Boolean(payload.is_featured),
    short_description: normalizeNullableText(payload.short_description, { maxLength: 500 }),
    seo_title: normalizeNullableText(payload.seo_title, { maxLength: 255 }),
    seo_description: normalizeNullableText(payload.seo_description, { maxLength: 320 }),
    brand: normalizeNullableText(payload.brand, { maxLength: 255 }),
    category: normalizeNullableText(payload.category, { maxLength: 255 }),
    supplier_name: normalizeNullableText(payload.supplier_name, { maxLength: 255 }),
    supplier_product_code: normalizeNullableText(payload.supplier_product_code, { maxLength: 255 }),
  };

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)
    .select(`
      id,
      title,
      handle,
      slug,
      status,
      is_featured,
      seo_title,
      seo_description,
      short_description,
      category,
      product_type,
      vendor,
      brand,
      supplier_name,
      supplier_product_code,
      main_image,
      created_at,
      updated_at,
      variants (
        id,
        sku,
        price_selling,
        inventory_quantity,
        is_default,
        status
      )
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return formatAdminProduct(data);
}

export { ADMIN_PRODUCT_STATUSES };
