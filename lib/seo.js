import { getCategoryGuideCopy } from "./content";

const SITE_NAME = "GoModexa";
const SITE_URL = String(
  process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.gomodexa.com"
).replace(/\/+$/, "");
const SITE_ORIGIN_WITHOUT_WWW = SITE_URL.replace("://www.", "://");
const DEFAULT_TITLE = "GoModexa | Premium Lifestyle Store in India";
const DEFAULT_DESCRIPTION =
  "Shop curated fashion, footwear, gifting, gadgets, and everyday lifestyle essentials with a polished online experience from GoModexa.";
const DEFAULT_KEYWORDS = [
  "GoModexa",
  "online shopping India",
  "premium lifestyle store",
  "fashion accessories",
  "gadgets online",
  "home essentials",
  "new arrivals India",
  "cash on delivery store",
];

const SOCIAL_PROFILE_ENV_KEYS = [
  "NEXT_PUBLIC_INSTAGRAM_URL",
  "NEXT_PUBLIC_FACEBOOK_URL",
  "NEXT_PUBLIC_LINKEDIN_URL",
  "NEXT_PUBLIC_YOUTUBE_URL",
  "NEXT_PUBLIC_X_URL",
  "NEXT_PUBLIC_PINTEREST_URL",
];

function getSocialProfileUrls() {
  return Array.from(
    new Set(
      SOCIAL_PROFILE_ENV_KEYS.map((key) => String(process.env[key] || "").trim())
        .filter(Boolean)
        .filter((value) => /^https?:\/\//i.test(value))
    )
  );
}

export function getSiteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

function getEntityId(name) {
  return getSiteUrl(`/#${name}`);
}

function normalizeKeyword(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function slugWords(value) {
  return normalizeKeyword(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mergeKeywords(...groups) {
  return Array.from(
    new Set(
      groups
        .flat()
        .map((value) => normalizeKeyword(value))
        .filter(Boolean)
    )
  );
}

export function buildProductKeywords(product) {
  const title = normalizeKeyword(product?.title || product?.name);
  const category = normalizeKeyword(product?.category || product?.product_type);
  const brand = normalizeKeyword(product?.brand || product?.vendor);
  const supplierName = normalizeKeyword(product?.supplier_name);
  const titleWords = slugWords(title);
  const explicitKeywords = Array.isArray(product?.seo_keywords)
    ? product.seo_keywords
    : Array.isArray(product?.tags)
      ? product.tags
      : typeof product?.seo_keywords === "string"
        ? product.seo_keywords.split(",").map((value) => value.trim()).filter(Boolean)
        : [];

  return mergeKeywords(
    explicitKeywords,
    [
      title,
      `${title} online`,
      `${title} India`,
      `${title} price`,
    ],
    category
      ? [
          category,
          `${category} online`,
          `${category} India`,
          `${category} products`,
        ]
      : [],
    brand
      ? [
          brand,
          `${brand} online`,
          `${brand} ${category || "products"}`,
        ]
      : [],
    supplierName ? [supplierName] : [],
    titleWords ? [titleWords] : []
  );
}

export function buildCategoryKeywords(category) {
  const title = normalizeKeyword(category?.title || category);
  const relatedLabels = [
    ...(Array.isArray(category?.rawCategories) ? category.rawCategories : []),
    ...(Array.isArray(category?.rawProductTypes) ? category.rawProductTypes : []),
  ]
    .map((value) => normalizeKeyword(value))
    .filter(Boolean)
    .filter((value) => value.toLowerCase() !== title.toLowerCase())
    .slice(0, 4);

  return mergeKeywords([
    title,
    `${title} online`,
    `${title} collection`,
    `${title} products`,
    `buy ${title} online`,
    `${title} India`,
    ...relatedLabels,
    ...relatedLabels.map((label) => `${label} online`),
    `shop ${title} on GoModexa`,
  ]);
}

export function buildBrandKeywords(brand) {
  const title = normalizeKeyword(brand?.title || brand);
  return mergeKeywords([
    title,
    `${title} online`,
    `${title} products`,
    `buy ${title} online`,
    `${title} India`,
    `${title} collection`,
  ]);
}

const MIN_INDEXABLE_PRODUCT_DESCRIPTION_LENGTH = 140;
const MIN_INDEXABLE_PRODUCT_INVENTORY = 2;

function normalizeTagList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function isActiveStatus(value) {
  return String(value || "").trim().toLowerCase() === "active";
}

function hasIndexableProductImage(product) {
  if (String(product?.main_image || "").trim()) {
    return true;
  }

  return Array.isArray(product?.product_images)
    ? product.product_images.some((image) => String(image?.src || "").trim())
    : false;
}

export function hasIndexableProductPageSignals(product) {
  const description = stripHtml(
    product?.short_description || product?.seo_description || product?.description
  );
  const hasMeaningfulDescription =
    description.length >= MIN_INDEXABLE_PRODUCT_DESCRIPTION_LENGTH;
  const hasTaxonomy = Boolean(
    product?.brand || product?.vendor || product?.category || product?.product_type
  );
  const hasDiscoverySignals =
    normalizeTagList(product?.seo_keywords).length > 0 ||
    normalizeTagList(product?.tags).length > 0 ||
    Boolean(product?.is_featured);
  const hasActiveProductStatus = isActiveStatus(product?.status || "active");
  const hasActiveInventory = Array.isArray(product?.variants) && product.variants.length > 0
    ? product.variants.some(
        (variant) =>
          isActiveStatus(variant?.status || "active") &&
          Number(variant?.inventory_quantity || 0) >= MIN_INDEXABLE_PRODUCT_INVENTORY
      )
    : Number(product?.inventory_quantity || 0) >= MIN_INDEXABLE_PRODUCT_INVENTORY;

  return Boolean(
    product?.slug &&
      product?.title &&
      hasActiveProductStatus &&
      hasIndexableProductImage(product) &&
      hasTaxonomy &&
      hasActiveInventory &&
      (hasMeaningfulDescription || hasDiscoverySignals)
  );
}

function trimMetaDescription(value, maxLength = 160) {
  const normalized = normalizeKeyword(value);
  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

export function buildProductMetaTitle(product) {
  if (product?.seo_title) {
    return normalizeKeyword(product.seo_title);
  }

  const title = normalizeKeyword(product?.title || product?.name);
  const brand = normalizeKeyword(product?.brand || product?.vendor);
  const category = normalizeKeyword(product?.category || product?.product_type);

  if (!title) {
    return "Shop Online in India";
  }

  const parts = [title];

  if (brand && !title.toLowerCase().includes(brand.toLowerCase())) {
    parts.push(brand);
  }

  if (category && !title.toLowerCase().includes(category.toLowerCase())) {
    parts.push(category);
  }

  parts.push("Buy Online India");

  return parts.filter(Boolean).join(" | ");
}

export function buildProductMetaDescription(product) {
  const sourceDescription =
    normalizeKeyword(product?.seo_description) ||
    normalizeKeyword(product?.short_description) ||
    normalizeKeyword(String(product?.description || "").replace(/<[^>]*>/g, " "));
  const title = normalizeKeyword(product?.title || product?.name || "this product");
  const category = normalizeKeyword(product?.category || product?.product_type || "lifestyle");
  const brand = normalizeKeyword(product?.brand || product?.vendor);

  if (sourceDescription) {
    return trimMetaDescription(sourceDescription);
  }

  const leadingText = brand
    ? `Shop ${title} by ${brand} online in India.`
    : `Shop ${title} online in India.`;

  return trimMetaDescription(
    `${leadingText} Explore ${category} product details, pricing, and delivery information on GoModexa.`
  );
}

export function buildCategoryMetaTitle(category, { page = 1 } = {}) {
  const title = normalizeKeyword(category?.title || category);
  const pageNumber = getPageNumber(page);

  if (!title) {
    return pageNumber > 1 ? `Collections Page ${pageNumber}` : "Collections";
  }

  const baseTitle = `${title} Products Online in India | GoModexa`;
  return pageNumber > 1 ? `${baseTitle} | Page ${pageNumber}` : baseTitle;
}

export function buildCategoryMetaDescription(category, { page = 1 } = {}) {
  const title = normalizeKeyword(category?.title || category || "products");
  const pageNumber = getPageNumber(page);
  const guide = getCategoryGuideCopy(category);
  const relatedLabels = [
    ...(Array.isArray(category?.rawCategories) ? category.rawCategories : []),
    ...(Array.isArray(category?.rawProductTypes) ? category.rawProductTypes : []),
  ]
    .map((value) => normalizeKeyword(value))
    .filter(Boolean)
    .filter((value) => value.toLowerCase() !== title.toLowerCase())
    .slice(0, 3);
  const count = Number(category?.count || 0);
  const relatedText =
    relatedLabels.length > 0
      ? ` Explore ${relatedLabels.join(", ")}, and more in one category page.`
      : "";
  const baseDescription = trimMetaDescription(
      `${stripHtml(guide.intro)} ${
        count > 0
          ? `Browse ${count} ${title.toLowerCase()} products on GoModexa.`
          : `Browse ${title.toLowerCase()} products on GoModexa.`
      }${relatedText} Shop with product comparisons, blog guides, and cleaner category discovery.`
  );

  return pageNumber > 1
      ? trimMetaDescription(`${baseDescription} Collection page ${pageNumber}.`)
      : baseDescription;
}

export function buildBrandMetaTitle(brand, { page = 1 } = {}) {
  const title = normalizeKeyword(brand?.title || brand);
  const pageNumber = getPageNumber(page);

  if (!title) {
    return pageNumber > 1 ? `Brand Collection Page ${pageNumber}` : "Brand Collection";
  }

  const baseTitle = `${title} Products Online in India`;
  return pageNumber > 1 ? `${baseTitle} | Page ${pageNumber}` : baseTitle;
}

export function buildBrandMetaDescription(brand, { page = 1 } = {}) {
  const title = normalizeKeyword(brand?.title || brand || "brand");
  const pageNumber = getPageNumber(page);
  const baseDescription = trimMetaDescription(
    `Shop ${title} products online in India with streamlined discovery, category browsing, and current collection visibility on GoModexa.`
  );

  return pageNumber > 1
    ? trimMetaDescription(`${baseDescription} Collection page ${pageNumber}.`)
    : baseDescription;
}

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  keywords = [],
  includeDefaultKeywords = true,
  image = "/assets/gomodexa.png",
  openGraphType = "website",
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  authors,
  robots = {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const url = getSiteUrl(path);
  const mergedKeywords = includeDefaultKeywords
    ? Array.from(new Set([...DEFAULT_KEYWORDS, ...keywords]))
    : mergeKeywords(keywords);
  const normalizedTags = mergeKeywords(tags);

  return {
    metadataBase: new URL(SITE_URL),
    title: fullTitle,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: openGraphType,
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      ...(openGraphType === "article"
        ? {
            publishedTime,
            modifiedTime,
            section,
            tags: normalizedTags,
            authors,
          }
        : {}),
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    robots,
  };
}

export function buildNoIndexMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  keywords = [],
  includeDefaultKeywords = true,
  image = "/assets/gomodexa.png",
} = {}) {
  return buildMetadata({
    title,
    description,
    path,
    keywords,
    includeDefaultKeywords,
    image,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  });
}

export function getQueryValue(value) {
  if (Array.isArray(value)) {
    return String(value[0] || "").trim();
  }

  return String(value || "").trim();
}

export function getPageNumber(value) {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  const pageNumber = Number(normalizedValue || 1);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return 1;
  }

  return pageNumber;
}

export function buildPaginatedPath(path, page = 1) {
  return page > 1 ? `${path}?page=${page}` : path;
}

export function buildCollectionMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  keywords = [],
  image = "/assets/gomodexa.png",
  page = 1,
  query = "",
  hasFilters = false,
} = {}) {
  const normalizedQuery = getQueryValue(query);
  const normalizedPage = getPageNumber(page);
  const resolvedPath = buildPaginatedPath(path, normalizedPage);
  const shouldIndex = !normalizedQuery && !hasFilters && normalizedPage === 1;

  return buildMetadata({
    title,
    description,
    path: resolvedPath,
    keywords,
    includeDefaultKeywords: false,
    image,
    robots: shouldIndex
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
            noimageindex: true,
          },
        },
  });
}

