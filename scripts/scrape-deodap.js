const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_BASE_URL = "https://deodap.in";
const DEFAULT_PAGE_SIZE = 250;
const DEFAULT_DELAY_MS = 150;
const DEFAULT_RETRY_COUNT = 6;
const DEFAULT_INVENTORY_QUANTITY = 100;
const DEFAULT_OUTPUT_CSV = path.join(process.cwd(), "public", "deodap-products.csv");
const DEFAULT_OUTPUT_JSON = path.join(process.cwd(), "public", "deodap-products.json");
const DEFAULT_COLLECTIONS_JSON = path.join(process.cwd(), "public", "deodap-collections.json");
const DEFAULT_COLLECTION_PRODUCTS_JSON = path.join(process.cwd(), "public", "deodap-collection-products.json");
const DEFAULT_SUPABASE_BATCH_SIZE = 25;
const DEFAULT_SUPABASE_DELAY_MS = 350;
const DEFAULT_SUPABASE_RETRY_COUNT = 6;

function parseArgs(argv) {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
    limit: null,
    delayMs: DEFAULT_DELAY_MS,
    csvOut: DEFAULT_OUTPUT_CSV,
    jsonOut: DEFAULT_OUTPUT_JSON,
    collectionsJsonOut: DEFAULT_COLLECTIONS_JSON,
    collectionProductsJsonOut: DEFAULT_COLLECTION_PRODUCTS_JSON,
    importToSupabase: false,
    maxPages: null,
    defaultInventory: DEFAULT_INVENTORY_QUANTITY,
    supabaseBatchSize: DEFAULT_SUPABASE_BATCH_SIZE,
    supabaseDelayMs: DEFAULT_SUPABASE_DELAY_MS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--import") {
      args.importToSupabase = true;
      continue;
    }

    if (value === "--help" || value === "-h") {
      args.help = true;
      continue;
    }

    if (!value.startsWith("--")) {
      continue;
    }

    const nextValue = argv[index + 1];

    switch (value) {
      case "--base-url":
        args.baseUrl = nextValue || args.baseUrl;
        index += 1;
        break;
      case "--limit":
        args.limit = toInteger(nextValue);
        index += 1;
        break;
      case "--delay-ms":
        args.delayMs = toInteger(nextValue) ?? args.delayMs;
        index += 1;
        break;
      case "--csv-out":
        args.csvOut = nextValue ? path.resolve(process.cwd(), nextValue) : args.csvOut;
        index += 1;
        break;
      case "--json-out":
        args.jsonOut = nextValue ? path.resolve(process.cwd(), nextValue) : args.jsonOut;
        index += 1;
        break;
      case "--collections-json-out":
        args.collectionsJsonOut = nextValue ? path.resolve(process.cwd(), nextValue) : args.collectionsJsonOut;
        index += 1;
        break;
      case "--collection-products-json-out":
        args.collectionProductsJsonOut = nextValue
          ? path.resolve(process.cwd(), nextValue)
          : args.collectionProductsJsonOut;
        index += 1;
        break;
      case "--max-pages":
        args.maxPages = toInteger(nextValue);
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
  node scripts/scrape-deodap.js [options]

Options:
  --import                Scrape and push directly into Supabase
  --limit <n>             Stop after n products
  --max-pages <n>         Limit Shopify products.json pages
  --delay-ms <n>          Delay between product HTML requests in fallback mode
  --default-inventory <n> Quantity used for variants marked available by DeoDap
  --supabase-batch-size <n>
                          Batch size for Supabase insert/upsert/delete
  --supabase-delay-ms <n> Delay between Supabase batches
  --csv-out <path>        Output CSV path
  --json-out <path>       Output JSON path
  --collections-json-out <path>
                          Output JSON path for discovered collections
  --collection-products-json-out <path>
                          Output JSON path for collection-product mapping
  --base-url <url>        Override source store URL
  --help                  Show this help

Examples:
  node scripts/scrape-deodap.js --limit 50
  node scripts/scrape-deodap.js --import
  node scripts/scrape-deodap.js --import --limit 200
  node scripts/scrape-deodap.js --import --supabase-batch-size 10 --supabase-delay-ms 800
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

async function fetchWithRetry(url, fetchOptions, maxRetries = DEFAULT_RETRY_COUNT) {
  let attempt = 0;

  while (true) {
    const response = await fetch(url, fetchOptions);

    if (response.ok) {
      return response;
    }

    const isRetriable = response.status === 429 || response.status >= 500;
    if (!isRetriable || attempt >= maxRetries) {
      throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
    }

    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfterSeconds = Number.parseInt(retryAfterHeader || "", 10);
    const delayMs = Number.isFinite(retryAfterSeconds)
      ? retryAfterSeconds * 1000
      : Math.min(5000 * 2 ** attempt, 60000);

    console.warn(
      `Retrying ${url} after ${delayMs}ms because of ${response.status} ${response.statusText} (attempt ${attempt + 1}/${maxRetries}).`
    );

    await sleep(delayMs);
    attempt += 1;
  }
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

async function fetchText(url) {
  const response = await fetchWithRetry(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; TrustTroveBot/1.0; +https://trusttrove.local)",
      accept: "text/html,application/json,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  return response.text();
}

async function fetchJson(url) {
  const response = await fetchWithRetry(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; TrustTroveBot/1.0; +https://trusttrove.local)",
      accept: "application/json,text/plain,*/*",
    },
  });

  return response.json();
}

function xmlLocValues(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/gsi)).map((match) => decodeHtml(match[1].trim()));
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

