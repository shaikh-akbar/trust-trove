/* eslint-disable @typescript-eslint/no-require-imports */
const { loadEnvConfig } = require("@next/env");

const {
  scrapeCuratedCategorySet,
  parseArgs: parseScrapeArgs,
  buildPresetStartUrl,
} = require("./scrape-wukusy.js");
const { importToSupabase } = require("./import-wukusy-json.js");

loadEnvConfig(process.cwd());

const DEFAULT_CATEGORY_LIST = "travel,electronics,office,health care,home decor";
const DEFAULT_LIMIT_PER_CATEGORY = 100;

function normalizeText(value) {
  return String(value || "").trim();
}

function getAuthCookie() {
  if (process.env.WUKUSY_COOKIE) {
    return process.env.WUKUSY_COOKIE;
  }

  const csrfToken = process.env.WUKUSY_RSF_TOKEN || process.env.WUKUSY_RSFTOKEN || process.env.RSFTOKEN || "";
  const sessionId = process.env.WUKUSY_PHPSESSID || process.env.PHPSESSID || "";
  const pairs = [];

  if (csrfToken) {
    pairs.push(`csrfToken=${csrfToken}`);
  }

  if (sessionId) {
    pairs.push(`PHPSESSID=${sessionId}`);
  }

  return pairs.join("; ");
}

function parseArgs(argv) {
  const scrapeArgs = parseScrapeArgs(argv);
  const args = {
    ...scrapeArgs,
    categoryQueries: scrapeArgs.categoryQueries,
    limitPerCategory: scrapeArgs.limitPerCategory || DEFAULT_LIMIT_PER_CATEGORY,
    cookie: scrapeArgs.cookie || getAuthCookie(),
  };

  if (!args.categoryQueries || args.categoryQueries.length === 0) {
    args.categoryQueries = DEFAULT_CATEGORY_LIST.split(",").map((value) => normalizeText(value));
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const presetStartUrl = buildPresetStartUrl(args.categoryPreset);

  if (presetStartUrl) {
    args.startUrl = presetStartUrl;
  }

  if (!args.cookie) {
    throw new Error(
      "Missing Wukusy auth cookie. Set WUKUSY_COOKIE, or WUKUSY_RSF_TOKEN/WUKUSY_PHPSESSID in .env.local."
    );
  }

  const crawlResult = await scrapeCuratedCategorySet({
    ...args,
    requireImages: true,
  });

  const importSummary = await importToSupabase(crawlResult.products, {
    marginAmount: Number(process.env.WUKUSY_MARGIN_AMOUNT || 40),
    supabaseBatchSize: args.supabaseBatchSize,
    supabaseDelayMs: args.supabaseDelayMs,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        source: "direct-crawl-import",
        categoryQueries: args.categoryQueries,
        discoveredProductCount: crawlResult.discoveredProductCount,
        scrapedProductCount: crawlResult.scrapedProductCount,
        failedProductCount: crawlResult.failedProductCount || 0,
        importedProductCount: importSummary?.productsImported || 0,
        importedVariantCount: importSummary?.variantsImported || 0,
        importedImageCount: importSummary?.imagesImported || 0,
        failedProducts: crawlResult.failedProducts || [],
      },
      null,
      2
    )
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
