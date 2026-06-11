/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const DEFAULT_OUTPUT_JSON = path.join(process.cwd(), "public", "wukusy-products.json");
const DEFAULT_START_URL = "https://wukusy.app/dropshiper/index";
const DEFAULT_DELAY_MS = 150;
const BEAUTY_PARENT_CATEGORY_ID = "15";
const BEAUTY_CATEGORY_TITLE = "Health & Beauty";
const BEAUTY_CATEGORY_HANDLE = "health-and-beauty";

function safeLog(message) {
  try {
    if (process.stdout?.destroyed || !process.stdout?.writable) {
      return;
    }
    process.stdout.write(`${message}\n`);
  } catch (error) {
    if (error?.code !== "EPIPE") {
      throw error;
    }
  }
}

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

function parseArgs(argv) {
  const args = {
    jsonOut: DEFAULT_OUTPUT_JSON,
    sourceUrl: process.env.WUKUSY_PRODUCTS_URL || "",
    sourceFile: process.env.WUKUSY_PRODUCTS_FILE || "",
    startUrl: process.env.WUKUSY_START_URL || DEFAULT_START_URL,
    crawl: false,
    delayMs: DEFAULT_DELAY_MS,
    limit: null,
    offset: 0,
    cookie: process.env.WUKUSY_COOKIE || "",
    categoryQuery: "",
    inStockOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    const nextValue = argv[index + 1];

    switch (value) {
      case "--json-out":
        args.jsonOut = nextValue ? path.resolve(process.cwd(), nextValue) : args.jsonOut;
        index += 1;
        break;
      case "--source-url":
        args.sourceUrl = nextValue || args.sourceUrl;
        index += 1;
        break;
      case "--source-file":
        args.sourceFile = nextValue || args.sourceFile;
        index += 1;
        break;
      case "--start-url":
        args.startUrl = nextValue || args.startUrl;
        index += 1;
        break;
      case "--delay-ms":
        args.delayMs = normalizeInteger(nextValue, DEFAULT_DELAY_MS);
        index += 1;
        break;
      case "--limit":
        args.limit = normalizeInteger(nextValue, 0) || null;
        index += 1;
        break;
      case "--offset":
        args.offset = normalizeInteger(nextValue, 0);
        index += 1;
        break;
      case "--cookie":
        args.cookie = nextValue || args.cookie;
        index += 1;
        break;
      case "--crawl":
        args.crawl = true;
        break;
      case "--category":
      case "--category-query":
        args.categoryQuery = normalizeText(nextValue);
        index += 1;
        break;
      case "--in-stock-only":
        args.inStockOnly = true;
        break;
      default:
        break;
    }
  }

  return args;
}

function getFirstDefined(source, keys, fallback = null) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== "") {
      return source[key];
    }
  }

  return fallback;
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

