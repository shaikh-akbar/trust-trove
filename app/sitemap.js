import { BLOG_POSTS } from "../lib/content";
import { getBrandSummaries, getCategorySummaries } from "../lib/product";
import { getProductHref } from "../lib/product-route";
import { getSupabaseAdmin } from "../lib/supabase-admin";
import { getSiteUrl, hasIndexableProductPageSignals } from "../lib/seo";

const STOREFRONT_SUPPLIER_NAMES = ["wukusy", "gomodexa"];

function toDate(value) {
  const parsed = new Date(value || Date.now());
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getSitemapImageUrls(product) {
  const imageUrl = String(product?.main_image || "").trim();

  if (!/^https?:\/\//i.test(imageUrl)) {
    return [];
  }

  return [imageUrl];
}

async function getAllIndexedProducts() {
  const supabase = getSupabaseAdmin();
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      slug,
      handle,
      title,
      description,
      short_description,
      seo_description,
      seo_keywords,
      tags,
      vendor,
      brand,
      category,
      product_type,
      main_image,
      is_featured,
      updated_at,
      created_at,
      variants!inner (
        id,
        inventory_quantity,
        supplier_name,
        status
      )
    `)
    .eq("status", "active")
    .in("variants.supplier_name", STOREFRONT_SUPPLIER_NAMES)
    .eq("variants.status", "active")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Sitemap product query failed:", error);
    return [];
  }

  return (products || []).filter(
    (product) => product?.slug && hasIndexableProductPageSignals(product)
  );
}

export default async function sitemap() {
  const [categories, brands, products] = await Promise.all([
    getCategorySummaries({ forceFresh: true }),
    getBrandSummaries({ forceFresh: true }),
    getAllIndexedProducts(),
  ]);
  const now = new Date();

  const staticRouteEntries = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/shop", priority: 0.95, changeFrequency: "daily" },
    { path: "/new-arrivals", priority: 0.9, changeFrequency: "daily" },
    { path: "/categories", priority: 0.85, changeFrequency: "weekly" },
    { path: "/blogs", priority: 0.75, changeFrequency: "weekly" },
    { path: "/about-us", priority: 0.6, changeFrequency: "monthly" },
    { path: "/brand-resources", priority: 0.58, changeFrequency: "monthly" },
    { path: "/contact-us", priority: 0.55, changeFrequency: "monthly" },
    { path: "/shipping-policy", priority: 0.45, changeFrequency: "monthly" },
    { path: "/cancellation-refund-policy", priority: 0.45, changeFrequency: "monthly" },
    { path: "/store-policies", priority: 0.45, changeFrequency: "monthly" },
    { path: "/terms-of-service", priority: 0.4, changeFrequency: "monthly" },
  ];

  if (brands.length > 0) {
    staticRouteEntries.splice(4, 0, {
      path: "/brands",
      priority: 0.8,
      changeFrequency: "weekly",
    });
  }

  const staticRoutes = staticRouteEntries.map((entry) => ({
    url: getSiteUrl(entry.path),
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const categoryRoutes = (categories || []).map((category) => ({
    url: getSiteUrl(`/categories/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const brandRoutes = (brands || []).map((brand) => ({
    url: getSiteUrl(`/brands/${brand.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: getSiteUrl(`/blogs/${post.slug}`),
    lastModified: toDate(post.updatedAt || post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const productRoutes = (products || []).map((product) => ({
    url: getSiteUrl(getProductHref(product)),
    lastModified: toDate(product.updated_at || product.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
    images: getSitemapImageUrls(product),
  }));

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...blogRoutes, ...productRoutes];
}
