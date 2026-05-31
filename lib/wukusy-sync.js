import "server-only";

import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";

import { getSupabaseAdmin } from "./supabase-admin";
import { clearCatalogCache } from "./catalog-cache";
import { warmCatalogCache } from "./product";
import {
  calculateSupplierDisplayPrice,
  DEFAULT_GST_PERCENT,
  DEFAULT_MARGIN_AMOUNT,
} from "./supplier-pricing";

const DEFAULT_START_URL = "https://wukusy.app/dropshiper/index";
const DEFAULT_DELAY_MS = 150;

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(
    typeof value === "string" ? value.replace(/[^0-9.-]/g, "") : value
  );
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeInteger(value, fallback = 0) {
  return Math.max(0, Math.round(normalizeNumber(value, fallback)));
}

function roundCurrency(value) {
  return Math.round(normalizeNumber(value, 0) * 100) / 100;
}

function normalizeSku(value) {
  return normalizeText(value).toUpperCase();
}

function compactSku(value) {
  return normalizeSku(value).replace(/[^A-Z0-9]/g, "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value) {
  return decodeHtml(String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function htmlFetchHeaders(url, cookie = "", referer = "") {
  const urlObject = new URL(url);
  const origin = urlObject.origin;
  const headers = {
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "en-IN,en;q=0.9,hi;q=0.8,en-US;q=0.7",
    "cache-control": "max-age=0",
    pragma: "no-cache",
    priority: "u=0, i",
    "sec-ch-ua":
      '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": referer ? "same-origin" : "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    origin,
  };

  if (referer) {
    headers.referer = referer;
  }

  if (cookie) {
    headers.cookie = cookie;
  }

  return headers;
}

async function fetchHtml(url, cookie = "", referer = "") {
  const response = await fetch(url, {
    headers: htmlFetchHeaders(url, cookie, referer),
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Wukusy HTML request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function toAbsoluteUrl(target, baseUrl) {
  try {
    return new URL(target, baseUrl).toString();
  } catch {
    return null;
  }
}

function unique(items) {
  return Array.from(new Set((items || []).filter(Boolean)));
}

function extractLinks(html, baseUrl) {
  const matches = Array.from(
    html.matchAll(/href=["']([^"'#?][^"']*|\/[^"']*|https?:\/\/[^"']*)["']/gi)
  );

  return unique(
    matches
      .map((match) => toAbsoluteUrl(decodeHtml(match[1]), baseUrl))
      .filter(Boolean)
  );
}

function extractProductLinks(html, baseUrl) {
  return extractLinks(html, baseUrl).filter((link) =>
    /\/merchant\/product-details\/\d+/i.test(link)
  );
}

function extractCategoryLinks(html, baseUrl) {
  return extractLinks(html, baseUrl).filter((link) =>
    /\/dropshiper\/category\/\d+/i.test(link)
  );
}

function extractMetaContent(html, key) {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escapeRegExp(key)}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  return decodeHtml(html.match(pattern)?.[1] || "");
}

function extractTitle(html) {
  const ogTitle = extractMetaContent(html, "og:title");
  if (ogTitle) {
    return ogTitle;
  }

  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  if (h1) {
    return stripHtml(h1);
  }

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return stripHtml(title);
}

function extractImageUrls(html, baseUrl) {
  const srcMatches = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi));

  return unique(
    srcMatches
      .map((match) => toAbsoluteUrl(decodeHtml(match[1]), baseUrl))
      .filter(Boolean)
  );
}

function extractTextMatches(text, pattern, limit = 10) {
  return unique(Array.from(text.matchAll(pattern)).map((match) => normalizeText(match[0]))).slice(0, limit);
}

function extractDetailData(html, url) {
  const text = stripHtml(html);
  const productId = url.match(/\/merchant\/product-details\/(\d+)/i)?.[1] || "";
  const priceCandidates = extractTextMatches(
    text,
    /(?:Rs\.?|â‚¹|₹)\s*[0-9][0-9,]*(?:\.[0-9]{1,2})?/gi
  );
  const gstCandidates = extractTextMatches(text, /[0-9]+(?:\.[0-9]+)?\s*%?\s*(?:gst|tax)/gi);
  const weightCandidates = extractTextMatches(text, /[0-9]+(?:\.[0-9]+)?\s*(?:gm|g|kg|ml|l)\b/gi);
  const skuCandidates = extractTextMatches(
    text,
    /\b(?:sku|item code|product code)\b[:\s-]*[A-Z0-9\-_/]+/gi
  );
  const stockCandidates = extractTextMatches(
    text,
    /\b(?:in stock|out of stock|available|unavailable|0\s*pcs?\s*left|[0-9]+\s*pcs?\s*left)\b/gi
  );
  const imageUrls = extractImageUrls(html, url);
  const resolvedTitle = extractTitle(html);
  const primaryPrice = roundCurrency(normalizeNumber(priceCandidates[0]));
  const gstPercent = roundCurrency(
    normalizeNumber(
      gstCandidates
        .map((entry) => entry.match(/[0-9]+(?:\.[0-9]+)?/)?.[0])
        .find(Boolean),
      DEFAULT_GST_PERCENT
    )
  );
  const weightValue = normalizeNumber(
    weightCandidates
      .map((entry) => entry.match(/[0-9]+(?:\.[0-9]+)?/)?.[0])
      .find(Boolean),
    0
  );
  const weightUnit = weightCandidates[0]?.match(/(gm|g|kg|ml|l)\b/i)?.[1]?.toLowerCase() || "";
  const weightGrams =
    weightUnit === "kg"
      ? Math.round(weightValue * 1000)
      : weightUnit === "g" || weightUnit === "gm"
        ? Math.round(weightValue)
        : 0;
  const sku =
    normalizeText(
      skuCandidates
        .map((entry) => entry.split(/[:\s-]+/).slice(-1)[0])
        .find(Boolean)
    ).toUpperCase() || `WUKUSY-${productId}`;
  const stockText = stockCandidates[0] || "";
  const numericStock = normalizeInteger(stockText.match(/[0-9]+/)?.[0], 0);
  const stockQty = /out of stock|unavailable|0\s*pcs?/i.test(stockText)
    ? 0
    : /[0-9]+\s*pcs?/i.test(stockText)
      ? numericStock
      : 1;

  return {
    wukusy_product_id: productId || sku,
    sku,
    title: resolvedTitle || sku,
    cost_price: primaryPrice,
    gst_percent: gstPercent || DEFAULT_GST_PERCENT,
    weight_grams: weightGrams,
    stock_qty: stockQty,
    status: stockQty > 0 ? "active" : "out_of_stock",
    product_url: url,
    image_urls: imageUrls,
    debug_extract: {
      priceCandidates,
      gstCandidates,
      weightCandidates,
      skuCandidates,
      stockCandidates,
    },
    raw_payload: {
      source: "html-scrape",
      product_url: url,
      image_urls: imageUrls,
      text_excerpt: text.slice(0, 4000),
    },
    last_synced_at: new Date().toISOString(),
  };
}

async function crawlWukusyProducts({
  startUrl = DEFAULT_START_URL,
  cookie = process.env.WUKUSY_COOKIE || "",
  delayMs = DEFAULT_DELAY_MS,
  limit = null,
} = {}) {
  if (!cookie) {
    throw new Error("Missing WUKUSY_COOKIE. Required for authenticated Wukusy crawl.");
  }

  const visitedCategoryLinks = new Set();
  const queuedCategoryLinks = [startUrl];
  const discoveredProductLinks = new Set();
  const products = [];
  const shouldStopCategoryDiscovery = () =>
    typeof limit === "number" && limit > 0 && discoveredProductLinks.size >= limit;

  while (queuedCategoryLinks.length > 0) {
    if (shouldStopCategoryDiscovery()) {
      break;
    }

    const nextCategoryUrl = queuedCategoryLinks.shift();

    if (!nextCategoryUrl || visitedCategoryLinks.has(nextCategoryUrl)) {
      continue;
    }

    visitedCategoryLinks.add(nextCategoryUrl);
    const html = await fetchHtml(nextCategoryUrl, cookie, startUrl);

    extractProductLinks(html, nextCategoryUrl).forEach((link) => {
      discoveredProductLinks.add(link);
    });

    if (!shouldStopCategoryDiscovery()) {
      extractCategoryLinks(html, nextCategoryUrl).forEach((link) => {
        if (!visitedCategoryLinks.has(link)) {
          queuedCategoryLinks.push(link);
        }
      });
    }

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  const productLinks = Array.from(discoveredProductLinks);
  const selectedProductLinks =
    typeof limit === "number" && limit > 0 ? productLinks.slice(0, limit) : productLinks;

  for (const productUrl of selectedProductLinks) {
    const html = await fetchHtml(productUrl, cookie, startUrl);
    products.push(extractDetailData(html, productUrl));

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return products;
}

function chunk(array, size = 100) {
  const items = Array.isArray(array) ? array : [];
  const result = [];

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }

  return result;
}

function readJsonFile(filePath) {
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Wukusy source file not found: ${resolvedPath}`);
  }

  return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
}

async function fetchJsonFromUrl(url) {
  const headers = {
    accept: "application/json,text/plain,*/*",
    "user-agent": "Mozilla/5.0 (compatible; TrustTroveBot/1.0; +https://trusttrove.local)",
  };

  if (process.env.WUKUSY_API_TOKEN) {
    headers.authorization = `Bearer ${process.env.WUKUSY_API_TOKEN}`;
  }

  const response = await fetch(url, { headers, cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Wukusy request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function extractProductsFromPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  const candidates = [
    payload?.products,
    payload?.items,
    payload?.data,
    payload?.result,
    payload?.catalog,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function getFirstDefined(source, keys, fallback = null) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== "") {
      return source[key];
    }
  }

  return fallback;
}

function resolveImportedStockQty(rawProduct) {
  const fallbackStockQty = normalizeInteger(
    getFirstDefined(rawProduct, [
      "stock_qty",
      "stock",
      "inventory",
      "inventory_qty",
      "available_qty",
      "available_quantity",
      "quantity",
    ])
  );
  const stockCandidates = [
    ...(Array.isArray(rawProduct?.stockCandidates) ? rawProduct.stockCandidates : []),
    ...(Array.isArray(rawProduct?.debug_extract?.stockCandidates) ? rawProduct.debug_extract.stockCandidates : []),
    ...(Array.isArray(rawProduct?.raw_payload?.stockCandidates) ? rawProduct.raw_payload.stockCandidates : []),
    ...(Array.isArray(rawProduct?.raw_payload?.debug_extract?.stockCandidates)
      ? rawProduct.raw_payload.debug_extract.stockCandidates
      : []),
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  for (const candidate of stockCandidates) {
    if (/out of stock|unavailable|0\s*pcs?\s*left/i.test(candidate)) {
      return 0;
    }

    const numericMatch = candidate.match(/([0-9]+)\s*pcs?\s*left/i);
    if (numericMatch) {
      return normalizeInteger(numericMatch[1]);
    }
  }

  return fallbackStockQty;
}

function normalizeWukusyProduct(rawProduct) {
  const sku = normalizeSku(
    getFirstDefined(rawProduct, [
      "sku",
      "SKU",
      "product_sku",
      "supplier_sku",
      "code",
      "item_code",
    ])
  );

  if (!sku) {
    return null;
  }

  const title = normalizeText(
    getFirstDefined(rawProduct, ["title", "name", "product_name", "item_name"], sku)
  );
  const stockQty = resolveImportedStockQty(rawProduct);
  const gstPercent = roundCurrency(
    getFirstDefined(rawProduct, ["gst_percent", "gst", "tax_percent", "tax"], DEFAULT_GST_PERCENT)
  );
  const weightGrams = normalizeInteger(
    getFirstDefined(rawProduct, ["weight_grams", "weight", "shipping_weight", "weight_gm"])
  );
  const costPrice = roundCurrency(
    getFirstDefined(rawProduct, [
      "cost_price",
      "cost",
      "purchase_price",
      "supplier_cost_price",
      "base_price",
      "price",
    ])
  );

  return {
    wukusy_product_id: normalizeText(
      getFirstDefined(rawProduct, ["id", "product_id", "wukusy_product_id"], sku)
    ),
    sku,
    title,
    cost_price: costPrice,
    gst_percent: gstPercent || DEFAULT_GST_PERCENT,
    weight_grams: weightGrams,
    stock_qty: stockQty,
    status: stockQty > 0 ? "active" : "out_of_stock",
    raw_payload: rawProduct,
    last_synced_at: new Date().toISOString(),
  };
}

export async function fetchWukusyProducts({
  sourceUrl = process.env.WUKUSY_PRODUCTS_URL || "",
  sourceFile = process.env.WUKUSY_PRODUCTS_FILE || "",
  crawl = false,
  startUrl = process.env.WUKUSY_START_URL || DEFAULT_START_URL,
  cookie = process.env.WUKUSY_COOKIE || "",
  delayMs = normalizeInteger(process.env.WUKUSY_CRAWL_DELAY_MS, DEFAULT_DELAY_MS),
  limit = null,
} = {}) {
  let payload = null;

  if (crawl) {
    return crawlWukusyProducts({
      startUrl,
      cookie,
      delayMs,
      limit,
    });
  }

  if (sourceFile) {
    payload = readJsonFile(sourceFile);
  } else if (sourceUrl) {
    payload = await fetchJsonFromUrl(sourceUrl);
  } else {
    return crawlWukusyProducts({
      startUrl,
      cookie,
      delayMs,
      limit,
    });
  }

  return extractProductsFromPayload(payload)
    .map(normalizeWukusyProduct)
    .filter(Boolean);
}

async function upsertWukusyProducts(products) {
  const supabase = getSupabaseAdmin();
  const rows = chunk(
    products.map((product) => ({
      wukusy_product_id: product.wukusy_product_id,
      sku: product.sku,
      title: product.title,
      cost_price: roundCurrency(product.cost_price),
      gst_percent: roundCurrency(product.gst_percent),
      weight_grams: normalizeInteger(product.weight_grams),
      stock_qty: normalizeInteger(product.stock_qty),
      status: product.status,
      raw_payload: product.raw_payload,
      last_synced_at: product.last_synced_at || new Date().toISOString(),
    })),
    100
  );
  let upsertedCount = 0;

  for (const batch of rows) {
    const { error } = await supabase.from("wukusy_products").upsert(batch, {
      onConflict: "sku",
    });

    if (error) {
      throw new Error(`Failed to upsert Wukusy products: ${error.message}`);
    }

    upsertedCount += batch.length;
  }

  return upsertedCount;
}

async function getLocalVariants() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("variants")
    .select("id, product_id, sku, price_compare, status")
    .eq("status", "active");

  if (error) {
    throw new Error(`Failed to load local variants: ${error.message}`);
  }

  return data || [];
}

async function syncMatchedVariants(wukusyProducts, options = {}) {
  const supabase = getSupabaseAdmin();
  const localVariants = await getLocalVariants();
  const localVariantsBySku = new Map();
  const localVariantsByCompactSku = new Map();

  for (const variant of localVariants) {
    const normalized = normalizeSku(variant.sku);
    const compact = compactSku(variant.sku);

    if (normalized) {
      localVariantsBySku.set(normalized, variant);
    }

    if (compact) {
      localVariantsByCompactSku.set(compact, variant);
    }
  }

  const matchedVariants = [];
  const unmatchedProducts = [];
  const touchedProductIds = new Set();
  const matchedVariantIds = new Set();

  for (const item of wukusyProducts) {
    const matchedVariant =
      localVariantsBySku.get(item.sku) ||
      localVariantsByCompactSku.get(compactSku(item.sku));

    if (!matchedVariant) {
      unmatchedProducts.push(item);
      continue;
    }

    const pricing = calculateSupplierDisplayPrice({
      costPrice: item.cost_price,
      gstPercent: item.gst_percent,
      weightGrams: item.weight_grams,
      marginAmount: options.marginAmount ?? DEFAULT_MARGIN_AMOUNT,
    });
    const supplierWeightGrams = normalizeInteger(
      getFirstDefined(item.raw_payload, ["weight_grams", "weight", "shipping_weight", "weight_gm"])
    );

    matchedVariants.push({
      variantId: matchedVariant.id,
      productId: matchedVariant.product_id,
      sourceSku: item.sku,
      sourceProductId: item.wukusy_product_id,
      stockQty: item.stock_qty,
      pricing,
      supplierWeightGrams,
      rawPayload: item.raw_payload,
      comparePrice: roundCurrency(matchedVariant.price_compare || Math.ceil(pricing.displayPriceFinal * 1.4)),
    });
    touchedProductIds.add(matchedVariant.product_id);
    matchedVariantIds.add(matchedVariant.id);
  }

  for (const batch of chunk(matchedVariants, 50)) {
    const batchSyncedAt = new Date().toISOString();

    for (const entry of batch) {
      const { error: variantError } = await supabase
        .from("variants")
        .update({
          supplier_name: "wukusy",
          supplier_sku: entry.sourceSku,
          supplier_product_id: entry.sourceProductId,
          supplier_cost_price: entry.pricing.costPrice,
          supplier_gst_percent: entry.pricing.gstPercent,
          supplier_weight_grams: entry.supplierWeightGrams,
          cost_price: entry.pricing.costPrice,
          gst_percent: entry.pricing.gstPercent,
          weight_grams: entry.supplierWeightGrams,
          estimated_shipping_share: entry.pricing.estimatedShippingShare,
          shipping_tax_amount: entry.pricing.shippingTaxAmount,
          margin_amount: entry.pricing.marginAmount,
          display_price_final: entry.pricing.displayPriceFinal,
          price_selling: entry.pricing.displayPriceFinal,
          price_compare: Math.max(entry.comparePrice, entry.pricing.displayPriceFinal),
          inventory_quantity: entry.stockQty,
          last_supplier_sync_at: batchSyncedAt,
        })
        .eq("id", entry.variantId);

      if (variantError) {
        throw new Error(`Failed to sync variant ${entry.variantId}: ${variantError.message}`);
      }
    }

    const supplierMapBatch = batch.map((entry) => ({
      product_id: entry.productId,
      variant_id: entry.variantId,
      supplier: "wukusy",
      source_product_id: entry.sourceProductId,
      source_sku: entry.sourceSku,
      match_status: "matched",
    }));

    const { error: mapError } = await supabase.from("product_supplier_map").upsert(
      supplierMapBatch,
      { onConflict: "variant_id,supplier" }
    );

    if (mapError) {
      throw new Error(`Failed to upsert supplier map: ${mapError.message}`);
    }

    const supplierSyncBatch = batch.map((entry) => ({
      variant_id: entry.variantId,
      supplier: "wukusy",
      supplier_sku: entry.sourceSku,
      supplier_product_id: entry.sourceProductId,
      supplier_cost_price: entry.pricing.costPrice,
      supplier_gst_percent: entry.pricing.gstPercent,
      supplier_weight_grams: entry.supplierWeightGrams,
      supplier_stock_qty: entry.stockQty,
      estimated_shipping_share: entry.pricing.estimatedShippingShare,
      shipping_tax_amount: entry.pricing.shippingTaxAmount,
      margin_amount: entry.pricing.marginAmount,
      display_price_final: entry.pricing.displayPriceFinal,
      raw_snapshot: entry.rawPayload,
      last_synced_at: batchSyncedAt,
    }));

    const { error: syncError } = await supabase.from("variant_supplier_sync").upsert(
      supplierSyncBatch,
      { onConflict: "variant_id" }
    );

    if (syncError) {
      throw new Error(`Failed to upsert variant supplier sync: ${syncError.message}`);
    }
  }

  if (options.hideUnmatchedVariants) {
    const unmatchedVariantIds = localVariants
      .filter((variant) => !matchedVariantIds.has(variant.id))
      .map((variant) => variant.id);

    for (const batch of chunk(unmatchedVariantIds, 100)) {
      const { error } = await supabase
        .from("variants")
        .update({
          inventory_quantity: 0,
          last_supplier_sync_at: new Date().toISOString(),
        })
        .in("id", batch);

      if (error) {
        throw new Error(`Failed to hide unmatched variants: ${error.message}`);
      }
    }
  }

  return {
    matchedCount: matchedVariants.length,
    unmatchedCount: unmatchedProducts.length,
    touchedProductIds: Array.from(touchedProductIds),
    unmatchedProducts: unmatchedProducts.slice(0, 20).map((item) => ({
      sku: item.sku,
      title: item.title,
    })),
  };
}

export async function syncWukusyCatalog(options = {}) {
  const products = await fetchWukusyProducts(options);
  const upsertedCount = await upsertWukusyProducts(products);
  const syncSummary = await syncMatchedVariants(products, {
    marginAmount: options.marginAmount,
    hideUnmatchedVariants: options.hideUnmatchedVariants ?? false,
  });

  await clearCatalogCache();

  return {
    ok: true,
    fetchedCount: products.length,
    upsertedCount,
    ...syncSummary,
  };
}

export async function syncWukusyAndWarmCache(options = {}) {
  const syncResult = await syncWukusyCatalog(options);
  const warmedCache = await warmCatalogCache();

  return {
    ...syncResult,
    warmedCache,
  };
}
