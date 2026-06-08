function stripHtml(value) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

const GENERIC_CATEGORY_LABELS = new Set([
  "",
  "uncategorized",
  "wukusy catalog",
  "catalog",
  "general",
]);

const CATEGORY_LABEL_ALIASES = new Map([
  ["home and kitchen", "Home & Kitchen"],
  ["home & kitchen", "Home & Kitchen"],
  ["health and beauty", "Health & Beauty"],
  ["beauty", "Health & Beauty"],
  ["mobile accessories", "Mobile Accessories"],
  ["fashion accessories", "Fashion Accessories"],
  ["office accessories", "Office Accessories"],
  ["bags and wallets", "Bags & Wallets"],
  ["bags & wallets", "Bags & Wallets"],
  ["toys and kids", "Toys & Kids"],
  ["toys & kids", "Toys & Kids"],
  ["fitness and wellness", "Fitness & Wellness"],
  ["fitness & wellness", "Fitness & Wellness"],
  ["ladies bag", "Ladies Bag"],
  ["ladies bags", "Ladies Bag"],
]);

const PRIORITY_CATEGORY_SLUGS = ["ladies-bag"];

const CATEGORY_KEYWORD_RULES = [
  {
    label: "Health & Beauty",
    pattern:
      /\b(face|facial|beauty|skin|skincare|massager|massage|brush|makeup|cosmetic|lip|hair|comb|spray|perfume|groom|wellness)\b/i,
  },
  {
    label: "Mobile Accessories",
    pattern:
      /\b(mobile|phone|iphone|android|selfie|tripod|charger|charging|usb|earphone|headphone|cable|holder|stand|screen guard)\b/i,
  },
  {
    label: "Watches",
    pattern: /\b(watch|wrist watch|smartwatch|smart watch|strap watch)\b/i,
  },
  {
    label: "Travel",
    pattern:
      /\b(travel|luggage|journey|trip|waist bag|sling bag|bag tag|passport|organizer)\b/i,
  },
  {
    label: "Bags & Wallets",
    pattern: /\b(wallet|purse|handbag|shoulder bag|bag|backpack)\b/i,
  },
  {
    label: "Office Accessories",
    pattern:
      /\b(office|desk|workspace|stationery|geometry|ruler|sharpener|pen|pencil|notebook)\b/i,
  },
  {
    label: "Home & Kitchen",
    pattern:
      /\b(kitchen|home|storage|organizer|cleaning|cleaner|bottle|mug|cup|plate|jar|bathroom|laundry|insoles|room freshener|freshener|air freshener|fragrance diffuser)\b/i,
  },
  {
    label: "Garden",
    pattern: /\b(garden|gardening|watering can|plant|planter|soil|sprayer)\b/i,
  },
  {
    label: "Automotive",
    pattern: /\b(car|automotive|windshield|sun shade|sunshade|visor|dashboard|vehicle)\b/i,
  },
  {
    label: "Electronics",
    pattern:
      /\b(electronic|gadget|lamp|light|mouse|keyboard|speaker|mini hammer|vr|virtual reality|led)\b/i,
  },
  {
    label: "Food & Gifting",
    pattern: /\b(chocolate|almond|coffee|snack|gift|gifting)\b/i,
  },
];

function getAliasedCategoryLabel(value) {
  const normalized = normalizeWhitespace(value).toLowerCase();
  return CATEGORY_LABEL_ALIASES.get(normalized) || normalizeWhitespace(value);
}

function isGenericCategoryLabel(value) {
  const normalized = normalizeWhitespace(value).toLowerCase();

  return (
    !normalized ||
    GENERIC_CATEGORY_LABELS.has(normalized) ||
    /^\d+$/.test(normalized) ||
    /^category\s+\d+$/i.test(normalized)
  );
}

