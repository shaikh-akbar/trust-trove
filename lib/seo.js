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
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: getSiteUrl("/assets/gomodexa.png"),
    sameAs: [SITE_URL],
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