export function buildOrganizationSchema() {
  const sameAs = Array.from(
    new Set([SITE_URL, SITE_ORIGIN_WITHOUT_WWW, getSiteUrl("/brand-resources"), ...getSocialProfileUrls()])
  );

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": getEntityId("organization"),
    name: SITE_NAME,
    alternateName: ["Go Modexa", "gomodexa.com"],
    url: SITE_URL,
    logo: getSiteUrl("/assets/gomodexa.png"),
    sameAs,
    hasMerchantReturnPolicy: buildMerchantReturnPolicy(),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": getEntityId("website"),
    name: SITE_NAME,
    alternateName: ["Go Modexa", "GoModexa Official Site"],
    url: SITE_URL,
    publisher: {
      "@id": getEntityId("organization"),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOnlineStoreSchema(reviewSummary = {}) {
  const reviewCount = Number(reviewSummary?.reviewCount || 0);
  const averageRating = Number(reviewSummary?.averageRating || 0);
  const reviews = Array.isArray(reviewSummary?.reviews)
    ? reviewSummary.reviews
        .filter((review) => review?.reviewText && Number(review?.rating || 0) > 0)
        .slice(0, 3)
    : [];

  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": getEntityId("store"),
    name: SITE_NAME,
    url: SITE_URL,
    image: getSiteUrl("/assets/gomodexa.png"),
    sameAs: Array.from(new Set([SITE_URL, ...getSocialProfileUrls()])),
    parentOrganization: {
      "@id": getEntityId("organization"),
    },
    ...(reviewCount > 0 && averageRating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviews.length > 0
      ? {
          review: reviews.map((review) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: Number(review.rating || 0),
              bestRating: 5,
              worstRating: 1,
            },
            author: {
              "@type": "Person",
              name: review.displayName || "GoModexa customer",
            },
            reviewBody: review.reviewText,
            name: review.headline || "Customer review",
            datePublished: review.createdAt || undefined,
          })),
        }
      : {}),
  };
}