function normalizeWukusyProduct(rawProduct) {
  const sku = normalizeText(
    getFirstDefined(rawProduct, [
      "sku",
      "SKU",
      "product_sku",
      "supplier_sku",
      "code",
      "item_code",
    ])
  ).toUpperCase();

  if (!sku) {
    return null;
  }

  const stockQty = normalizeInteger(
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

  return {
    wukusy_product_id: normalizeText(
      getFirstDefined(rawProduct, ["id", "product_id", "wukusy_product_id"], sku)
    ),
    sku,
    title: normalizeText(
      getFirstDefined(rawProduct, ["title", "name", "product_name", "item_name"], sku)
    ),
    cost_price: normalizeNumber(
      getFirstDefined(rawProduct, [
        "cost_price",
        "cost",
        "purchase_price",
        "supplier_cost_price",
        "base_price",
        "price",
      ])
    ),
    gst_percent: normalizeNumber(
      getFirstDefined(rawProduct, ["gst_percent", "gst", "tax_percent", "tax"], 18)
    ),
    weight_grams: normalizeInteger(
      getFirstDefined(rawProduct, ["weight_grams", "weight", "shipping_weight", "weight_gm"])
    ),
    stock_qty: stockQty,
    status: stockQty > 0 ? "active" : "out_of_stock",
    raw_payload: rawProduct,
  };
}

async function fetchPayload({ sourceUrl, sourceFile }) {
  if (sourceFile) {
    return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), sourceFile), "utf8"));
  }

  if (!sourceUrl) {
    throw new Error("Missing WUKUSY source. Pass --source-url, --source-file, or set WUKUSY_PRODUCTS_URL.");
  }

  const headers = {
    accept: "application/json,text/plain,*/*",
    "user-agent": "Mozilla/5.0 (compatible; TrustTroveBot/1.0; +https://trusttrove.local)",
  };

  if (process.env.WUKUSY_API_TOKEN) {
    headers.authorization = `Bearer ${process.env.WUKUSY_API_TOKEN}`;
  }

  const response = await fetch(sourceUrl, { headers });

  if (!response.ok) {
    throw new Error(`Wukusy request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
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

function fetchHeaders(url, cookie = "", referer = "") {
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
  };

  headers.origin = origin;

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
    headers: fetchHeaders(url, cookie, referer),
    redirect: "follow",
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

function slugify(value) {
  return String(value || "wukusy-category")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategoryTitle(value, fallback = "Uncategorized") {
  const normalized = normalizeText(value).replace(/\s+/g, " ");

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

function extractCategoryIdFromUrl(url) {
  return String(url || "").match(/\/category\/(\d+)/i)?.[1] || "";
}

function isBeautyParentCategoryUrl(url) {
  return extractCategoryIdFromUrl(url) === BEAUTY_PARENT_CATEGORY_ID;
}

function resolveForcedCategory(category, context = {}) {
  const sourceUrl = context.startUrl || context.categoryUrl || "";

  if (isBeautyParentCategoryUrl(sourceUrl)) {
    return {
      title: BEAUTY_CATEGORY_TITLE,
      handle: BEAUTY_CATEGORY_HANDLE,
      url: sourceUrl,
    };
  }

  return {
    title: normalizeCategoryTitle(category?.title),
    handle: category?.handle || "uncategorized",
    url: category?.url || "",
  };
}

function normalizeCategorySearchValue(value) {
  return normalizeCategoryTitle(value, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesCategoryQuery(product, categoryQuery) {
  if (!categoryQuery) {
    return true;
  }

  const query = normalizeCategorySearchValue(categoryQuery);
  if (!query) {
    return true;
  }

  const haystacks = [
    product?.category_title,
    product?.category_handle,
    product?.category_url,
  ].map((value) => normalizeCategorySearchValue(value));

  return haystacks.some((value) => value.includes(query));
}

function isProductInStock(product) {
  return normalizeInteger(product?.stock_qty, 0) > 0 && normalizeText(product?.status) === "active";
}

function resolveExplicitStockQty(stockCandidates = []) {
  for (const candidate of stockCandidates) {
    const normalizedCandidate = normalizeText(candidate);

    if (/out of stock|unavailable|0\s*pcs?\s*left/i.test(normalizedCandidate)) {
      return 0;
    }

    const numericMatch = normalizedCandidate.match(/([0-9]+)\s*pcs?\s*left/i);
    if (numericMatch) {
      return normalizeInteger(numericMatch[1], 0);
    }
  }

  return null;
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

function extractProductEntries(html, baseUrl) {
  const entries = [];
  const seen = new Set();
  const pattern =
    /href=["']([^"']*\/merchant\/product-details\/\d+)["'][\s\S]{0,4000}?>([0-9]+)\s*Pcs?\s*left</gi;

  for (const match of html.matchAll(pattern)) {
    const url = toAbsoluteUrl(decodeHtml(match[1]), baseUrl);
    if (!url || seen.has(url)) {
      continue;
    }

    seen.add(url);
    entries.push({
      url,
      stockQty: normalizeInteger(match[2], 0),
      stockText: `${normalizeInteger(match[2], 0)} Pcs left`,
    });
  }

  return entries;
}

function extractCategoryEntries(html, baseUrl) {
  const matches = Array.from(
    html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)
  );

  const entries = [];
  const seen = new Set();

  for (const match of matches) {
    const href = toAbsoluteUrl(decodeHtml(match[1]), baseUrl);
    if (!href || !/\/dropshiper\/category\/\d+/i.test(href)) {
      continue;
    }

    const label = stripHtml(match[2]);
    const title = normalizeCategoryTitle(label || extractCategoryTitleFromUrl(href));
    const key = `${href}::${title}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    entries.push({
      url: href,
      title,
      handle: slugify(title || extractCategoryTitleFromUrl(href)),
    });
  }

  return entries;
}

