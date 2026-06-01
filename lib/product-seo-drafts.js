import {
  buildFallbackProductDescription,
  getPublicCategoryLabel,
  normalizeProductTitle,
} from "./storefront";

const EXCLUDED_BRANDS = new Set(["", "unbranded", "wukusy", "wukusy catalog"]);

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function clampText(value, maxLength) {
  const normalized = normalizeText(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const shortened = normalized.slice(0, maxLength + 1);
  const lastSpaceIndex = shortened.lastIndexOf(" ");

  return normalizeText(
    `${(lastSpaceIndex > 40 ? shortened.slice(0, lastSpaceIndex) : shortened.slice(0, maxLength)).trim()}`
  );
}

function cleanBrand(value) {
  const normalized = normalizeText(value);

  if (EXCLUDED_BRANDS.has(normalized.toLowerCase())) {
    return "";
  }

  return normalized;
}

function buildStoreBrand(category) {
  const categoryBrandMap = {
    Travel: "GoModexa Travel",
    "Home & Kitchen": "GoModexa Home",
    "Mobile Accessories": "GoModexa Tech",
    Electronics: "GoModexa Tech",
    Watches: "GoModexa Watches",
    "Fashion Accessories": "GoModexa Style",
    "Health & Beauty": "GoModexa Care",
    "Office Accessories": "GoModexa Essentials",
    Garden: "GoModexa Home",
  };

  return categoryBrandMap[category] || "GoModexa";
}

function buildSeoKeywords(title, category, brand) {
  const keywords = [
    title,
    `${title} online`,
    `${title} India`,
    `${title} price`,
    category,
    `${category} online`,
    `${category} India`,
    `${category} products`,
    brand,
    brand ? `${brand} ${category}` : "",
    `buy ${title} online`,
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  return Array.from(new Set(keywords)).join(", ");
}

function buildSeoTitle(title, category, brand) {
  const parts = [title];

  if (brand && !title.toLowerCase().includes(brand.toLowerCase())) {
    parts.push(brand);
  }

  if (category && !title.toLowerCase().includes(category.toLowerCase())) {
    parts.push(category);
  }

  parts.push("Buy Online India");

  return clampText(parts.filter(Boolean).join(" | "), 65);
}

function buildSeoDescription(title, category, brand) {
  const categoryPhrases = {
    Automotive: "Useful for everyday heat protection and easier parked-car comfort.",
    "Baby & Kids": "A useful child-friendly pick designed for comfort, daily use, and practical support.",
    "Bags & Wallets": "A practical carry accessory for everyday organization, travel, and easy portability.",
    Electronics: "A practical gadget choice for daily convenience, desk setups, and repeat use.",
    "Fashion Accessories": "A simple accessory choice for everyday styling, gifting, and repeat wear.",
    "Food & Gifting": "A gift-friendly product with easy everyday appeal and enjoyable repeat use.",
    Garden: "A useful home gardening pick designed for simple care and regular everyday use.",
    "Health & Beauty": "A useful self-care pick designed for grooming, freshness, and everyday routines.",
    "Home & Kitchen": "Useful for everyday convenience, compact storage, and cleaner home routines.",
    "Mobile Accessories": "A practical mobile accessory for daily convenience, setup support, and repeat use.",
    "Office Accessories": "A useful stationery and desk essential for school, study, and everyday workspace use.",
    Travel: "A practical travel accessory for easier movement, organization, and everyday carry.",
    Watches: "A wearable everyday pick with gifting appeal and simple styling versatility.",
  };

  const base = brand
    ? `Shop ${title} by ${brand} online in India at GoModexa.`
    : `Shop ${title} online in India at GoModexa.`;
  const tail =
    categoryPhrases[category] ||
    "A practical everyday-use product with cleaner shopping discovery and repeat-use value.";

  return clampText(`${base} ${tail}`, 160);
}

function buildShortDescription(product, title, category, brand) {
  const categoryLines = {
    Automotive:
      "A practical automotive accessory designed to reduce everyday driving or parking friction with simple, repeat-use convenience.",
    "Baby & Kids":
      "A useful child-focused accessory designed for comfort, support, and easier everyday travel or routine use.",
    "Bags & Wallets":
      "A practical carry accessory designed for easy organization, daily use, and simple travel-ready convenience.",
    Electronics:
      "A practical electronics pick designed for daily convenience, gifting appeal, and cleaner use across work, study, or home routines.",
    "Fashion Accessories":
      "A simple fashion accessory designed for everyday styling, gifting, and versatile repeat wear.",
    "Food & Gifting":
      "A gift-friendly product with easy everyday appeal, simple sharing value, and convenient repeat use.",
    Garden:
      "A practical gardening accessory designed for simple plant care, home use, and everyday convenience.",
    "Health & Beauty":
      "A useful self-care accessory designed for grooming, daily routines, and easy repeat use.",
    "Home & Kitchen":
      "A practical home-use product designed for everyday convenience, compact utility, and cleaner daily routines.",
    "Mobile Accessories":
      "A useful phone accessory designed for better daily convenience, setup support, and repeat use.",
    "Office Accessories":
      "A practical stationery and study essential designed for school use, desk setups, and everyday organization.",
    Travel:
      "A useful travel accessory designed for easier identification, portable convenience, and repeat everyday carry.",
    Watches:
      "A wearable everyday accessory with simple styling appeal, gifting potential, and repeat-use versatility.",
  };
  const variantCount = Array.isArray(product?.variants) ? product.variants.length : 0;
  const inventoryQuantity = Number(product?.inventory_quantity || 0);
  const brandText = brand ? `${brand} presents ` : "";
  const merchandisingLine =
    variantCount > 1
      ? ` Buyers can compare ${variantCount} selectable options to find the version that best matches their routine, gifting need, or daily-use preference.`
      : " This listing works best when shoppers want a straightforward single-option product without extra decision friction.";
  const availabilityLine =
    inventoryQuantity > 0
      ? " The item is currently available, making it easier to move from product discovery into confident ordering."
      : "";

  return clampText(
    `${brandText}${title} is part of GoModexa's ${category.toLowerCase()} collection. ${
      categoryLines[category] || buildFallbackProductDescription(product)
    }${merchandisingLine}${availabilityLine}`,
    320
  );
}

export function generateProductSeoDraft(product) {
  const title = normalizeProductTitle(product?.title || "Untitled Product");
  const category = getPublicCategoryLabel(product);
  const cleanedBrand = cleanBrand(product?.brand || product?.vendor) || buildStoreBrand(category);

  return {
    title,
    category,
    brand: cleanedBrand,
    short_description: buildShortDescription(product, title, category, cleanedBrand),
    seo_title: buildSeoTitle(title, category, cleanedBrand),
    seo_description: buildSeoDescription(title, category, cleanedBrand),
    seo_keywords: buildSeoKeywords(title, category, cleanedBrand),
  };
}