function slugFromUrl(url) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || null;
  } catch {
    return null;
  }
}

function collectionHandleFromUrl(url) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const collectionsIndex = segments.indexOf("collections");
    if (collectionsIndex === -1) {
      return null;
    }

    const handle = segments[collectionsIndex + 1];
    if (!handle || handle === "all") {
      return null;
    }

    return handle;
  } catch {
    return null;
  }
}

function parseJsonLdBlocks(html) {
  const blocks = Array.from(
    html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  );

  const parsed = [];

  for (const block of blocks) {
    const raw = block[1]?.trim();
    if (!raw) {
      continue;
    }

    try {
      parsed.push(JSON.parse(raw));
    } catch {
      continue;
    }
  }

  return parsed;
}

function findProductJsonLd(jsonLdBlocks) {
  for (const block of jsonLdBlocks) {
    if (block?.["@type"] === "Product") {
      return block;
    }

    if (Array.isArray(block)) {
      const productBlock = block.find((item) => item?.["@type"] === "Product");
      if (productBlock) {
        return productBlock;
      }
    }

    if (Array.isArray(block?.["@graph"])) {
      const productBlock = block["@graph"].find((item) => item?.["@type"] === "Product");
      if (productBlock) {
        return productBlock;
      }
    }
  }

  return null;
}

function matchMetaContent(html, propertyName) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${propertyName}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${propertyName}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${propertyName}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${propertyName}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtml(match[1]);
    }
  }

  return "";
}

function uniqueBy(values, selector) {
  const seen = new Set();
  const collected = [];

  for (const value of values) {
    const key = selector(value);
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    collected.push(value);
  }

  return collected;
}

function absoluteUrl(baseUrl, value) {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

function normalizeCollectionTitle(value, fallbackHandle) {
  const title = String(value || "").replace(/\s+/g, " ").trim();

  if (title) {
    return title;
  }

  return String(fallbackHandle || "Collection")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseCollectionLinks(html, baseUrl) {
  const links = Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));

  return uniqueBy(
    links
      .map((match) => {
        const url = absoluteUrl(baseUrl, decodeHtml(match[1]));
        const handle = collectionHandleFromUrl(url);

        if (!url || !handle) {
          return null;
        }

        const innerText = stripHtml(match[2]);
        return {
          handle,
          url,
          title: normalizeCollectionTitle(innerText, handle),
        };
      })
      .filter(Boolean)
      .filter((item) => item.url.includes("/collections/")),
    (item) => item.handle
  );
}

function parseProductLinksFromCollectionHtml(html, baseUrl) {
  const links = Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi));

  return uniqueBy(
    links
      .map((match) => absoluteUrl(baseUrl, decodeHtml(match[1])))
      .filter(Boolean)
      .filter((url) => /\/products\//.test(url))
      .map((url) => ({
        url,
        handle: slugFromUrl(url),
      }))
      .filter((item) => item.handle),
    (item) => item.handle
  );
}

async function scrapeCollections(baseUrl) {
  const collectionsIndexHtml = await fetchText(`${baseUrl}/collections`);
  const collectionLinks = parseCollectionLinks(collectionsIndexHtml, baseUrl);
  const collections = [];

  for (const collectionLink of collectionLinks) {
    const html = await fetchText(collectionLink.url);
    const title =
      matchMetaContent(html, "og:title") ||
      matchMetaContent(html, "twitter:title") ||
      collectionLink.title;
    const description =
      matchMetaContent(html, "og:description") ||
      matchMetaContent(html, "description") ||
      "";
    const image =
      matchMetaContent(html, "og:image") ||
      matchMetaContent(html, "twitter:image") ||
      "";
    const productLinks = parseProductLinksFromCollectionHtml(html, baseUrl);

    collections.push({
      handle: collectionLink.handle,
      slug: collectionLink.handle,
      title: normalizeCollectionTitle(title, collectionLink.handle),
      url: collectionLink.url,
      description,
      image,
      product_count: productLinks.length,
      product_handles: productLinks.map((item) => item.handle),
      product_urls: productLinks.map((item) => item.url),
    });

    console.log(`Parsed collection ${collectionLink.handle} (${productLinks.length} product links).`);
  }

  return collections;
}

