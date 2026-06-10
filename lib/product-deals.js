const DEAL_COLLECTIONS = [
  {
    id: "under-99",
    tag: "deal-under-99",
    title: "Best Deals Under Rs. 99",
    shortLabel: "Under Rs. 99",
    seoTitle: "best deals under 99",
    description:
      "Ultra-affordable picks for add-on shopping, utility buys, and impulse-friendly value discovery.",
  },
  {
    id: "under-499",
    tag: "deal-under-499",
    title: "Best Deals Under Rs. 499",
    shortLabel: "Under Rs. 499",
    seoTitle: "best deals under 499",
    description:
      "Everyday value products for practical shopping, gifting, and budget-friendly category browsing.",
  },
  {
    id: "under-999",
    tag: "deal-under-999",
    title: "Best Deals Under Rs. 999",
    shortLabel: "Under Rs. 999",
    seoTitle: "best deals under 999",
    description:
      "Mid-range deal picks with more product depth, better presentation, and stronger buying intent.",
  },
  {
    id: "under-1499",
    tag: "deal-under-1499",
    title: "Best Deals Under Rs. 1499",
    shortLabel: "Under Rs. 1499",
    seoTitle: "best deals under 1499",
    description:
      "Feature-rich products for shoppers looking slightly above entry-level budget lanes.",
  },
  {
    id: "under-1999",
    tag: "deal-under-1999",
    title: "Best Deals Under Rs. 1999",
    shortLabel: "Under Rs. 1999",
    seoTitle: "best deals under 1999",
    description:
      "Higher-value deal products for stronger gifting, better specs, and premium budget discovery.",
  },
];