function extractCategoryTitleFromUrl(url) {
  const match = String(url || "").match(/\/category\/(\d+)/i);
  return match ? `Category ${match[1]}` : "Uncategorized";
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
  const srcMatches = Array.from(
    html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)
  );

  return unique(
    srcMatches
      .map((match) => toAbsoluteUrl(decodeHtml(match[1]), baseUrl))
      .filter(Boolean)
  );
}

function extractTextMatches(text, pattern, limit = 10) {
  return unique(Array.from(text.matchAll(pattern)).map((match) => normalizeText(match[0]))).slice(0, limit);
}

function extractDetailData(html, url, options = {}) {
  const text = stripHtml(html);
  const productId = url.match(/\/merchant\/product-details\/(\d+)/i)?.[1] || "";
  const priceCandidates = extractTextMatches(
    text,
    /(?:Rs\.?|₹)\s*[0-9][0-9,]*(?:\.[0-9]{1,2})?/gi
  );
  const gstCandidates = extractTextMatches(
    text,
    /[0-9]+(?:\.[0-9]+)?\s*%?\s*(?:gst|tax)/gi
  );
  const weightCandidates = extractTextMatches(
    text,
    /[0-9]+(?:\.[0-9]+)?\s*(?:gm|g|kg|ml|l)\b/gi
  );
  const skuCandidates = extractTextMatches(
    text,
    /\b(?:sku|item code|product code)\b[:\s-]*[A-Z0-9\-_/]+/gi
  );
  const detailStockCandidates = extractTextMatches(
    text,
    /\b(?:in stock|out of stock|available|unavailable|0\s*pcs?\s*left|[0-9]+\s*pcs?\s*left)\b/gi
  );
  const stockCandidates = unique([
    ...(Array.isArray(options.stockCandidates) ? options.stockCandidates : []),
    ...detailStockCandidates,
  ]);
  const imageUrls = extractImageUrls(html, url);
  const resolvedTitle = extractTitle(html);
  const primaryPrice = normalizeNumber(priceCandidates[0]);
  const gstPercent = normalizeNumber(
    gstCandidates
      .map((entry) => entry.match(/[0-9]+(?:\.[0-9]+)?/)?.[0])
      .find(Boolean),
    18
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
  const stockQty = resolveExplicitStockQty(stockCandidates);

  return {
    wukusy_product_id: productId || sku,
    sku,
    title: resolvedTitle || sku,
    cost_price: primaryPrice,
    gst_percent: gstPercent || 18,
    weight_grams: weightGrams,
    stock_qty: stockQty ?? 0,
    status: typeof stockQty === "number" && stockQty > 0 ? "active" : "out_of_stock",
    product_url: url,
    image_urls: imageUrls,
    debug_extract: {
      priceCandidates,
      gstCandidates,
      weightCandidates,
      skuCandidates,
      stockCandidates,
      detailStockCandidates,
    },
    raw_payload: {
      source: "html-scrape",
      product_url: url,
      image_urls: imageUrls,
      text_excerpt: text.slice(0, 4000),
    },
  };
}

async function crawlWukusySite({ startUrl, cookie, delayMs, limit, offset = 0 }) {
  const visitedCategoryLinks = new Set();
  const queuedCategoryLinks = [
    {
      url: startUrl,
      title: "Wukusy Catalog",
      handle: "wukusy-catalog",
    },
  ];
  const discoveredProductLinks = new Set();
  const productCategoryMap = new Map();
  const productListingStockMap = new Map();
  const discoveredCategories = new Map();
  const products = [];
  const targetProductCount =
    typeof limit === "number" && limit > 0 ? offset + limit : null;
  const shouldStopCategoryDiscovery = () =>
    typeof targetProductCount === "number" && targetProductCount > 0
      ? discoveredProductLinks.size >= targetProductCount
      : false;

  while (queuedCategoryLinks.length > 0) {
    if (shouldStopCategoryDiscovery()) {
      break;
    }

    const nextCategory = queuedCategoryLinks.shift();
    const nextCategoryUrl = nextCategory?.url;

    if (!nextCategoryUrl || visitedCategoryLinks.has(nextCategoryUrl)) {
      continue;
    }

    visitedCategoryLinks.add(nextCategoryUrl);
    discoveredCategories.set(nextCategoryUrl, {
      title: normalizeCategoryTitle(
        nextCategory?.title || extractCategoryTitleFromUrl(nextCategoryUrl)
      ),
      handle:
        nextCategory?.handle ||
        slugify(normalizeCategoryTitle(nextCategory?.title || extractCategoryTitleFromUrl(nextCategoryUrl))),
      url: nextCategoryUrl,
    });
    safeLog(`Crawling category page: ${nextCategoryUrl}`);
    const html = await fetchHtml(nextCategoryUrl, cookie, startUrl);

    extractProductEntries(html, nextCategoryUrl).forEach((entry) => {
      if (!productCategoryMap.has(entry.url)) {
        productCategoryMap.set(entry.url, discoveredCategories.get(nextCategoryUrl));
      }
      if (typeof entry.stockQty === "number" && entry.stockQty > 0) {
        productListingStockMap.set(entry.url, {
          stockQty: entry.stockQty,
          stockText: entry.stockText,
        });
      }
      discoveredProductLinks.add(entry.url);
    });

    extractProductLinks(html, nextCategoryUrl).forEach((link) => {
      if (!productCategoryMap.has(link)) {
        productCategoryMap.set(link, discoveredCategories.get(nextCategoryUrl));
      }
      discoveredProductLinks.add(link);
    });

    if (!shouldStopCategoryDiscovery()) {
      extractCategoryEntries(html, nextCategoryUrl).forEach((entry) => {
        if (!visitedCategoryLinks.has(entry.url)) {
          queuedCategoryLinks.push(entry);
        }
      });
    }

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  const productLinks = Array.from(discoveredProductLinks);
  const selectedProductLinks =
    typeof limit === "number" && limit > 0
      ? productLinks.slice(offset, offset + limit)
      : productLinks.slice(offset);

  for (const productUrl of selectedProductLinks) {
    safeLog(`Scraping product detail: ${productUrl}`);
    const html = await fetchHtml(productUrl, cookie, startUrl);
    const category = productCategoryMap.get(productUrl) || null;
    const listingStock = productListingStockMap.get(productUrl) || null;
    const resolvedCategory = resolveForcedCategory(category, {
      startUrl,
      categoryUrl: category?.url || "",
    });
    products.push({
      ...extractDetailData(html, productUrl, {
        stockCandidates: listingStock?.stockText ? [listingStock.stockText] : [],
      }),
      category_title: resolvedCategory.title,
      category_handle: resolvedCategory.handle,
      category_url: resolvedCategory.url,
    });

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return {
    startUrl,
    discoveredCategoryCount: visitedCategoryLinks.size,
    categories: Array.from(discoveredCategories.values()),
    discoveredProductCount: productLinks.length,
    scrapedProductCount: products.length,
    products,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let products = [];
  let metadata = {};

  const shouldCrawl = args.crawl || (!args.sourceUrl && !args.sourceFile);

  if (shouldCrawl) {
    const crawlResult = await crawlWukusySite({
      startUrl: args.startUrl,
      cookie: args.cookie,
      delayMs: args.delayMs,
      limit: args.limit,
      offset: args.offset,
    });
    products = crawlResult.products;
    metadata = {
      source: "crawl",
      startUrl: crawlResult.startUrl,
      discoveredCategoryCount: crawlResult.discoveredCategoryCount,
      categories: crawlResult.categories,
      discoveredProductCount: crawlResult.discoveredProductCount,
      scrapedProductCount: crawlResult.scrapedProductCount,
      offset: args.offset,
    };
  } else {
    const payload = await fetchPayload(args);
    products = extractProductsFromPayload(payload)
      .map(normalizeWukusyProduct)
      .filter(Boolean);
    metadata = {
      source: args.sourceFile ? "file" : "url",
    };
  }

  if (args.categoryQuery) {
    products = products.filter((product) => matchesCategoryQuery(product, args.categoryQuery));
    metadata.categoryQuery = args.categoryQuery;
  }

  if (args.inStockOnly) {
    products = products.filter(isProductInStock);
    metadata.inStockOnly = true;
  }

  fs.mkdirSync(path.dirname(args.jsonOut), { recursive: true });
  fs.writeFileSync(
    args.jsonOut,
    JSON.stringify(
      {
        metadata: {
          ...metadata,
          generatedAt: new Date().toISOString(),
        },
        products,
      },
      null,
      2
    ),
    "utf8"
  );

  safeLog(`Saved ${products.length} Wukusy products to ${args.jsonOut}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