function parseFieldFromDescription(description, label) {
  const pattern = new RegExp(`${label}\\s*:-\\s*([^\\n<]+)`, "i");
  const match = String(description || "").match(pattern);
  return match?.[1]?.trim() || "";
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

function normalizeImages(images) {
  return (images || [])
    .map((image, index) => {
      const src = typeof image === "string" ? image : image?.src;
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

function buildFallbackProductFromHtml(html, productUrl) {
  const jsonLdBlocks = parseJsonLdBlocks(html);
  const productJsonLd = findProductJsonLd(jsonLdBlocks);
  const title =
    productJsonLd?.name ||
    matchMetaContent(html, "og:title") ||
    matchMetaContent(html, "twitter:title") ||
    slugFromUrl(productUrl) ||
    "Untitled product";

  const handle = slugFromUrl(productUrl) || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const description =
    productJsonLd?.description ||
    matchMetaContent(html, "og:description") ||
    matchMetaContent(html, "description") ||
    "";
  const offer = Array.isArray(productJsonLd?.offers)
    ? productJsonLd.offers[0]
    : productJsonLd?.offers || {};
  const images = normalizeImages(productJsonLd?.image || []);
  const price = parseNumber(offer?.price);
  const comparePrice = parseNumber(matchMetaContent(html, "product:price:amount")) || 0;
  const sku = offer?.sku || parseFieldFromDescription(description, "SKU") || handle;
  const weight = parseNumber(parseFieldFromDescription(description, "Ship Weight \\(Gm\\)"));
  const vendor =
    productJsonLd?.brand?.name || productJsonLd?.brand || matchMetaContent(html, "og:site_name") || "DeoDap";

  return {
    title,
    handle,
    body_html: description,
    vendor,
    product_type: "",
    tags: [],
    status: "active",
    images,
    variants: [
      {
        sku,
        title: "Default Title",
        option1: "Default Title",
        price: String(price || 0),
        compare_at_price: comparePrice ? String(comparePrice) : null,
        grams: weight || 0,
        barcode: "",
        inventory_quantity: 0,
      },
    ],
  };
}

async function fetchProductsFromShopifyJson(baseUrl, options) {
  const products = [];
  let page = 1;

  while (true) {
    if (options.maxPages && page > options.maxPages) {
      break;
    }

    const url = `${baseUrl}/products.json?limit=${DEFAULT_PAGE_SIZE}&page=${page}`;
    let payload;

    try {
      payload = await fetchJson(url);
    } catch (error) {
      if (products.length) {
        console.warn(
          `Stopping products.json crawl after ${products.length} products because page ${page} failed: ${error.message}`
        );
        break;
      }

      throw error;
    }

    const batch = Array.isArray(payload?.products) ? payload.products : [];

    if (!batch.length) {
      break;
    }

    products.push(...batch);
    console.log(`Fetched page ${page} from products.json (${batch.length} products).`);

    if (options.limit && products.length >= options.limit) {
      break;
    }

    if (batch.length < DEFAULT_PAGE_SIZE) {
      break;
    }

    page += 1;
    await sleep(options.delayMs);
  }

  return products.slice(0, options.limit || products.length);
}

async function fetchProductsFromSitemap(baseUrl, options) {
  const sitemapXml = await fetchText(`${baseUrl}/sitemap.xml`);
  const sitemapUrls = xmlLocValues(sitemapXml).filter((url) => url.includes("sitemap_products_"));
  const productUrls = [];

  for (const sitemapUrl of sitemapUrls) {
    const xml = await fetchText(sitemapUrl);
    const urls = xmlLocValues(xml).filter((url) => /\/products\//.test(url));
    productUrls.push(...urls);
  }

  const uniqueUrls = Array.from(new Set(productUrls)).slice(0, options.limit || productUrls.length);
  console.log(`Falling back to sitemap crawl (${uniqueUrls.length} product URLs).`);

  const products = [];

  for (let index = 0; index < uniqueUrls.length; index += 1) {
    const productUrl = uniqueUrls[index];
    const html = await fetchText(productUrl);
    products.push(buildFallbackProductFromHtml(html, productUrl));
    console.log(`Parsed product ${index + 1}/${uniqueUrls.length}: ${productUrl}`);
    await sleep(options.delayMs);
  }

  return products;
}

async function scrapeDeodap(options) {
  try {
    const products = await fetchProductsFromShopifyJson(options.baseUrl, options);
    if (products.length) {
      return { source: "products.json", products };
    }
  } catch (error) {
    console.warn(`products.json scrape failed: ${error.message}`);
  }

  const products = await fetchProductsFromSitemap(options.baseUrl, options);
  return { source: "sitemap-html", products };
}

function csvEscape(value) {
  const normalized = value == null ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

function toShopifyCsvRows(products) {
  const rows = [];

  for (const product of products) {
    const images = normalizeImages(product.images);
    const variants = Array.isArray(product.variants) && product.variants.length
      ? product.variants
      : [
          {
            title: "Default Title",
            option1: "Default Title",
            price: "0",
            compare_at_price: null,
            sku: product.handle,
            grams: 0,
            barcode: "",
          },
        ];

    variants.forEach((variant, variantIndex) => {
      const row = {
        Handle: product.handle,
        Title: variantIndex === 0 ? product.title : "",
        "Body (HTML)": variantIndex === 0 ? product.body_html || "" : "",
        Vendor: variantIndex === 0 ? product.vendor || "" : "",
        "Product Category": variantIndex === 0 ? product.product_type || "" : "",
        Type: variantIndex === 0 ? product.product_type || "" : "",
        Tags: variantIndex === 0 ? normalizeTags(product.tags).join(", ") : "",
        Published: variantIndex === 0 ? "TRUE" : "",
        "Option1 Name": "Title",
        "Option1 Value": variant.option1 || variant.title || "Default Title",
        "Option1 Linked To": "",
        "Option2 Name": "",
        "Option2 Value": "",
        "Option2 Linked To": "",
        "Option3 Name": "",
        "Option3 Value": "",
        "Option3 Linked To": "",
        "Variant SKU": variant.sku || "",
        "Variant Grams": variant.grams || 0,
        "Variant Inventory Tracker": "",
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": parseNumber(variant.price),
        "Variant Compare At Price": parseNumber(variant.compare_at_price),
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Variant Barcode": variant.barcode || "",
        "Image Src": images[variantIndex]?.src || (variantIndex === 0 ? images[0]?.src || "" : ""),
        "Image Position": images[variantIndex]?.position || (variantIndex === 0 ? 1 : ""),
        "Image Alt Text": images[variantIndex]?.alt_text || "",
        "Gift Card": "FALSE",
        "SEO Title": variantIndex === 0 ? product.title || "" : "",
        "SEO Description": variantIndex === 0 ? stripHtml(product.body_html).slice(0, 320) : "",
        "Google Shopping / Google Product Category": "",
        "Google Shopping / Gender": "",
        "Google Shopping / Age Group": "",
        "Google Shopping / MPN": "",
        "Google Shopping / Condition": "",
        "Google Shopping / Custom Product": "",
        "Google Shopping / Custom Label 0": "",
        "Google Shopping / Custom Label 1": "",
        "Google Shopping / Custom Label 2": "",
        "Google Shopping / Custom Label 3": "",
        "Google Shopping / Custom Label 4": "",
        "Variant Image": "",
        "Variant Weight Unit": "g",
        "Variant Tax Code": "",
        "Cost per item": "",
        "Included / India": "TRUE",
        "Price / India": parseNumber(variant.price),
        "Compare At Price / India": parseNumber(variant.compare_at_price),
        Status: product.status || "active",
      };

      rows.push(row);
    });

    images.slice(Math.max(variants.length, 1)).forEach((image) => {
      rows.push({
        Handle: product.handle,
        Title: "",
        "Body (HTML)": "",
        Vendor: "",
        "Product Category": "",
        Type: "",
        Tags: "",
        Published: "",
        "Option1 Name": "",
        "Option1 Value": "",
        "Option1 Linked To": "",
        "Option2 Name": "",
        "Option2 Value": "",
        "Option2 Linked To": "",
        "Option3 Name": "",
        "Option3 Value": "",
        "Option3 Linked To": "",
        "Variant SKU": "",
        "Variant Grams": "",
        "Variant Inventory Tracker": "",
        "Variant Inventory Policy": "",
        "Variant Fulfillment Service": "",
        "Variant Price": "",
        "Variant Compare At Price": "",
        "Variant Requires Shipping": "",
        "Variant Taxable": "",
        "Variant Barcode": "",
        "Image Src": image.src,
        "Image Position": image.position,
        "Image Alt Text": image.alt_text || "",
        "Gift Card": "",
        "SEO Title": "",
        "SEO Description": "",
        "Google Shopping / Google Product Category": "",
        "Google Shopping / Gender": "",
        "Google Shopping / Age Group": "",
        "Google Shopping / MPN": "",
        "Google Shopping / Condition": "",
        "Google Shopping / Custom Product": "",
        "Google Shopping / Custom Label 0": "",
        "Google Shopping / Custom Label 1": "",
        "Google Shopping / Custom Label 2": "",
        "Google Shopping / Custom Label 3": "",
        "Google Shopping / Custom Label 4": "",
        "Variant Image": "",
        "Variant Weight Unit": "",
        "Variant Tax Code": "",
        "Cost per item": "",
        "Included / India": "",
        "Price / India": "",
        "Compare At Price / India": "",
        Status: "",
      });
    });
  }

  return rows;
}

function writeCsv(filePath, rows) {
  if (!rows.length) {
    fs.writeFileSync(filePath, "", "utf8");
    return;
  }

  const headers = Object.keys(rows[0]);
  const lines = [headers.map(csvEscape).join(",")];

  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header] ?? "")).join(","));
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
}

function buildSupabaseProducts(products) {
  return products.map((product) => {
    const images = normalizeImages(product.images);
    const firstVariant = Array.isArray(product.variants) ? product.variants[0] : null;
    const shortDescription = safeTruncate(stripHtml(product.body_html), 220);

    return {
      handle: product.handle,
      slug: product.handle,
      title: removeInvalidUnicode(product.title),
      description: removeInvalidUnicode(product.body_html || ""),
      short_description: shortDescription,
      vendor: removeInvalidUnicode(product.vendor || ""),
      brand: removeInvalidUnicode(product.vendor || ""),
      category: removeInvalidUnicode(product.product_type || ""),
      product_type: removeInvalidUnicode(product.product_type || ""),
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
    const chunkLabel = `${table} delete batch ${Math.floor(index / chunkSize) + 1}/${Math.ceil(values.length / chunkSize)}`;
    await runSupabaseMutation(chunkLabel, () => supabase.from(table).delete().in(column, chunk));

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
    const chunkLabel = `${table} insert batch ${Math.floor(index / chunkSize) + 1}/${Math.ceil(rows.length / chunkSize)}`;
    await runSupabaseMutation(chunkLabel, () => supabase.from(table).insert(chunk));

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
    console.log(
      `Upserted product batch ${Math.floor(index / chunkSize) + 1}/${Math.ceil(rows.length / chunkSize)}.`
    );

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

  const [scrapeResult, collections] = await Promise.all([
    scrapeDeodap(options),
    scrapeCollections(options.baseUrl).catch((error) => {
      console.warn(`collections scrape failed: ${error.message}`);
      return [];
    }),
  ]);
  const { source, products } = scrapeResult;
  console.log(`Scraped ${products.length} products using ${source}.`);

  const csvRows = toShopifyCsvRows(products);
  fs.mkdirSync(path.dirname(options.csvOut), { recursive: true });
  fs.mkdirSync(path.dirname(options.jsonOut), { recursive: true });
  fs.mkdirSync(path.dirname(options.collectionsJsonOut), { recursive: true });
  fs.mkdirSync(path.dirname(options.collectionProductsJsonOut), { recursive: true });

  writeCsv(options.csvOut, csvRows);
  fs.writeFileSync(options.jsonOut, JSON.stringify(products, null, 2), "utf8");
  fs.writeFileSync(options.collectionsJsonOut, JSON.stringify(collections, null, 2), "utf8");

  const productsByHandle = new Map(products.map((product) => [product.handle, product]));
  const collectionProducts = collections.map((collection) => ({
    ...collection,
    products: collection.product_handles
      .map((handle) => productsByHandle.get(handle))
      .filter(Boolean),
  }));
  fs.writeFileSync(options.collectionProductsJsonOut, JSON.stringify(collectionProducts, null, 2), "utf8");

  console.log(`CSV written to ${options.csvOut}`);
  console.log(`JSON written to ${options.jsonOut}`);
  console.log(`Collections JSON written to ${options.collectionsJsonOut}`);
  console.log(`Collection products JSON written to ${options.collectionProductsJsonOut}`);

  if (options.importToSupabase) {
    await importToSupabase(products, options);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
