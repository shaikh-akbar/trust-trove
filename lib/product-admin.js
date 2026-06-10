import "server-only";

import { getSupabaseAdmin } from "./supabase-admin";
import { getActiveDealIdsFromTags, normalizeDealTags, updateDealTags } from "./product-deals";
import { getPublicCategoryLabel } from "./storefront";

const ADMIN_PRODUCT_STATUSES = ["active", "inactive", "draft"];
const ADMIN_PRODUCTS_PAGE_SIZE = 100;

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

function normalizeTagString(value) {
  const normalizedTags = normalizeDealTags(value);
  return normalizedTags.length > 0 ? normalizedTags : null;
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
    new_arrivals: Boolean(product.new_arrivals),
    seo_title: product.seo_title || "",
    seo_description: product.seo_description || "",
    seo_keywords: product.seo_keywords || "",
    short_description: product.short_description || "",
    category: product.category || product.product_type || "",
    product_type: product.product_type || "",
    vendor: product.vendor || "",
    brand: product.brand || "",
    supplier_name: product.supplier_name || "",
    supplier_product_code: product.supplier_product_code || "",
    tags: normalizeDealTags(product.tags),
    active_deal_ids: getActiveDealIdsFromTags(product.tags),
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

function matchesAdminProductFilters(product, { search = "", status = "all", category = "all" } = {}) {
  const normalizedSearch = String(search || "").trim();
  const normalizedStatus = String(status || "all").trim().toLowerCase();
  const normalizedCategory = String(category || "all").trim();

  if (normalizedSearch) {
    const haystack = [
      product.title,
      product.slug,
      product.vendor,
      product.brand,
      product.category,
      product.product_type,
      product.supplier_name,
      product.supplier_product_code,
      product.primary_variant?.sku,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(normalizedSearch.toLowerCase())) {
      return false;
    }
  }

  if (normalizedStatus === "featured") {
    if (!product.is_featured) {
      return false;
    }
  } else if (normalizedStatus !== "all") {
    if (String(product.status || "").toLowerCase() !== normalizedStatus) {
      return false;
    }
  }

  if (normalizedCategory && normalizedCategory !== "all") {
    if (getPublicCategoryLabel(product) !== normalizedCategory) {
      return false;
    }
  }

  return true;
}

export async function getAdminProductCategoryOptions() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(`
      category,
      product_type
    `)
    .order("category", { ascending: true, nullsFirst: false })
    .order("product_type", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return Array.from(
    new Set(
      (data || [])
        .map((product) => getPublicCategoryLabel(product))
        .filter((value) => value && value !== "Uncategorized")
    )
  ).sort((left, right) => left.localeCompare(right));
}

export async function getAdminProductsPage({
  page = 1,
  pageSize = ADMIN_PRODUCTS_PAGE_SIZE,
  search = "",
  status = "all",
  category = "all",
} = {}) {
  const supabase = getSupabaseAdmin();
  const safePage = Math.max(1, Number(page || 1));
  const safePageSize = Math.max(12, Math.min(100, Number(pageSize || ADMIN_PRODUCTS_PAGE_SIZE)));
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const [{ data, error }, categories] = await Promise.all([
    supabase
      .from("products")
      .select(`
        id,
        title,
        handle,
        slug,
        status,
        is_featured,
        new_arrivals,
        seo_title,
        seo_description,
        seo_keywords,
        short_description,
        category,
        product_type,
        vendor,
        brand,
        supplier_name,
        supplier_product_code,
        tags,
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
      .order("created_at", { ascending: false, nullsFirst: false }),
    getAdminProductCategoryOptions(),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const filteredItems = (data || [])
    .map(formatAdminProduct)
    .filter((product) => matchesAdminProductFilters(product, { search, status, category }));
  const total = filteredItems.length;

  return {
    items: filteredItems.slice(from, to + 1),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: total > 0 ? Math.ceil(total / safePageSize) : 1,
    categories,
  };
}

export async function getAdminProducts() {
  const result = await getAdminProductsPage();
  return result.items;
}

export async function updateAdminProduct(productId, payload = {}) {
  const supabase = getSupabaseAdmin();
  const updates = {
    title: normalizeText(payload.title, { maxLength: 255, allowEmpty: false }),
    slug: normalizeText(payload.slug, { maxLength: 255, allowEmpty: false }),
    status: normalizeStatus(payload.status),
    is_featured: Boolean(payload.is_featured),
    new_arrivals: Boolean(payload.new_arrivals),
    short_description: normalizeNullableText(payload.short_description, { maxLength: 500 }),
    seo_title: normalizeNullableText(payload.seo_title, { maxLength: 255 }),
    seo_description: normalizeNullableText(payload.seo_description, { maxLength: 320 }),
    seo_keywords: normalizeNullableText(payload.seo_keywords, { maxLength: 1000 }),
    brand: normalizeNullableText(payload.brand, { maxLength: 255 }),
    category: normalizeNullableText(payload.category, { maxLength: 255 }),
    supplier_name: normalizeNullableText(payload.supplier_name, { maxLength: 255 }),
    supplier_product_code: normalizeNullableText(payload.supplier_product_code, { maxLength: 255 }),
    tags: normalizeTagString(updateDealTags(payload.tags, payload.active_deal_ids)),
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
      new_arrivals,
      seo_title,
      seo_description,
      seo_keywords,
      short_description,
      category,
      product_type,
      vendor,
      brand,
      supplier_name,
      supplier_product_code,
      tags,
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

  // If inventory for the primary variant was provided, update the variant record.
  const inventoryFromPayload =
    typeof payload.inventory_quantity !== "undefined"
      ? payload.inventory_quantity
      : payload?.primary_variant?.inventory_quantity;

  if (typeof inventoryFromPayload !== "undefined") {
    const desiredInventory = Number(inventoryFromPayload || 0);

    const primaryVariant = Array.isArray(data?.variants)
      ? data.variants.find((v) => v?.is_default) || data.variants[0] || null
      : null;

    if (primaryVariant && primaryVariant.id) {
      const { error: variantError } = await supabase
        .from("variants")
        .update({ inventory_quantity: desiredInventory })
        .eq("id", primaryVariant.id);

      if (variantError) {
        throw new Error(variantError.message);
      }

      // Re-fetch the product to return updated variant data
      const { data: refreshed, error: refreshError } = await supabase
        .from("products")
        .select(`
          id,
          title,
          handle,
          slug,
          status,
          is_featured,
          new_arrivals,
          seo_title,
          seo_description,
          seo_keywords,
          short_description,
          category,
          product_type,
          vendor,
          brand,
          supplier_name,
          supplier_product_code,
          tags,
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
        .eq("id", productId)
        .maybeSingle();

      if (refreshError) {
        throw new Error(refreshError.message);
      }

      return formatAdminProduct(refreshed || data);
    }
  }

  return formatAdminProduct(data);
}

export { ADMIN_PRODUCTS_PAGE_SIZE, ADMIN_PRODUCT_STATUSES };
