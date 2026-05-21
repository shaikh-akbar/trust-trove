function stripHtml(value) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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
  const normalized = String(value || "").replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "Uncategorized";
  }

  if (/^\d+$/.test(normalized)) {
    return "Uncategorized";
  }

  if (/^category\s+\d+$/i.test(normalized)) {
    return "Uncategorized";
  }

  return normalized;
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

function getProductCategoryLabel(product) {
  return formatCategoryLabel(product?.category || product?.product_type);
}

export function getCategorySummaryEntry(product) {
  const rawCategory = getProductCategoryLabel(product);

  return {
    slug: slugifyCategory(rawCategory),
    title: rawCategory,
    description: product?.short_description || stripHtml(product?.description),
    rawCategory,
  };
}

export function getBrandSummaryEntry(product) {
  const rawBrand = formatBrandLabel(product?.brand || product?.vendor);

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
    const current = categoryMap.get(categoryEntry.slug);

    if (!current) {
      categoryMap.set(categoryEntry.slug, {
        slug: categoryEntry.slug,
        title: categoryEntry.title,
        count: 1,
        image: product.image_url,
        description:
          categoryEntry.description || product.short_description || stripHtml(product.description),
        rawCategories: [categoryEntry.rawCategory],
      });
      return;
    }

    current.count += 1;
    current.rawCategories = Array.from(new Set([...current.rawCategories, categoryEntry.rawCategory]));
  });

  return Array.from(categoryMap.values()).sort((left, right) => {
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
