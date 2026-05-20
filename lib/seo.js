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