const COMMON_COLORS = [
  "black",
  "white",
  "blue",
  "red",
  "green",
  "navy",
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
  return String(value || "")
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

function extractProductColors(product) {
  const values = [
    ...getVariantOptionValues(product),
    ...String(product?.color || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    ...(Array.isArray(product?.tags) ? product.tags : []),
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

function extractProductSizes(product) {
  const values = [
    ...getVariantOptionValues(product),
    ...String(product?.size || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ];

  return Array.from(
    new Set(values.filter((value) => SIZE_PATTERN.test(value)).map((value) => value.toUpperCase()))
  );
}

function buildMerchantReturnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "IN",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 2,
    returnFees: "https://schema.org/ReturnShippingFees",
    returnMethod: "https://schema.org/ReturnByMail",
    merchantReturnLink: getSiteUrl("/cancellation-refund-policy"),
  };
}

function buildShippingDetails(product) {
  const shippingRate = Number(product?.shipping_charge ?? 0);

  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: Number.isFinite(shippingRate) ? shippingRate : 0,
      currency: "INR",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "IN",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 3,
        maxValue: 7,
        unitCode: "DAY",
      },
    },
  };
}

export function buildBreadcrumbSchema(items = []) {
  const validItems = items.filter((item) => item?.name && item?.path);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: validItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getSiteUrl(item.path),
    })),
  };
}

