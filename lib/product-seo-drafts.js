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

function buildSeoTitle(title) {
  return clampText(`${title} Online | GoModexa`, 65);
}

function buildSeoDescription(title, category) {
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

  const base = `Shop ${title} online at GoModexa.`;
  const tail =
    categoryPhrases[category] ||
    "A practical everyday-use product with cleaner shopping discovery and repeat-use value.";

  return clampText(`${base} ${tail}`, 160);
}

function buildShortDescription(product, title, category) {
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

  return clampText(
    `${title} is a ${category.toLowerCase()} product on GoModexa. ${
      categoryLines[category] || buildFallbackProductDescription(product)
    }`,
    240
  );
}

export function generateProductSeoDraft(product) {
  const title = normalizeProductTitle(product?.title || "Untitled Product");
  const category = getPublicCategoryLabel(product);
  const cleanedBrand = cleanBrand(product?.brand || product?.vendor);

  return {
    title,
    category,
    brand: cleanedBrand,
    short_description: buildShortDescription(product, title, category),
    seo_title: buildSeoTitle(title),
    seo_description: buildSeoDescription(title, category),
  };
}