export function slugifyCategory(value) {
  return (value || "collection")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatCategoryLabel(value) {
  const normalized = normalizeWhitespace(value);

  if (isGenericCategoryLabel(normalized)) {
    return "Uncategorized";
  }

  return getAliasedCategoryLabel(normalized);
}

export function slugifyBrand(value) {
  return (value || "brand")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatBrandLabel(value) {
  return value || "Unbranded";
}

const EXCLUDED_PUBLIC_BRANDS = new Set([
  "",
  "unbranded",
  "wukusy",
  "wukusy catalog",
]);

export function normalizeProductTitle(value) {
  return normalizeWhitespace(
    String(value || "")
      .replace(/[_|]+/g, " ")
      .replace(/[ ]{2,}/g, " ")
  );
}

function getCategorySignalText(product) {
  return [
    normalizeProductTitle(product?.title || product?.name),
    normalizeWhitespace(product?.category),
    normalizeWhitespace(product?.product_type),
    ...(Array.isArray(product?.tags) ? product.tags : []),
  ]
    .filter(Boolean)
    .join(" ");
}

export function inferCategoryLabelFromProduct(product) {
  const signalText = getCategorySignalText(product);
  const match = CATEGORY_KEYWORD_RULES.find((rule) => rule.pattern.test(signalText));

  return match?.label || null;
}

export function getPublicCategoryLabel(product) {
  const categoryLabel = formatCategoryLabel(product?.category);

  if (categoryLabel !== "Uncategorized") {
    return categoryLabel;
  }

  const productTypeLabel = formatCategoryLabel(product?.product_type);

  if (productTypeLabel !== "Uncategorized") {
    return productTypeLabel;
  }

  return inferCategoryLabelFromProduct(product) || "Uncategorized";
}

export function buildFallbackProductDescription(product) {
  const categoryLabel = getPublicCategoryLabel(product);
  const title = normalizeProductTitle(product?.title || product?.name || "This product");
  const brandLabel = normalizeWhitespace(product?.brand || product?.vendor);
  const inventoryQuantity = Number(product?.inventory_quantity || 0);
  const variantCount = Array.isArray(product?.variants) ? product.variants.length : 0;
  const categoryHints = {
    "Health & Beauty": "daily self-care, grooming support, and easy repeat use",
    "Mobile Accessories": "better phone convenience for charging, viewing, and desk use",
    "Home & Kitchen": "space-saving utility and everyday home convenience",
    Travel: "organized carry, portability, and smarter movement",
    Watches: "easy gifting appeal and everyday wear versatility",
    Electronics: "practical gadget utility for daily routines",
    "Office Accessories": "cleaner desk utility and study-ready convenience",
    Garden: "simple everyday support for plant care and home gardening",
    Automotive: "useful car-care convenience and travel-ready function",
    "Food & Gifting": "gift-friendly appeal and easy everyday enjoyment",
    "Bags & Wallets": "portable everyday carry and travel convenience",
  };
  const hint =
    categoryHints[categoryLabel] ||
    "practical everyday use and cleaner shopping discovery";
  const brandText = brandLabel ? ` from ${brandLabel}` : "";
  const variantText =
    variantCount > 1
      ? ` It currently appears with ${variantCount} selectable options, which can help shoppers compare the version that fits their needs more closely.`
      : " It is positioned as a straightforward single-listing option for shoppers who already know the kind of item they want.";
  const stockText =
    inventoryQuantity > 0
      ? " The listing is currently available for purchase, making it easier to move from comparison into ordering once the use case feels clear."
      : "";

  return `${title}${brandText} sits inside GoModexa's ${categoryLabel.toLowerCase()} collection and is best understood through ${hint}.${variantText}${stockText}`;
}

export function getCategorySummaryEntry(product) {
  const canonicalCategory = getPublicCategoryLabel(product);
  const rawCategory = formatCategoryLabel(product?.category);
  const rawProductType = formatCategoryLabel(product?.product_type);
  const isInferredOnly =
    rawCategory === "Uncategorized" && rawProductType === "Uncategorized" && canonicalCategory !== "Uncategorized";

  return {
    slug: slugifyCategory(canonicalCategory),
    title: canonicalCategory,
    description:
      product?.seo_description ||
      product?.short_description ||
      stripHtml(product?.description),
    rawCategory: normalizeWhitespace(product?.category),
    rawProductType: normalizeWhitespace(product?.product_type),
    isInferredOnly,
  };
}

export function getBrandSummaryEntry(product) {
  const rawBrand = formatBrandLabel(product?.brand || product?.vendor);

  if (EXCLUDED_PUBLIC_BRANDS.has(rawBrand.toLowerCase().trim())) {
    return null;
  }

  return {
    slug: slugifyBrand(rawBrand),
    title: rawBrand,
    description: product?.short_description || stripHtml(product?.description),
    rawBrand,
  };
}

export function buildCategorySummary(products) {
  const categoryMap = new Map();

  products.forEach((product) => {
    const categoryEntry = getCategorySummaryEntry(product);

    if (categoryEntry.isInferredOnly || categoryEntry.title === "Uncategorized") {
      return;
    }

    const current = categoryMap.get(categoryEntry.slug);

    if (!current) {
      categoryMap.set(categoryEntry.slug, {
        slug: categoryEntry.slug,
        title: categoryEntry.title,
        count: 1,
        image: product.image_url,
        description:
          categoryEntry.description ||
          product.seo_description ||
          product.short_description ||
          stripHtml(product.description),
        rawCategories: [categoryEntry.rawCategory].filter(Boolean),
        rawProductTypes: [categoryEntry.rawProductType].filter(Boolean),
      });
      return;
    }

    current.count += 1;
    current.rawCategories = Array.from(
      new Set([...current.rawCategories, categoryEntry.rawCategory].filter(Boolean))
    );
    current.rawProductTypes = Array.from(
      new Set([...current.rawProductTypes, categoryEntry.rawProductType].filter(Boolean))
    );
  });

  return Array.from(categoryMap.values()).sort((left, right) => {
    const leftPriority = PRIORITY_CATEGORY_SLUGS.indexOf(left.slug);
    const rightPriority = PRIORITY_CATEGORY_SLUGS.indexOf(right.slug);

    if (leftPriority !== -1 || rightPriority !== -1) {
      if (leftPriority === -1) {
        return 1;
      }

      if (rightPriority === -1) {
        return -1;
      }

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }
    }

    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.title.localeCompare(right.title);
  });
}

export function buildBrandSummary(products) {
  const brandMap = new Map();

  products.forEach((product) => {
    const brandEntry = getBrandSummaryEntry(product);

    if (!brandEntry) {
      return;
    }

    const current = brandMap.get(brandEntry.slug);

    if (!current) {
      brandMap.set(brandEntry.slug, {
        slug: brandEntry.slug,
        title: brandEntry.title,
        count: 1,
        image: product.image_url || product.main_image || "",
        description:
          brandEntry.description || product.short_description || stripHtml(product.description),
        rawBrands: [brandEntry.rawBrand],
      });
      return;
    }

    current.count += 1;
    if (!current.image && (product.image_url || product.main_image)) {
      current.image = product.image_url || product.main_image;
    }
    current.rawBrands = Array.from(new Set([...current.rawBrands, brandEntry.rawBrand]));
  });

  return Array.from(brandMap.values()).sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.title.localeCompare(right.title);
  });
}

