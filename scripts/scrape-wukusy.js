/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const DEFAULT_OUTPUT_JSON = path.join(process.cwd(), "public", "wukusy-products.json");
const DEFAULT_START_URL = "https://wukusy.app/dropshiper/index";
const DEFAULT_DELAY_MS = 150;
const STOREFRONT_BRAND_NAME = "GoModexa";
const DEFAULT_LIMIT_PER_CATEGORY = 100;
const WUKUSY_CATEGORY_PRESETS = new Map([
  [
    "electronics",
    {
      id: "1",
      title: "Electronics",
      handle: "electronics",
    },
  ],
  [
    "mobile-accessories",
    {
      id: "2",
      title: "Mobile Accessories",
      handle: "mobile-accessories",
    },
  ],
  [
    "home-improvement",
    {
      id: "5",
      title: "Home Improvement",
      handle: "home-improvement",
    },
  ],
  [
    "home-decor",
    {
      id: "7",
      title: "Home Decor",
      handle: "home-decor",
    },
  ],
  [
    "health-and-beauty",
    {
      id: "15",
      title: "Health & Beauty",
      handle: "health-and-beauty",
    },
  ],
  ["health care", { id: "15", title: "Health & Beauty", handle: "health-and-beauty" }],
  ["healthcare", { id: "15", title: "Health & Beauty", handle: "health-and-beauty" }],
  [
    "automotive",
    {
      id: "28",
      title: "Automotive",
      handle: "automotive",
    },
  ],
  [
    "travel",
    {
      id: "29",
      title: "Travel",
      handle: "travel",
    },
  ],
]);

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
    categoryQueries: [],
    inStockOnly: false,
    categoryPreset: "",
    limitPerCategory: DEFAULT_LIMIT_PER_CATEGORY,
    requireImages: true,
    productUrls: [],
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
      case "--product-urls":
      case "--products":
        args.productUrls = splitCategoryList(nextValue)
          .map((item) => normalizeText(item))
          .filter((item) => /\/merchant\/product-details\/\d+/i.test(item));
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
      case "--categories":
      case "--category-list":
        args.categoryQueries = splitCategoryList(nextValue);
        index += 1;
        break;
      case "--limit-per-category":
        args.limitPerCategory = normalizeInteger(nextValue, DEFAULT_LIMIT_PER_CATEGORY) || DEFAULT_LIMIT_PER_CATEGORY;
        index += 1;
        break;
      case "--require-images":
        args.requireImages = true;
        break;
      case "--allow-missing-images":
        args.requireImages = false;
        break;
      case "--preset":
      case "--category-preset":
        args.categoryPreset = normalizeText(nextValue).toLowerCase();
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

function splitCategoryList(value) {
  return unique(
    String(value || "")
      .split(/[;,|]/g)
      .map((item) => normalizeText(item))
      .filter(Boolean)
  );
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
    vendor: STOREFRONT_BRAND_NAME,
    brand: STOREFRONT_BRAND_NAME,
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

async function fetchHtmlWithRetries(url, cookie = "", referer = "", attempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= Math.max(1, attempts); attempt += 1) {
    try {
      return await fetchHtml(url, cookie, referer);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(Math.min(750 * attempt, 2000));
      }
    }
  }

  throw lastError;
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

function buildSeoTitle(title, categoryTitle) {
  return `${title} | GoModexa ${categoryTitle} Buy Online India`;
}

function buildSeoDescription(title, categoryTitle, stockText, imageCount) {
  const imagePhrase = imageCount > 1 ? `${imageCount} product images` : "product images";
  return `Shop ${title} from GoModexa's ${categoryTitle} collection. ${stockText}. Browse the ${imagePhrase}, compare the details, and buy online with a cleaner SEO-friendly product page.`;
}

function buildSeoKeywords(title, categoryTitle) {
  return unique([
    title,
    `${title} online`,
    `${title} India`,
    `buy ${title}`,
    categoryTitle,
    `${categoryTitle} products`,
    `${categoryTitle} online`,
    `${categoryTitle} India`,
    "GoModexa",
    "GoModexa products",
  ]).join(", ");
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
  return extractCategoryIdFromUrl(url) === "15";
}