export function buildCollectionPageSchema({
  name,
  description,
  path,
  items = [],
} = {}) {
  const validItems = items.filter((item) => item?.name && item?.url);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: getSiteUrl(path || "/"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: validItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: item.url.startsWith("http") ? item.url : getSiteUrl(item.url),
        name: item.name,
      })),
    },
  };
}

export function buildArticleSchema({
  schemaType = "Article",
  title,
  description,
  path,
  publishedAt,
  modifiedAt,
  image = "/assets/gomodexa.png",
  keywords = [],
  section,
  articleBody,
  wordCount,
} = {}) {
  if (!title || !path) {
    return null;
  }

  const articleKeywords = Array.isArray(keywords)
    ? keywords.filter(Boolean).join(", ")
    : String(keywords || "").trim();

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: title,
    description: description || "",
    url: getSiteUrl(path),
    mainEntityOfPage: getSiteUrl(path),
    datePublished: publishedAt || undefined,
    dateModified: modifiedAt || publishedAt || undefined,
    image: [getSiteUrl(image)],
    articleSection: section || undefined,
    keywords: articleKeywords || undefined,
    articleBody: articleBody || undefined,
    wordCount: Number.isFinite(wordCount) && wordCount > 0 ? wordCount : undefined,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: getSiteUrl("/assets/gomodexa.png"),
      },
    },
  };
}