export function getProductsForCategory(products, slug) {
  return products.filter((product) => getCategorySummaryEntry(product).slug === slug);
}

const COMMON_COLORS = [
  "black",
  "white",
  "navy",
  "blue",
  "red",
  "green",
  "beige",
  "brown",
  "grey",
  "gray",
  "pink",
  "yellow",
  "orange",
  "purple",
  "maroon",
  "gold",
  "silver",
  "cream",
];

const SIZE_PATTERN =
  /^(xxs|xs|s|m|l|xl|xxl|xxxl|free size|one size|\d{2,3}|uk ?\d+|us ?\d+|eu ?\d+)$/i;

function toTitleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getVariantOptionValues(product) {
  return (product?.variants || []).flatMap((variant) =>
    [variant?.option1_value, variant?.option2_value, variant?.option3_value]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
  );
}

function extractColors(product) {
  const values = [
    ...getVariantOptionValues(product),
    ...String(product?.color || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    ...(product?.tags || []),
  ];

  return Array.from(
    new Set(
      values
        .map((value) => value.toLowerCase())
        .filter((value) => COMMON_COLORS.includes(value))
        .map(toTitleCase)
    )
  );
}

function extractSizes(product) {
  const values = [
    ...getVariantOptionValues(product),
    ...String(product?.size || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ];

  return Array.from(new Set(values.filter((value) => SIZE_PATTERN.test(value)).map((value) => value.toUpperCase())));
}

export function buildFilterOptions(products) {
  const pricePoints = products.map((product) => Number(product?.price_selling || 0)).filter((value) => value > 0);
  const categories = Array.from(new Set(products.map((product) => getCategorySummaryEntry(product).title))).sort(
    (left, right) => left.localeCompare(right)
  );
  const colors = Array.from(new Set(products.flatMap(extractColors))).sort((left, right) =>
    left.localeCompare(right)
  );
  const sizes = Array.from(new Set(products.flatMap(extractSizes))).sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true })
  );

  return {
    minPrice: pricePoints.length ? Math.min(...pricePoints) : 0,
    maxPrice: pricePoints.length ? Math.max(...pricePoints) : 0,
    categories,
    colors,
    sizes,
  };
}

function getSearchableText(product) {
  return [
    product?.title,
    product?.name,
    product?.category,
    product?.product_type,
    product?.vendor,
    product?.short_description,
    stripHtml(product?.description),
    ...(product?.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterProducts(
  products,
  { query = "", minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER, categories = [], colors = [], sizes = [] } = {}
) {
  const normalizedQuery = String(query || "").trim().toLowerCase();

  return products.filter((product) => {
    const price = Number(product?.price_selling || 0);
    const category = getCategorySummaryEntry(product).title;
    const productColors = extractColors(product);
    const productSizes = extractSizes(product);

    if (normalizedQuery && !getSearchableText(product).includes(normalizedQuery)) {
      return false;
    }

    if (price < minPrice || price > maxPrice) {
      return false;
    }

    if (categories.length > 0 && !categories.includes(category)) {
      return false;
    }

    if (colors.length > 0 && !colors.some((value) => productColors.includes(value))) {
      return false;
    }

    if (sizes.length > 0 && !sizes.some((value) => productSizes.includes(value))) {
      return false;
    }

    return true;
  });
}