function getCategoryPresetById(categoryId) {
  for (const preset of WUKUSY_CATEGORY_PRESETS.values()) {
    if (preset.id === String(categoryId || "")) {
      return preset;
    }
  }

  return null;
}

function resolveCategoryPreset(categoryPreset) {
  const normalizedPreset = normalizeText(categoryPreset).toLowerCase();

  if (!normalizedPreset) {
    return null;
  }

  return WUKUSY_CATEGORY_PRESETS.get(normalizedPreset) || null;
}

function normalizeCategoryQueries(args) {
  const explicitList = Array.isArray(args.categoryQueries) ? args.categoryQueries : [];
  const fromSingle = normalizeText(args.categoryQuery) ? [normalizeText(args.categoryQuery)] : [];
  return unique([...explicitList, ...fromSingle]);
}

function buildPresetStartUrl(categoryPreset) {
  const preset = resolveCategoryPreset(categoryPreset);
  return preset ? `https://wukusy.app/dropshiper/category/${preset.id}` : "";
}

function resolveForcedCategory(category, context = {}) {
  const sourceUrl = context.startUrl || context.categoryUrl || "";
  const categoryId = extractCategoryIdFromUrl(sourceUrl) || extractCategoryIdFromUrl(category?.url);
  const knownPreset = getCategoryPresetById(categoryId);

  if (knownPreset) {
    return {
      title: knownPreset.title,
      handle: knownPreset.handle,
      url: category?.url || sourceUrl,
    };
  }

  if (isBeautyParentCategoryUrl(sourceUrl)) {
    return {
      title: "Health & Beauty",
      handle: "health-and-beauty",
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
    .replace(/\bhealth care\b/g, "health and beauty")
    .replace(/\bhealthcare\b/g, "health and beauty")
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

function extractInventoryQtyFromHtml(html) {
  const inventoryBlockMatch = html.match(
    /<p[^>]*class=["'][^"']*spec-label[^"']*["'][^>]*>\s*Inventory\s*<\/p>[\s\S]{0,400}?<p[^>]*class=["'][^"']*spec-value[^"']*["'][^>]*>\s*([0-9]+)\s*units?\s*<\/p>/i
  );

  if (inventoryBlockMatch) {
    return normalizeInteger(inventoryBlockMatch[1], 0);
  }

  const inlineInventoryMatch = html.match(/Inventory[\s\S]{0,120}?([0-9]+)\s*units?\b/i);
  if (inlineInventoryMatch) {
    return normalizeInteger(inlineInventoryMatch[1], 0);
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

function hasUsableImages(product) {
  return Array.isArray(product?.image_urls) && product.image_urls.length > 0;
}

function enrichCuratedProduct(product, categoryTitle, categoryHandle, options = {}) {
  const imageUrls = unique(product?.image_urls);
  const stockQty = Math.max(
    0,
    normalizeInteger(
      product?.stock_qty ?? product?.inventory_quantity ?? options.stockQty ?? 0,
      0
    )
  );
  const stockText = stockQty > 0 ? `${stockQty} pcs left` : "limited stock";
  const title = normalizeText(product?.title || product?.name || "Untitled product");
  const resolvedCategoryTitle = normalizeText(categoryTitle || product?.category_title || "Curated");
  const resolvedCategoryHandle = normalizeText(categoryHandle || product?.category_handle || slugify(resolvedCategoryTitle));

  return {
    ...product,
    vendor: STOREFRONT_BRAND_NAME,
    brand: STOREFRONT_BRAND_NAME,
    title,
    main_image: product?.main_image || imageUrls[0] || "",
    image_urls: imageUrls,
    stock_qty: stockQty,
    inventory_quantity: stockQty,
    stock_text: stockText,
    status: stockQty > 0 ? "active" : "out_of_stock",
    seo_title: buildSeoTitle(title, resolvedCategoryTitle),
    seo_description: buildSeoDescription(title, resolvedCategoryTitle, stockText, imageUrls.length),
    seo_keywords: buildSeoKeywords(title, resolvedCategoryTitle),
    short_description: `${stockText}. Browse the images and product details from GoModexa's ${resolvedCategoryTitle} edit.`,
    category_title: resolvedCategoryTitle,
    category_handle: resolvedCategoryHandle,
    category_url: product?.category_url || "",
    canonical_path: `/product/${slugify(`${title}-${product?.wukusy_product_id || product?.sku || "wukusy"}`)}`,
  };
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
  const inventoryQty = extractInventoryQtyFromHtml(html);
  const stockQty = inventoryQty ?? resolveExplicitStockQty(stockCandidates);

  return {
    wukusy_product_id: productId || sku,
    sku,
    vendor: STOREFRONT_BRAND_NAME,
    brand: STOREFRONT_BRAND_NAME,
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
      inventoryQty,
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
  const failedProducts = [];
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
    const resolvedCategory = resolveForcedCategory(
      {
        title: nextCategory?.title || extractCategoryTitleFromUrl(nextCategoryUrl),
        handle:
          nextCategory?.handle ||
          slugify(normalizeCategoryTitle(nextCategory?.title || extractCategoryTitleFromUrl(nextCategoryUrl))),
        url: nextCategoryUrl,
      },
      {
        startUrl,
        categoryUrl: nextCategoryUrl,
      }
    );
    discoveredCategories.set(nextCategoryUrl, {
      title: resolvedCategory.title,
      handle: resolvedCategory.handle,
      url: resolvedCategory.url || nextCategoryUrl,
    });
    safeLog(`Crawling category page: ${nextCategoryUrl}`);
    let html = null;
    try {
      html = await fetchHtmlWithRetries(nextCategoryUrl, cookie, startUrl, 2);
    } catch (error) {
      safeLog(`Skipping category page after fetch failure: ${nextCategoryUrl} (${error.message})`);
      continue;
    }

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
    try {
      const html = await fetchHtmlWithRetries(productUrl, cookie, startUrl, 3);
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
    } catch (error) {
      failedProducts.push({
        url: productUrl,
        error: error?.message || "fetch failed",
      });
      safeLog(`Skipping product after fetch failure: ${productUrl} (${error.message})`);
    }

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
    failedProductCount: failedProducts.length,
    failedProducts,
    products,
  };
}

async function scrapeSpecificProductUrls({ productUrls, cookie, delayMs, startUrl }) {
  const uniqueProductUrls = unique(productUrls).filter((item) =>
    /\/merchant\/product-details\/\d+/i.test(item)
  );
  const products = [];
  const failedProducts = [];

  for (const productUrl of uniqueProductUrls) {
    safeLog(`Scraping product detail: ${productUrl}`);

    try {
      const html = await fetchHtmlWithRetries(productUrl, cookie, startUrl || DEFAULT_START_URL, 3);
      products.push({
        ...extractDetailData(html, productUrl, {
          stockCandidates: [],
        }),
        category_title: "Uncategorized",
        category_handle: "uncategorized",
        category_url: "",
      });
    } catch (error) {
      failedProducts.push({
        url: productUrl,
        error: error?.message || "fetch failed",
      });
      safeLog(`Skipping product after fetch failure: ${productUrl} (${error.message})`);
    }

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return {
    startUrl: startUrl || DEFAULT_START_URL,
    discoveredCategoryCount: 0,
    categories: [],
    discoveredProductCount: uniqueProductUrls.length,
    scrapedProductCount: products.length,
    failedProductCount: failedProducts.length,
    failedProducts,
    products,
  };
}

async function scrapeCuratedCategorySet(args) {
  const categoryQueries = normalizeCategoryQueries(args);
  const crawlResult = await crawlWukusySite({
    startUrl: args.startUrl,
    cookie: args.cookie,
    delayMs: args.delayMs,
    limit: null,
    offset: 0,
  });
  const seenProductKeys = new Set();
  const categoryGroups = [];
  const products = [];

  for (const query of categoryQueries) {
    const matchedProducts = crawlResult.products
      .filter((product) => matchesCategoryQuery(product, query))
      .filter((product) => !args.requireImages || hasUsableImages(product))
      .map((product) =>
        enrichCuratedProduct(
          product,
          product?.category_title || query,
          product?.category_handle || slugify(query),
          {
            stockQty: product?.stock_qty ?? product?.inventory_quantity ?? 0,
          }
        )
      )
      .filter((product) => product?.title);

    const limitedProducts = matchedProducts.slice(0, Math.max(1, args.limitPerCategory));
    categoryGroups.push({
      query,
      matchedCount: matchedProducts.length,
      selectedCount: limitedProducts.length,
      products: limitedProducts,
    });

    for (const product of limitedProducts) {
      const dedupeKey = String(product?.sku || product?.wukusy_product_id || product?.canonical_path || product?.title);
      if (seenProductKeys.has(dedupeKey)) {
        continue;
      }

      seenProductKeys.add(dedupeKey);
      products.push(product);
    }
  }

  return {
    startUrl: crawlResult.startUrl,
    discoveredCategoryCount: crawlResult.discoveredCategoryCount,
    categories: crawlResult.categories,
    discoveredProductCount: crawlResult.discoveredProductCount,
    scrapedProductCount: products.length,
    failedProductCount: crawlResult.failedProductCount,
    failedProducts: crawlResult.failedProducts,
    categoryGroups,
    products,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let products = [];
  let metadata = {};
  const presetStartUrl = buildPresetStartUrl(args.categoryPreset);
  const categoryQueries = normalizeCategoryQueries(args);
  const shouldRunCuratedMultiCategory = categoryQueries.length > 1;

  if (presetStartUrl) {
    args.startUrl = presetStartUrl;
  }

  const hasSpecificProductUrls = Array.isArray(args.productUrls) && args.productUrls.length > 0;
  const shouldCrawl =
    args.crawl || shouldRunCuratedMultiCategory || hasSpecificProductUrls || (!args.sourceUrl && !args.sourceFile);

  if (shouldRunCuratedMultiCategory) {
    const crawlResult = await scrapeCuratedCategorySet({
      ...args,
      categoryQueries,
    });
    products = crawlResult.products;
    metadata = {
      source: "multi-crawl",
      startUrl: crawlResult.startUrl,
      categoryQueries,
      categoryGroups: crawlResult.categoryGroups,
      discoveredCategoryCount: crawlResult.discoveredCategoryCount,
      categories: crawlResult.categories,
      discoveredProductCount: crawlResult.discoveredProductCount,
      scrapedProductCount: crawlResult.scrapedProductCount,
      failedProductCount: crawlResult.failedProductCount,
      failedProducts: crawlResult.failedProducts,
      limitPerCategory: args.limitPerCategory,
    };
  } else if (hasSpecificProductUrls) {
    const crawlResult = await scrapeSpecificProductUrls({
      productUrls: args.productUrls,
      cookie: args.cookie,
      delayMs: args.delayMs,
      startUrl: args.startUrl,
    });
    products = crawlResult.products;
    metadata = {
      source: "product-urls",
      startUrl: crawlResult.startUrl,
      productUrls: args.productUrls,
      discoveredProductCount: crawlResult.discoveredProductCount,
      scrapedProductCount: crawlResult.scrapedProductCount,
      failedProductCount: crawlResult.failedProductCount,
      failedProducts: crawlResult.failedProducts,
    };
  } else if (shouldCrawl) {
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
      categoryPreset: args.categoryPreset || undefined,
      discoveredCategoryCount: crawlResult.discoveredCategoryCount,
      categories: crawlResult.categories,
      discoveredProductCount: crawlResult.discoveredProductCount,
      scrapedProductCount: crawlResult.scrapedProductCount,
      failedProductCount: crawlResult.failedProductCount,
      failedProducts: crawlResult.failedProducts,
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

  if (!shouldRunCuratedMultiCategory && args.categoryQuery) {
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

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  scrapeCuratedCategorySet,
  crawlWukusySite,
  parseArgs,
  normalizeCategoryQueries,
  matchesCategoryQuery,
  hasUsableImages,
  buildPresetStartUrl,
};