const BEST_DEALS_PAGE_DEFINITIONS = [
  {
    id: "all-deals",
    slug: "all-deals",
    path: "/best-deals",
    tabLabel: "All Deals",
    eyebrow: "GoModexa Best Deals",
    title: "Best Deals",
    heading: "Top Products. Unbeatable Prices.",
    subtitle: "Limited Time Offers | Shop More, Save More!",
    seoTitle: "Best Deals Online in India",
    metaDescription:
      "Browse GoModexa best deals online in India with dedicated price tabs, admin-curated deal products, and a stronger branded shopping landing page.",
    keywords: [
      "GoModexa best deals",
      "best deals online India",
      "shop deals on gomodexa.com",
      "discount products India",
      "best online deal page India",
    ],
    intro:
      "This page groups all active deal-tagged products into one stronger branded destination so shoppers can scan offers faster and jump into a specific price lane when needed.",
    seoBody:
      "A dedicated Best Deals route helps GoModexa create stronger internal linking, clearer price-intent landing pages, and more focused search relevance for branded bargain and value-based shopping queries.",
    sectionTitle: "Top Best Deals",
    badge: "All active deal buckets",
    dealIds: [],
    faqs: [
      {
        question: "What is the Best Deals page on GoModexa?",
        answer:
          "It is a dedicated deal destination that groups admin-curated products into price-based deal tabs for faster browsing and stronger search visibility.",
      },
      {
        question: "How are Best Deals products selected?",
        answer:
          "Products appear here when the admin assigns them to one of the active deal buckets such as under 99, under 499, under 999, under 1499, or under 1999.",
      },
      {
        question: "Why use separate deal routes instead of one generic section?",
        answer:
          "Separate deal routes make price-led browsing clearer for shoppers and create stronger SEO signals around specific shopping-intent searches.",
      },
    ],
  },
  {
    id: "under-99",
    slug: "under-99",
    path: "/best-deals/under-99",
    tabLabel: "Under Rs. 99",
    eyebrow: "GoModexa Under 99",
    title: "Best Deals Under Rs. 99",
    heading: "Top Products. Unbeatable Prices.",
    subtitle: "Low-ticket picks selected for fast value shopping.",
    seoTitle: "Best Deals Under 99 Online in India",
    metaDescription:
      "Explore GoModexa best deals under Rs. 99 online in India with admin-curated utility picks, gifting add-ons, and ultra-affordable shopping options.",
    keywords: [
      "best deals under 99",
      "products under 99 online India",
      "GoModexa under 99 deals",
      "cheap useful products India",
      "budget shopping under 99",
    ],
    intro:
      "This lane is designed for shoppers who want low-cost utility, gifting add-ons, and impulse-friendly products in a cleaner deal-first layout.",
    seoBody:
      "The under 99 page gives GoModexa a stronger destination for bargain-led shopping intent and helps users compare admin-selected ultra-affordable products without noise from unrelated price bands.",
    sectionTitle: "Top Best Deals",
    badge: "Under Rs. 99 deal lane",
    dealIds: ["under-99"],
    faqs: [
      {
        question: "What kinds of products show under Rs. 99?",
        answer:
          "This lane usually highlights small utility products, lower-cost add-ons, and ultra-affordable items chosen by the admin for value shopping.",
      },
      {
        question: "Are these products selected automatically by price?",
        answer:
          "No. Products show here when the admin assigns them to the under 99 deal bucket for storefront promotion.",
      },
      {
        question: "Why have a dedicated under 99 page?",
        answer:
          "It gives shoppers a cleaner bargain-focused route and helps GoModexa target strong low-budget deal search intent.",
      },
    ],
  },
  {
    id: "under-499",
    slug: "under-499",
    path: "/best-deals/under-499",
    tabLabel: "Under Rs. 499",
    eyebrow: "GoModexa Under 499",
    title: "Best Deals Under Rs. 499",
    heading: "Top Products. Unbeatable Prices.",
    subtitle: "Practical value products selected for broader everyday shopping.",
    seoTitle: "Best Deals Under 499 Online in India",
    metaDescription:
      "Browse GoModexa best deals under Rs. 499 online in India with admin-selected value products for everyday utility, gifting, and affordable category discovery.",
    keywords: [
      "best deals under 499",
      "products under 499 online India",
      "GoModexa under 499 deals",
      "budget products India",
      "affordable everyday products online",
    ],
    intro:
      "The under 499 lane is built for shoppers who want more variety than ultra-cheap picks while staying inside a practical budget range.",
    seoBody:
      "This page gives GoModexa a stronger search landing page for budget-conscious value shopping and lets the admin manually spotlight affordable products worth promoting in this range.",
    sectionTitle: "Top Best Deals",
    badge: "Under Rs. 499 deal lane",
    dealIds: ["under-499"],
    faqs: [
      {
        question: "What is the under 499 page for?",
        answer:
          "It is a dedicated deal lane for affordable everyday products, utility items, and budget-friendly finds chosen by the admin.",
      },
      {
        question: "How are products included here?",
        answer:
          "Products appear here when the admin assigns them to the under 499 deal bucket in the product editor.",
      },
      {
        question: "Why is this page useful for SEO?",
        answer:
          "It creates a focused route for searches around affordable products under 499 instead of hiding those items inside a larger generic catalog.",
      },
    ],
  },
  {
    id: "under-999",
    slug: "under-999",
    path: "/best-deals/under-999",
    tabLabel: "Under Rs. 999",
    eyebrow: "GoModexa Under 999",
    title: "Best Deals Under Rs. 999",
    heading: "Top Products. Unbeatable Prices.",
    subtitle: "Mid-range picks selected for stronger product value and wider appeal.",
    seoTitle: "Best Deals Under 999 Online in India",
    metaDescription:
      "Discover GoModexa best deals under Rs. 999 online in India with admin-selected mid-range products, stronger gifting options, and higher-value shopping picks.",
    keywords: [
      "best deals under 999",
      "products under 999 online India",
      "GoModexa under 999 deals",
      "mid range products India",
      "value shopping under 999",
    ],
    intro:
      "The under 999 lane is for shoppers looking for more substantial products while still staying inside a disciplined mid-budget shopping limit.",
    seoBody:
      "This route supports stronger mid-range deal discovery and lets GoModexa target searches around products under 999 with a cleaner, more focused branded landing page.",
    sectionTitle: "Top Best Deals",
    badge: "Under Rs. 999 deal lane",
    dealIds: ["under-999"],
    faqs: [
      {
        question: "What products usually appear under Rs. 999?",
        answer:
          "This lane often includes more substantial products, better gifting options, and stronger value picks selected by the admin.",
      },
      {
        question: "Can a product appear here even if it is also in another lane?",
        answer:
          "Yes. If the admin assigns a product to multiple deal buckets, it can appear in more than one relevant deal page.",
      },
      {
        question: "Why separate under 999 from lower deal pages?",
        answer:
          "It gives shoppers a cleaner mid-range destination and creates a stronger SEO target for a different buying-intent band.",
      },
    ],
  },
  {
    id: "under-1499",
    slug: "under-1499",
    path: "/best-deals/under-1499",
    tabLabel: "Under Rs. 1499",
    eyebrow: "GoModexa Under 1499",
    title: "Best Deals Under Rs. 1499",
    heading: "Top Products. Unbeatable Prices.",
    subtitle: "Higher-value deal picks selected for stronger feature-led shopping.",
    seoTitle: "Best Deals Under 1499 Online in India",
    metaDescription:
      "Shop GoModexa best deals under Rs. 1499 online in India with admin-selected value products, stronger features, and better gifting potential.",
    keywords: [
      "best deals under 1499",
      "products under 1499 online India",
      "GoModexa under 1499 deals",
      "feature rich deals India",
      "value shopping under 1499",
    ],
    intro:
      "The under 1499 lane is meant for users who want stronger product depth without moving too far into high-ticket shopping territory.",
    seoBody:
      "This route gives GoModexa a branded page for deal-led product discovery just above mid-range levels, while keeping admin curation in control of which products are featured.",
    sectionTitle: "Top Best Deals",
    badge: "Under Rs. 1499 deal lane",
    dealIds: ["under-1499"],
    faqs: [
      {
        question: "Why is there an under 1499 deal page?",
        answer:
          "It creates a better destination for products that sit above common lower-budget deal lanes but still fit deal-focused shopping intent.",
      },
      {
        question: "How are products chosen here?",
        answer:
          "Products show here when the admin tags them into the under 1499 deal bucket.",
      },
      {
        question: "What kind of shopper benefits from this page?",
        answer:
          "It helps shoppers who want more features or value than low-budget picks but still want a price-guided route.",
      },
    ],
  },
  {
    id: "under-1999",
    slug: "under-1999",
    path: "/best-deals/under-1999",
    tabLabel: "Under Rs. 1999",
    eyebrow: "GoModexa Under 1999",
    title: "Best Deals Under Rs. 1999",
    heading: "Top Products. Unbeatable Prices.",
    subtitle: "Premium-budget picks selected for stronger gifting and product value.",
    seoTitle: "Best Deals Under 1999 Online in India",
    metaDescription:
      "Browse GoModexa best deals under Rs. 1999 online in India with admin-curated premium-budget products, stronger gifting options, and higher-value deal discovery.",
    keywords: [
      "best deals under 1999",
      "products under 1999 online India",
      "GoModexa under 1999 deals",
      "premium budget deals India",
      "higher value products online",
    ],
    intro:
      "The under 1999 lane is designed for users comparing higher-value products while still staying inside a clearly defined budget ceiling.",
    seoBody:
      "A dedicated under 1999 route gives GoModexa a stronger page for premium-budget deal discovery and helps search engines understand this price-led collection more clearly.",
    sectionTitle: "Top Best Deals",
    badge: "Under Rs. 1999 deal lane",
    dealIds: ["under-1999"],
    faqs: [
      {
        question: "What is special about the under 1999 page?",
        answer:
          "It focuses on higher-value deal products with stronger gifting and feature appeal while still staying within a controlled budget lane.",
      },
      {
        question: "Are these products admin-selected?",
        answer:
          "Yes. Products show here when the admin assigns them to the under 1999 deal bucket.",
      },
      {
        question: "Why is this useful for SEO and UX?",
        answer:
          "It creates a cleaner premium-budget destination page for users and a stronger topical page for price-led search discovery.",
      },
    ],
  },
];

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function getDealCollectionDefinitions() {
  return DEAL_COLLECTIONS;
}

