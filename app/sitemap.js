import { BLOG_POSTS } from "../lib/content";
import { getBrandSummaries, getCategorySummaries, getProductsPage } from "../lib/product";
import { getSiteUrl } from "../lib/seo";

const PRODUCT_SITEMAP_PAGE_SIZE = 120;

function toDate(value) {
  const parsed = new Date(value || Date.now());
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function getAllIndexedProducts() {
  const collected = [];
  let page = 1;

  while (true) {
    const result = await getProductsPage({
      page,
      pageSize: PRODUCT_SITEMAP_PAGE_SIZE,
      forceFresh: true,
    });
    const pageProducts = Array.isArray(result?.products) ? result.products : [];

    if (!pageProducts.length) {
      break;
    }

    collected.push(...pageProducts);

    if (page >= Number(result?.totalPages || 0)) {
      break;
    }

    page += 1;
  }

  return collected;
}

export default async function sitemap() {
  const [categories, brands, products] = await Promise.all([
    getCategorySummaries({ forceFresh: true }),
    getBrandSummaries({ forceFresh: true }),
    getAllIndexedProducts(),
  ]);
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/shop", priority: 0.95, changeFrequency: "daily" },
    { path: "/new-arrivals", priority: 0.9, changeFrequency: "daily" },
    { path: "/categories", priority: 0.85, changeFrequency: "weekly" },
    { path: "/brands", priority: 0.8, changeFrequency: "weekly" },
    { path: "/blogs", priority: 0.75, changeFrequency: "weekly" },
    { path: "/about-us", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact-us", priority: 0.55, changeFrequency: "monthly" },
    { path: "/shipping-policy", priority: 0.45, changeFrequency: "monthly" },
    { path: "/cancellation-refund-policy", priority: 0.45, changeFrequency: "monthly" },
    { path: "/store-policies", priority: 0.45, changeFrequency: "monthly" },
    { path: "/terms-of-service", priority: 0.4, changeFrequency: "monthly" },
  ].map((entry) => ({
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
    lastModified: toDate(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const productRoutes = (products || []).map((product) => ({
    url: getSiteUrl(`/product/${product.slug || product.id}`),
    lastModified: toDate(product.updated_at || product.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
    images: product.main_image ? [product.main_image] : [],
  }));

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...blogRoutes, ...productRoutes];
}
