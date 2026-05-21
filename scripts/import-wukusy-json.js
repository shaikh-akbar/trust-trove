/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_INPUT_JSON = path.join(process.cwd(), "public", "wukusy-products.json");
const DEFAULT_SUPABASE_BATCH_SIZE = 25;
const DEFAULT_SUPABASE_DELAY_MS = 350;
const DEFAULT_SUPABASE_RETRY_COUNT = 6;
const DEFAULT_MARGIN_AMOUNT = 40;

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT_JSON,
    supabaseBatchSize: DEFAULT_SUPABASE_BATCH_SIZE,
    supabaseDelayMs: DEFAULT_SUPABASE_DELAY_MS,
    marginAmount: DEFAULT_MARGIN_AMOUNT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    const nextValue = argv[index + 1];

    if (value === "--help" || value === "-h") {
      args.help = true;
      continue;
    }

    switch (value) {
      case "--input":
        args.input = nextValue ? path.resolve(process.cwd(), nextValue) : args.input;
        index += 1;
        break;
      case "--supabase-batch-size":
        args.supabaseBatchSize = toInteger(nextValue) ?? args.supabaseBatchSize;
        index += 1;
        break;
      case "--supabase-delay-ms":
        args.supabaseDelayMs = toInteger(nextValue) ?? args.supabaseDelayMs;
        index += 1;
        break;
      case "--margin-amount":
        args.marginAmount = toNumber(nextValue, args.marginAmount);
        index += 1;
        break;
      default:
        break;
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Usage:
  node scripts/import-wukusy-json.js [options]

Options:
  --input <path>              Input JSON path
  --supabase-batch-size <n>   Batch size for Supabase upsert/insert/delete
  --supabase-delay-ms <n>     Delay between Supabase batches
  --margin-amount <n>         Margin amount used for final selling price
  --help                      Show this help

Examples:
  node scripts/import-wukusy-json.js
  node scripts/import-wukusy-json.js --input public/wukusy-products.json
  node scripts/import-wukusy-json.js --margin-amount 50
`);
}

function toInteger(value) {
  if (value == null) {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundCurrency(value) {
  return Math.round(toNumber(value, 0) * 100) / 100;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function removeInvalidUnicode(value) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "")
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");
}

function safeTruncate(value, maxLength) {
  const cleaned = removeInvalidUnicode(value);
  if (!maxLength || cleaned.length <= maxLength) {
    return cleaned;
  }

  return Array.from(cleaned).slice(0, maxLength).join("");
}

function slugify(value) {
  return String(value || "wukusy-product")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategoryTitle(value, fallback = "Uncategorized") {
  const normalized = safeTruncate(value || "", 255).replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  if (/^\d+$/.test(normalized)) {
    return fallback;
  }

  if (/^category\s+\d+$/i.test(normalized)) {
    return fallback;
  }

  return normalized;
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function pickPrimaryImage(imageUrls = []) {
  const filtered = unique(imageUrls).filter((url) => !/\/img\/wukusy\.webp$/i.test(url));
  return filtered[0] || unique(imageUrls)[0] || "";
}

function normalizeProductsPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.products)) {
    return payload.products;
  }

  return [];
}

function estimateShippingShare(weightGrams) {
  const normalizedWeight = Math.max(0, toNumber(weightGrams, 0));
  const shippingSlabs = [
    { maxWeightGrams: 500, amount: 40 },
    { maxWeightGrams: 1000, amount: 70 },
    { maxWeightGrams: 2000, amount: 90 },
    { maxWeightGrams: 3000, amount: 100 },
    { maxWeightGrams: 4000, amount: 120 },
    { maxWeightGrams: 5000, amount: 140 },
    { maxWeightGrams: 10000, amount: 200 },
  ];
  const slab =
    shippingSlabs.find((entry) => normalizedWeight <= entry.maxWeightGrams) ||
    shippingSlabs[shippingSlabs.length - 1];

  return roundCurrency(slab?.amount || 0);
}

function calculateSupplierDisplayPrice({ costPrice, gstPercent, weightGrams, marginAmount }) {
  const supplierCost = Math.max(0, toNumber(costPrice, 0));
  const resolvedGstPercent = 18;
  const shippingShare = estimateShippingShare(weightGrams);
  const gstAmount = roundCurrency(supplierCost * (resolvedGstPercent / 100));
  const shippingTaxAmount = roundCurrency(shippingShare * (18 / 100));
  const resolvedMarginAmount = roundCurrency(marginAmount);
  const displayPriceFinal = Math.ceil(
    roundCurrency(
      supplierCost + gstAmount + shippingShare + shippingTaxAmount + resolvedMarginAmount
    )
  );

  return {
    costPrice: supplierCost,
    gstPercent: resolvedGstPercent,
    estimatedShippingShare: shippingShare,
    shippingTaxAmount,
    marginAmount: resolvedMarginAmount,
    displayPriceFinal,
  };
}

function buildSupabaseProducts(products) {
  return products.map((product) => {
    const title = safeTruncate(product.title || `Wukusy Product ${product.wukusy_product_id}`, 255);
    const slugBase = slugify(`${title}-${product.wukusy_product_id}`);
    const primaryImage = pickPrimaryImage(product.image_urls);
    const shortDescription = safeTruncate(title, 220);
    const categoryTitle = normalizeCategoryTitle(product.category_title);
    const categoryHandle = slugify(product.category_handle || categoryTitle);
    const productTags = unique(["wukusy", categoryHandle]).map((tag) => safeTruncate(tag, 255));

    return {
      handle: slugBase,
      slug: slugBase,
      title,
      description: title,
      short_description: shortDescription,
      vendor: "Wukusy",
      brand: "Wukusy",
      category: categoryTitle,
      product_type: categoryTitle,
      tags: productTags,
      main_image: primaryImage,
      status: product.status === "active" ? "active" : "inactive",
      supplier_name: "wukusy",
      supplier_product_code: safeTruncate(product.sku || product.wukusy_product_id, 255),
      seo_title: title,
      seo_description: shortDescription,
      is_featured: false,
      is_cod_available: true,
      shipping_charge: 0,
      cod_charge: 0,
      platform_fee: 0,
      convenience_fee: 0,
    };
  });
}

function buildSupabaseVariants(products, productIdMap, options) {
  const variants = [];

  for (const product of products) {
    const productId = productIdMap.get(product.wukusy_product_id);
    if (!productId) {
      continue;
    }

    const pricing = calculateSupplierDisplayPrice({
      costPrice: product.cost_price,
      gstPercent: product.gst_percent,
      weightGrams: product.weight_grams,
      marginAmount: options.marginAmount,
    });

    variants.push({
      product_id: productId,
      sku: safeTruncate(product.sku || `WUKUSY-${product.wukusy_product_id}`, 255),
      option1_name: "Title",
      option1_value: "Default Title",
      price_selling: pricing.displayPriceFinal,
      price_compare: Math.max(Math.ceil(pricing.displayPriceFinal * 1.4), pricing.displayPriceFinal),
      barcode: "",
      weight_grams: Math.max(0, toInteger(product.weight_grams) || 0),
      inventory_quantity: Math.max(0, toInteger(product.stock_qty) || 0),
      is_default: true,
      status: product.status === "active" ? "active" : "inactive",
      gst_percent: pricing.gstPercent,
      cost_price: pricing.costPrice,
      supplier_name: "wukusy",
      supplier_sku: safeTruncate(product.sku || `WUKUSY-${product.wukusy_product_id}`, 255),
      supplier_product_id: safeTruncate(product.wukusy_product_id, 255),
      supplier_cost_price: pricing.costPrice,
      supplier_gst_percent: pricing.gstPercent,
      supplier_weight_grams: Math.max(0, toInteger(product.weight_grams) || 0),
      estimated_shipping_share: pricing.estimatedShippingShare,
      shipping_tax_amount: pricing.shippingTaxAmount,
      margin_amount: pricing.marginAmount,
      display_price_final: pricing.displayPriceFinal,
      last_supplier_sync_at: new Date().toISOString(),
    });
  }

  return variants;
}

function buildSupabaseImages(products, productIdMap) {
  const images = [];

  for (const product of products) {
    const productId = productIdMap.get(product.wukusy_product_id);
    if (!productId) {
      continue;
    }

    unique(product.image_urls)
      .filter((url) => !/\/img\/wukusy\.webp$/i.test(url))
      .forEach((imageUrl, index) => {
        images.push({
          product_id: productId,
          src: imageUrl,
          position: index + 1,
          alt_text: safeTruncate(product.title || "Wukusy product image", 255),
        });
      });
  }

  return images;
}

function buildWukusyProducts(products) {
  return products.map((product) => ({
    wukusy_product_id: safeTruncate(product.wukusy_product_id, 255),
    sku: safeTruncate(product.sku || `WUKUSY-${product.wukusy_product_id}`, 255),
    title: safeTruncate(product.title || `Wukusy Product ${product.wukusy_product_id}`, 255),
    cost_price: roundCurrency(product.cost_price),
    gst_percent: roundCurrency(product.gst_percent || 18),
    weight_grams: Math.max(0, toInteger(product.weight_grams) || 0),
    stock_qty: Math.max(0, toInteger(product.stock_qty) || 0),
    status: product.status === "active" ? "active" : "out_of_stock",
    raw_payload: product.raw_payload || product,
    last_synced_at: new Date().toISOString(),
  }));
}

function isSupabaseRateLimitError(error) {
  const message = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toLowerCase();

  return (
    code === "429" ||
    message.includes("429") ||
    message.includes("too many requests") ||
    message.includes("rate limit")
  );
}

async function runSupabaseMutation(label, mutation, maxRetries = DEFAULT_SUPABASE_RETRY_COUNT) {
  let attempt = 0;

  while (true) {
    const result = await mutation();
    const error = result?.error;

    if (!error) {
      return result;
    }

    const shouldRetry = isSupabaseRateLimitError(error) && attempt < maxRetries;
    if (!shouldRetry) {
      throw new Error(`${label}: ${error.message}`);
    }

    const delayMs = Math.min(2000 * 2 ** attempt, 30000);
    console.warn(
      `Retrying ${label} after ${delayMs}ms because of Supabase rate limiting (attempt ${attempt + 1}/${maxRetries}).`
    );
    await sleep(delayMs);
    attempt += 1;
  }
}

async function chunkedDelete(table, column, values, supabase, options = {}) {
  const chunkSize = Math.max(1, Number(options.supabaseBatchSize || DEFAULT_SUPABASE_BATCH_SIZE));
  const delayMs = Math.max(0, Number(options.supabaseDelayMs || DEFAULT_SUPABASE_DELAY_MS));

  for (let index = 0; index < values.length; index += chunkSize) {
    const chunk = values.slice(index, index + chunkSize);
    await runSupabaseMutation(
      `${table} delete batch ${Math.floor(index / chunkSize) + 1}/${Math.ceil(values.length / chunkSize)}`,
      () => supabase.from(table).delete().in(column, chunk)
    );

    if (delayMs > 0 && index + chunkSize < values.length) {
      await sleep(delayMs);
    }
  }
}

async function chunkedInsert(table, rows, supabase, options = {}) {
  const chunkSize = Math.max(1, Number(options.supabaseBatchSize || DEFAULT_SUPABASE_BATCH_SIZE));
  const delayMs = Math.max(0, Number(options.supabaseDelayMs || DEFAULT_SUPABASE_DELAY_MS));

  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    await runSupabaseMutation(
      `${table} insert batch ${Math.floor(index / chunkSize) + 1}/${Math.ceil(rows.length / chunkSize)}`,
      () => supabase.from(table).insert(chunk)
    );

    if (delayMs > 0 && index + chunkSize < rows.length) {
      await sleep(delayMs);
    }
  }
}

async function chunkedUpsert(table, rows, conflictColumn, supabase, options = {}, selectFields = "*") {
  const chunkSize = Math.max(1, Number(options.supabaseBatchSize || DEFAULT_SUPABASE_BATCH_SIZE));
  const delayMs = Math.max(0, Number(options.supabaseDelayMs || DEFAULT_SUPABASE_DELAY_MS));
  const collected = [];

  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const { data } = await runSupabaseMutation(
      `${table} upsert batch ${Math.floor(index / chunkSize) + 1}/${Math.ceil(rows.length / chunkSize)}`,
      () =>
        supabase
          .from(table)
          .upsert(chunk, { onConflict: conflictColumn })
          .select(selectFields)
    );

    collected.push(...(data || []));

    if (delayMs > 0 && index + chunkSize < rows.length) {
      await sleep(delayMs);
    }
  }

  return collected;
}

async function importToSupabase(products, options) {
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const wukusyRows = buildWukusyProducts(products);
  if (wukusyRows.length) {
    await chunkedUpsert("wukusy_products", wukusyRows, "sku", supabase, options);
  }

  const productRows = buildSupabaseProducts(products);
  const upsertedProducts = await chunkedUpsert(
    "products",
    productRows,
    "handle",
    supabase,
    options,
    "id, handle"
  );

  const productIdMap = new Map();
  for (let index = 0; index < products.length; index += 1) {
    const sourceProduct = products[index];
    const upserted = upsertedProducts[index];
    if (sourceProduct?.wukusy_product_id && upserted?.id) {
      productIdMap.set(sourceProduct.wukusy_product_id, upserted.id);
    }
  }

  const productIds = Array.from(productIdMap.values());
  if (!productIds.length) {
    throw new Error("No products were imported into Supabase.");
  }

  await chunkedDelete("variants", "product_id", productIds, supabase, options);
  await chunkedDelete("product_images", "product_id", productIds, supabase, options);

  const variantRows = buildSupabaseVariants(products, productIdMap, options);
  const imageRows = buildSupabaseImages(products, productIdMap);

  if (variantRows.length) {
    await chunkedInsert("variants", variantRows, supabase, options);
  }

  if (imageRows.length) {
    await chunkedInsert("product_images", imageRows, supabase, options);
  }

  const insertedVariantSkus = variantRows.map((variant) => variant.sku);
  const { data: insertedVariants, error: variantsFetchError } = await supabase
    .from("variants")
    .select("id, product_id, sku, supplier_sku, supplier_product_id, supplier_cost_price, supplier_gst_percent, supplier_weight_grams, inventory_quantity, estimated_shipping_share, shipping_tax_amount, margin_amount, display_price_final")
    .in("sku", insertedVariantSkus);

  if (variantsFetchError) {
    throw new Error(`Failed to fetch imported variants: ${variantsFetchError.message}`);
  }

  const supplierMapRows = (insertedVariants || []).map((variant) => ({
    product_id: variant.product_id,
    variant_id: variant.id,
    supplier: "wukusy",
    source_product_id: variant.supplier_product_id,
    source_sku: variant.supplier_sku || variant.sku,
    match_status: "matched",
  }));

  const supplierSyncRows = (insertedVariants || []).map((variant) => ({
    variant_id: variant.id,
    supplier: "wukusy",
    supplier_sku: variant.supplier_sku || variant.sku,
    supplier_product_id: variant.supplier_product_id,
    supplier_cost_price: variant.supplier_cost_price || 0,
    supplier_gst_percent: variant.supplier_gst_percent || 18,
    supplier_weight_grams: variant.supplier_weight_grams || 0,
    supplier_stock_qty: variant.inventory_quantity || 0,
    estimated_shipping_share: variant.estimated_shipping_share || 0,
    shipping_tax_amount: variant.shipping_tax_amount || 0,
    margin_amount: variant.margin_amount || 0,
    display_price_final: variant.display_price_final || 0,
    raw_snapshot: {},
    last_synced_at: new Date().toISOString(),
  }));

  if (supplierMapRows.length) {
    await chunkedUpsert(
      "product_supplier_map",
      supplierMapRows,
      "variant_id,supplier",
      supabase,
      options
    );
  }

  if (supplierSyncRows.length) {
    await chunkedUpsert(
      "variant_supplier_sync",
      supplierSyncRows,
      "variant_id",
      supabase,
      options
    );
  }

  const { error: cacheError } = await supabase
    .from("catalog_cache")
    .delete()
    .like("key", "gomodex:catalog:v2%");

  if (cacheError && cacheError.code !== "42P01") {
    throw new Error(`Failed to clear catalog cache: ${cacheError.message}`);
  }

  console.log(
    `Imported ${productRows.length} products, ${variantRows.length} variants, and ${imageRows.length} images into Supabase.`
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (!fs.existsSync(options.input)) {
    throw new Error(`Input JSON file not found: ${options.input}`);
  }

  const payload = JSON.parse(fs.readFileSync(options.input, "utf8"));
  const products = normalizeProductsPayload(payload);

  if (!Array.isArray(products) || !products.length) {
    throw new Error("Expected a Wukusy products JSON payload with a non-empty products array.");
  }

  await importToSupabase(products, options);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