export function getBestDealsPageDefinitions() {
  return BEST_DEALS_PAGE_DEFINITIONS;
}

export function getDefaultBestDealsPageDefinition() {
  return BEST_DEALS_PAGE_DEFINITIONS[0];
}

export function getBestDealsPageDefinitionBySlug(slug) {
  const normalizedSlug = String(slug || "").trim().toLowerCase();

  if (!normalizedSlug || normalizedSlug === "all-deals") {
    return getDefaultBestDealsPageDefinition();
  }

  return BEST_DEALS_PAGE_DEFINITIONS.find((item) => item.slug === normalizedSlug) || null;
}

export function getBestDealsChildPageDefinitions() {
  return BEST_DEALS_PAGE_DEFINITIONS.filter((item) => item.path !== "/best-deals");
}

export function normalizeDealTags(value) {
  return normalizeTags(value);
}

export function getDealCollectionById(id) {
  return DEAL_COLLECTIONS.find((deal) => deal.id === id) || null;
}

export function getActiveDealIdsFromTags(tags) {
  const normalizedTags = normalizeTags(tags);

  return DEAL_COLLECTIONS.filter((deal) => normalizedTags.includes(deal.tag)).map((deal) => deal.id);
}

export function getActiveDealIdsFromProduct(product) {
  return getActiveDealIdsFromTags(product?.tags);
}

export function updateDealTags(tags, selectedDealIds = []) {
  const normalizedTags = normalizeTags(tags).filter(
    (tag) => !DEAL_COLLECTIONS.some((deal) => deal.tag === tag)
  );
  const selected = new Set(
    (selectedDealIds || []).filter((dealId) => DEAL_COLLECTIONS.some((deal) => deal.id === dealId))
  );

  DEAL_COLLECTIONS.forEach((deal) => {
    if (selected.has(deal.id)) {
      normalizedTags.push(deal.tag);
    }
  });

  return Array.from(new Set(normalizedTags));
}

export function productQualifiesForDeal(product, deal) {
  if (!product || !deal) {
    return false;
  }

  return normalizeTags(product?.tags).includes(deal.tag);
}
