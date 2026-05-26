const SITE_NAME = "GoModexa";
const SITE_URL = String(
  process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.gomodexa.com"
).replace(/\/+$/, "");
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

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  keywords = [],
  image = "/assets/gomodexa.png",
  robots = {
    index: true,
    follow: true,
  },
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const url = getSiteUrl(path);
  const mergedKeywords = Array.from(new Set([...DEFAULT_KEYWORDS, ...keywords]));

  return {
    metadataBase: new URL(SITE_URL),
    title: fullTitle,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
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
  image = "/assets/gomodexa.png",
} = {}) {
  return buildMetadata({
    title,
    description,
    path,
    keywords,
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

export function buildOrganizationSchema() {
  const sameAs = Array.from(new Set([SITE_URL, ...getSocialProfileUrls()]));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: getSiteUrl("/assets/gomodexa.png"),
    sameAs,
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
    name: SITE_NAME,
    url: SITE_URL,
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
    name: SITE_NAME,
    url: SITE_URL,
    image: getSiteUrl("/assets/gomodexa.png"),
    sameAs: Array.from(new Set([SITE_URL, ...getSocialProfileUrls()])),
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
  title,
  description,
  path,
  publishedAt,
  modifiedAt,
  image = "/assets/gomodexa.png",
  keywords = [],
  section,
} = {}) {
  if (!title || !path) {
    return null;
  }

  const articleKeywords = Array.isArray(keywords)
    ? keywords.filter(Boolean).join(", ")
    : String(keywords || "").trim();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description || "",
    url: getSiteUrl(path),
    mainEntityOfPage: getSiteUrl(path),
    datePublished: publishedAt || undefined,
    dateModified: modifiedAt || publishedAt || undefined,
    image: [getSiteUrl(image)],
    articleSection: section || undefined,
    keywords: articleKeywords || undefined,
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

export function buildProductSchema(product, { path } = {}) {
  if (!product) {
    return null;
  }

  const primaryVariant = product?.variants?.[0] || null;
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

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.title || product?.name || "Product",
    description: product?.short_description || product?.description || "",
    image: Array.from(new Set(imageUrls)),
    sku: primaryVariant?.sku || undefined,
    brand: {
      "@type": "Brand",
      name: product?.brand || product?.vendor || SITE_NAME,
    },
    category: product?.category || product?.product_type || undefined,
    offers: {
      "@type": "Offer",
      url: getSiteUrl(path || "/"),
      priceCurrency: "INR",
      price: Number(primaryVariant?.price_selling ?? product?.price_selling ?? 0),
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}
