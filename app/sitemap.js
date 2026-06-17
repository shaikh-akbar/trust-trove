import { BLOG_POSTS, BLOGS_PER_PAGE } from "../lib/content";
import { getBestDealsChildPageDefinitions } from "../lib/product-deals";
import { getBrandSummaries, getCategorySummaries } from "../lib/product";
import { getProductHref } from "../lib/product-route";
import { getSupabaseAdmin } from "../lib/supabase-admin";
import { getSiteUrl, hasIndexableProductPageSignals } from "../lib/seo";

const STOREFRONT_SUPPLIER_NAMES = ["wukusy", "gomodexa"];
const CATALOG_PAGE_SIZE = 24;

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
  const [categories, brands, products, shopPage, newArrivalsPage] = await Promise.all([
    getCategorySummaries({ forceFresh: true }),
    getBrandSummaries({ forceFresh: true }),
    getAllIndexedProducts(),
    getProductsPage({ page: 1, pageSize: CATALOG_PAGE_SIZE }),
    getProductsPage({ page: 1, pageSize: CATALOG_PAGE_SIZE, newArrivalsOnly: true }),
  ]);
  const now = new Date();

  const staticRouteEntries = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/shop", priority: 0.95, changeFrequency: "daily" },
    { path: "/new-arrivals", priority: 0.9, changeFrequency: "daily" },
    { path: "/best-deals", priority: 0.9, changeFrequency: "daily" },
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
  const categoryPaginationRoutes = (categories || []).flatMap((category) => {
    const totalPages = Math.max(
      1,
      Math.ceil(Number(category?.count || 0) / CATALOG_PAGE_SIZE)
    );

    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => {
      const pageNumber = index + 2;

      return {
        url: getSiteUrl(`/categories/${category.slug}?page=${pageNumber}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.62,
      };
    });
  });

  const brandRoutes = (brands || []).map((brand) => ({
    url: getSiteUrl(`/brands/${brand.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));
  const brandPaginationRoutes = (brands || []).flatMap((brand) => {
    const totalPages = Math.max(
      1,
      Math.ceil(Number(brand?.count || 0) / CATALOG_PAGE_SIZE)
    );

    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => {
      const pageNumber = index + 2;

      return {
        url: getSiteUrl(`/brands/${brand.slug}?page=${pageNumber}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.58,
      };
    });
  });

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: getSiteUrl(`/blogs/${post.slug}`),
    lastModified: toDate(post.updatedAt || post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.65,
  }));
  const blogIndexPageCount = Math.max(1, Math.ceil(BLOG_POSTS.length / BLOGS_PER_PAGE));
  const latestBlogDate = BLOG_POSTS.reduce((latest, post) => {
    const currentDate = toDate(post.updatedAt || post.publishedAt);
    return currentDate.getTime() > latest.getTime() ? currentDate : latest;
  }, now);
  const blogIndexRoutes = Array.from({ length: blogIndexPageCount }, (_, index) => {
    const pageNumber = index + 1;
    return {
      url: getSiteUrl(pageNumber > 1 ? `/blogs?page=${pageNumber}` : "/blogs"),
      lastModified: latestBlogDate,
      changeFrequency: "weekly",
      priority: pageNumber === 1 ? 0.75 : 0.6,
    };
  });

  const bestDealsRoutes = getBestDealsChildPageDefinitions().map((deal) => ({
    url: getSiteUrl(deal.path),
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.78,
  }));
  const shopIndexPageCount = Math.max(1, Number(shopPage?.totalPages || 1));
  const shopPaginationRoutes = Array.from(
    { length: Math.max(0, shopIndexPageCount - 1) },
    (_, index) => {
      const pageNumber = index + 2;

      return {
        url: getSiteUrl(`/shop?page=${pageNumber}`),
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.7,
      };
    }
  );
  const newArrivalsPageCount = Math.max(1, Number(newArrivalsPage?.totalPages || 1));
  const newArrivalsPaginationRoutes = Array.from(
    { length: Math.max(0, newArrivalsPageCount - 1) },
    (_, index) => {
      const pageNumber = index + 2;

      return {
        url: getSiteUrl(`/new-arrivals?page=${pageNumber}`),
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.72,
      };
    }
  );

  const productRoutes = (products || []).map((product) => ({
    url: getSiteUrl(getProductHref(product)),
    lastModified: toDate(product.updated_at || product.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
    images: getSitemapImageUrls(product),
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...categoryPaginationRoutes,
    ...brandRoutes,
    ...brandPaginationRoutes,
    ...shopPaginationRoutes,
    ...blogIndexRoutes,
    ...blogRoutes,
    ...bestDealsRoutes,
    ...newArrivalsPaginationRoutes,
    ...productRoutes,
  ];
}
