const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_INPUT_JSON = path.join(process.cwd(), "public", "deodap-products.json");
const DEFAULT_SUPABASE_BATCH_SIZE = 25;
const DEFAULT_SUPABASE_DELAY_MS = 350;
const DEFAULT_SUPABASE_RETRY_COUNT = 6;
const DEFAULT_INVENTORY_QUANTITY = 100;

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT_JSON,
    defaultInventory: DEFAULT_INVENTORY_QUANTITY,
    supabaseBatchSize: DEFAULT_SUPABASE_BATCH_SIZE,
    supabaseDelayMs: DEFAULT_SUPABASE_DELAY_MS,
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
      case "--default-inventory":
        args.defaultInventory = toInteger(nextValue) ?? args.defaultInventory;
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
      default:
        break;
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Usage:
  node scripts/import-deodap-json.js [options]

Options:
  --input <path>              Input JSON path
  --default-inventory <n>     Inventory used when a variant is available
  --supabase-batch-size <n>   Batch size for Supabase upsert/insert/delete
  --supabase-delay-ms <n>     Delay between Supabase batches
  --help                      Show this help

Examples:
  node scripts/import-deodap-json.js
  node scripts/import-deodap-json.js --input public/deodap-products.json
`);
}

function toInteger(value) {
  if (value == null) {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
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

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(html) {
  return decodeHtml(String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
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

function normalizeImages(images) {
  const sourceImages = Array.isArray(images)
    ? images
    : images == null
      ? []
      : [images];

  return sourceImages
    .map((image, index) => {
      const src =
        typeof image === "string"
          ? image
          : image?.src || image?.url || image?.secure_url || image?.["@id"];

      if (!src) {
        return null;
      }

      return {
        src,
        position: Number(image?.position || index + 1),
        alt_text: image?.alt || image?.alt_text || "",
      };
    })
    .filter(Boolean);
}

function parseNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value || "").replace(/[^0-9.-]/g, "");
  if (!normalized) {
    return 0;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseGstPercent(value) {
  const match = String(value || "").match(/gst\s*[:-]?\s*(\d+(?:\.\d+)?)\s*%/i);
  return match ? parseNumber(match[1]) : null;
}

function buildSupabaseProducts(products) {
  return products.map((product) => {
    const images = normalizeImages(product.images);
    const firstVariant = Array.isArray(product.variants) ? product.variants[0] : null;
    const shortDescription = safeTruncate(stripHtml(product.body_html), 220);
    const normalizedCategory = removeInvalidUnicode(product.product_type || "").trim() || "Uncategorized";

    return {
      handle: product.handle,
      slug: product.handle,
      title: removeInvalidUnicode(product.title),
      description: removeInvalidUnicode(product.body_html || ""),
      short_description: shortDescription,
      vendor: removeInvalidUnicode(product.vendor || ""),
      brand: removeInvalidUnicode(product.vendor || ""),
      category: normalizedCategory,
      product_type: normalizedCategory,
      tags: normalizeTags(product.tags).map(removeInvalidUnicode),
      main_image: removeInvalidUnicode(images[0]?.src || ""),
      status: removeInvalidUnicode(product.status || "active"),
      supplier_name: "DeoDap",
      supplier_product_code: removeInvalidUnicode(firstVariant?.sku || product.handle),
      seo_title: removeInvalidUnicode(product.title || ""),
      seo_description: shortDescription,
    };
  });
}

function buildSupabaseVariants(products, productIdMap, options) {
  const variants = [];

  for (const product of products) {
    const productId = productIdMap.get(product.handle);
    if (!productId) {
      continue;
    }

    const sourceVariants = Array.isArray(product.variants) && product.variants.length
      ? product.variants
      : [
          {
            title: "Default Title",
            option1: "Default Title",
            sku: product.handle,
            price: "0",
            compare_at_price: null,
            grams: 0,
            barcode: "",
          },
        ];

    sourceVariants.forEach((variant, index) => {
      const variantInventory = variant.available === false ? 0 : Number(options.defaultInventory || DEFAULT_INVENTORY_QUANTITY);
      const gstPercent = parseGstPercent(product.body_html);
      variants.push({
        product_id: productId,
        sku: removeInvalidUnicode(variant.sku || `${product.handle}-${index + 1}`),
        option1_name: "Title",
        option1_value: removeInvalidUnicode(variant.option1 || variant.title || "Default Title"),
        price_selling: parseNumber(variant.price),
        price_compare: parseNumber(variant.compare_at_price),
        barcode: removeInvalidUnicode(variant.barcode || ""),
        weight_grams: Number(variant.grams || 0),
        inventory_quantity: variantInventory,
        is_default: index === 0,
        status: "active",
        gst_percent: gstPercent,
      });
    });
  }

  return variants;
}

function buildSupabaseImages(products, productIdMap) {
  const images = [];

  for (const product of products) {
    const productId = productIdMap.get(product.handle);
    if (!productId) {
      continue;
    }

    normalizeImages(product.images).forEach((image, index) => {
      images.push({
        product_id: productId,
        src: removeInvalidUnicode(image.src),
        position: Number(image.position || index + 1),
        alt_text: removeInvalidUnicode(image.alt_text || product.title || "Product image"),
      });
    });
  }

  return images;
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

async function chunkedUpsertProducts(rows, supabase, options = {}) {
  const chunkSize = Math.max(1, Number(options.supabaseBatchSize || DEFAULT_SUPABASE_BATCH_SIZE));
  const delayMs = Math.max(0, Number(options.supabaseDelayMs || DEFAULT_SUPABASE_DELAY_MS));
  const collected = [];

  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const { data } = await runSupabaseMutation(
      `products upsert batch ${Math.floor(index / chunkSize) + 1}/${Math.ceil(rows.length / chunkSize)}`,
      () =>
        supabase
          .from("products")
          .upsert(chunk, { onConflict: "handle" })
          .select("id, handle")
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

  const productRows = buildSupabaseProducts(products);
  const upsertedProducts = await chunkedUpsertProducts(productRows, supabase, options);

  const productIdMap = new Map((upsertedProducts || []).map((row) => [row.handle, row.id]));
  const productIds = Array.from(productIdMap.values());

  if (!productIds.length) {
    console.log("No products were imported.");
    return;
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
  if (!Array.isArray(payload)) {
    throw new Error("Expected a JSON array of DeoDap products.");
  }

  await importToSupabase(payload, options);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
