function normalizeCategoryValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
}

export function isLadiesBagProduct(product) {
  const candidates = [
    product?.category,
    product?.product_type,
    ...(Array.isArray(product?.rawCategories) ? product.rawCategories : []),
    ...(Array.isArray(product?.rawProductTypes) ? product.rawProductTypes : []),
  ]
    .map((value) => normalizeCategoryValue(value))
    .filter(Boolean);

  return candidates.some(
    (value) =>
      value.includes("ladies bag") ||
      value.includes("ladies bags") ||
      value.includes("lady bag") ||
      value.includes("women bag") ||
      value.includes("womens bag")
  );
}

export function getProductDisplayVendorName(product) {
  if (isLadiesBagProduct(product)) {
    return "Raysket";
  }

  return String(product?.vendor || product?.brand || "GoModexa").trim() || "GoModexa";
}

function getInventoryCount(product) {
  if (Array.isArray(product?.variants) && product.variants.length > 0) {
    return product.variants.reduce(
      (total, variant) => total + Number(variant?.inventory_quantity || 0),
      0
    );
  }

  return Number(product?.inventory_quantity || 0);
}

function buildBaseSampleReview(review, index, product, options = {}) {
  const slug = String(product?.slug || product?.handle || product?.id || "product");

  return {
    id: `sample-${slug}-${index + 1}`,
    productId: product?.id || null,
    displayName: review.displayName,
    city: review.city,
    rating: Number(review.rating || 5),
    headline: review.headline,
    reviewText: review.reviewText,
    createdAt: review.createdAt,
    isSample: Boolean(options.isSample),
  };
}

function getRaysketCatalogReviews(product) {
  return [
    {
      displayName: "Aashi R.",
      city: "Mumbai",
      rating: 5,
      headline: "Elegant finish and premium feel",
      reviewText:
        "Loved the structured shape, gold-tone detailing, and overall premium look. It feels polished enough for evening outings and gifting.",
      createdAt: "2026-06-02T10:00:00.000Z",
    },
    {
      displayName: "Meera K.",
      city: "Pune",
      rating: 5,
      headline: "Beautiful design with practical space",
      reviewText:
        "The canvas and leather combination looks classy, and the compartments are useful for carrying phone, wallet, and makeup without making the bag feel bulky.",
      createdAt: "2026-05-26T10:00:00.000Z",
    },
    {
      displayName: "Riya S.",
      city: "Delhi",
      rating: 5,
      headline: "Great for festive and daily styling",
      reviewText:
        "The detachable strap options and refined silhouette make it easy to style for brunch, travel, or festive wear. It stands out without feeling too flashy.",
      createdAt: "2026-05-18T10:00:00.000Z",
    },
  ].map((review, index) => buildBaseSampleReview(review, index, product));
}

function getGenericSampleReviews(product) {
  const category = String(product?.category || product?.product_type || "product").trim();

  return [
    {
      displayName: "Aarav M.",
      city: "Pune",
      rating: 5,
      headline: "Useful value in this category",
      reviewText: `Sample review: this ${category.toLowerCase()} feels practical for regular use, with a straightforward setup and good day-to-day value.`,
      createdAt: "2026-05-26T10:00:00.000Z",
    },
    {
      displayName: "Priya T.",
      city: "Indore",
      rating: 4,
      headline: "Simple and dependable",
      reviewText:
        "Sample review: the item presentation and overall quality feel consistent with what most shoppers expect in this price range.",
      createdAt: "2026-05-18T10:00:00.000Z",
    },
    {
      displayName: "Karan V.",
      city: "Nagpur",
      rating: 5,
      headline: "Easy choice for repeat orders",
      reviewText:
        "Sample review: this product stands out for clean utility, compact packaging, and an easy-to-understand buying experience.",
      createdAt: "2026-05-08T10:00:00.000Z",
    },
  ].map((review, index) =>
    buildBaseSampleReview(review, index, product, { isSample: true })
  );
}

export function buildSampleProductReviews(product, limit = 3) {
  const safeLimit = Math.max(1, Math.min(12, Number(limit || 3)));
  const inventoryCount = getInventoryCount(product);

  if (!product || inventoryCount <= 0) {
    return [];
  }

  const reviews = isLadiesBagProduct(product)
    ? getRaysketCatalogReviews(product)
    : getGenericSampleReviews(product);

  return reviews.slice(0, safeLimit);
}

export function buildProductReviewSummaryFromReviews(reviews = [], options = {}) {
  const normalizedReviews = (reviews || []).filter(
    (review) => review?.reviewText && Number(review?.rating || 0) > 0
  );
  const reviewCount = normalizedReviews.length;
  const ratingTotal = normalizedReviews.reduce(
    (sum, review) => sum + Number(review.rating || 0),
    0
  );
  const averageRating = reviewCount
    ? Number((ratingTotal / reviewCount).toFixed(1))
    : 0;

  return {
    averageRating,
    reviewCount,
    reviews: normalizedReviews,
    isSampleFallback: Boolean(options.isSampleFallback),
  };
}