export function buildFaqSchema(items = []) {
  const validItems = items.filter((item) => item?.question && item?.answer);

  if (validItems.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildProductSchema(product, { path, reviewSummary = null } = {}) {
  if (!product) {
    return null;
  }

  const primaryVariant = product?.variants?.[0] || null;
  const price = Number(primaryVariant?.price_selling ?? product?.price_selling ?? 0);
  const availability =
    Number(product?.inventory_quantity || primaryVariant?.inventory_quantity || 0) > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";
  const imageUrls = [
    product?.main_image,
    ...(Array.isArray(product?.product_images)
      ? product.product_images.map((image) => image?.src).filter(Boolean)
      : []),
  ].filter(Boolean);
  const colors = extractProductColors(product);
  const sizes = extractProductSizes(product);
  const productUrl = getSiteUrl(path || "/");
  const validReviews =
    reviewSummary?.isSampleFallback || !Array.isArray(reviewSummary?.reviews)
      ? []
      : reviewSummary.reviews
          .filter((review) => review?.reviewText && Number(review?.rating || 0) > 0)
          .slice(0, 3);
  const validReviewCount =
    reviewSummary?.isSampleFallback ? 0 : Number(reviewSummary?.reviewCount || 0);
  const validAverageRating =
    reviewSummary?.isSampleFallback ? 0 : Number(reviewSummary?.averageRating || 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.title || product?.name || "Product",
    description: product?.short_description || product?.description || "",
    url: productUrl,
    image: Array.from(new Set(imageUrls)),
    sku: primaryVariant?.sku || undefined,
    brand: {
      "@type": "Brand",
      name: product?.brand || product?.vendor || SITE_NAME,
    },
    category: product?.category || product?.product_type || undefined,
    color: colors.length > 0 ? colors.join(", ") : undefined,
    size: sizes.length > 0 ? sizes.join(", ") : undefined,
    ...(validReviewCount > 0 && validAverageRating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: validAverageRating,
            reviewCount: validReviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(validReviews.length > 0
      ? {
          review: validReviews.map((review) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: Number(review.rating || 0),
              bestRating: 5,
              worstRating: 1,
            },
            author: {
              "@type": "Person",
              name: review.displayName || "GoModexa customer",
            },
            reviewBody: review.reviewText,
            name: review.headline || "Customer review",
            datePublished: review.createdAt || undefined,
          })),
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price,
      availability,
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: buildShippingDetails(product),
      hasMerchantReturnPolicy: buildMerchantReturnPolicy(),
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  };
}
