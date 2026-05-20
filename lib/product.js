import { cache } from 'react';
import { supabase } from './supabase';
import { getProductHref, getProductSlug } from './product-route';
import { buildCatalogCacheKey, CATALOG_CACHE_TTL_SECONDS, withCatalogCache } from './catalog-cache';
import { getApprovedCustomerReviews } from './product-social-server';
import { resolveEffectiveSellingPrice } from './supplier-pricing';
import {
  buildBrandSummary,
  buildCategorySummary,
  formatCategoryLabel,
  slugifyCategory,
} from './storefront';

function toNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.-]/g, '');
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function stripHtml(value) {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function sortImages(images) {
  return [...(images || [])].sort((a, b) => {
    const aPosition = Number(a?.position || 0);
    const bPosition = Number(b?.position || 0);
    return aPosition - bPosition;
  });
}

function sortVariants(variants) {
  return [...(variants || [])].sort((a, b) => {
    const aDefault = a?.is_default ? 0 : 1;
    const bDefault = b?.is_default ? 0 : 1;

    if (aDefault !== bDefault) {
      return aDefault - bDefault;
    }

    return String(a?.sku || '').localeCompare(String(b?.sku || ''));
  });
}

function computeDiscountPercent(priceSelling, priceCompare) {
  if (!priceCompare || priceCompare <= priceSelling) {
    return 0;
  }

  return Math.round(((priceCompare - priceSelling) / priceCompare) * 100);
}

function normalizeVariant(variant) {
  const priceSelling = resolveEffectiveSellingPrice({
    priceSelling: toNumber(variant?.price_selling) ?? 0,
    costPrice: toNumber(variant?.cost_price) ?? 0,
    gstPercent: toNumber(variant?.gst_percent) ?? 0,
    weightGrams: Number(variant?.weight_grams || 0),
  });
  const priceCompare = toNumber(variant?.price_compare) ?? null;
  const costPrice = toNumber(variant?.cost_price) ?? null;

  return {
    ...variant,
    price_selling: priceSelling,
    price_compare: priceCompare,
    cost_price: costPrice,
    inventory_quantity: Number(variant?.inventory_quantity || 0),
    weight_grams: Number(variant?.weight_grams || 0),
    discount_percent:
      toNumber(variant?.discount_percent) ?? computeDiscountPercent(priceSelling, priceCompare),
  };
}

function normalizeImage(image, productTitle) {
  return {
    ...image,
    alt: image?.alt_text || productTitle || 'Product image',
  };
}

function normalizeProduct(product) {
  const sortedVariants = sortVariants(product?.variants).map(normalizeVariant);
  const sortedImages = sortImages(product?.product_images).map((image) =>
    normalizeImage(image, product?.title)
  );
  const primaryVariant = sortedVariants[0] || null;
  const mainImage = product?.main_image || sortedImages[0]?.src || '';
  const shortDescription =
    product?.short_description ||
    stripHtml(product?.description).slice(0, 220) ||
    'Freshly added to the latest drops collection.';

  return {
    ...product,
    name: product?.title || 'Untitled Product',
    slug: getProductSlug(product) || String(product?.id || ''),
    short_description: shortDescription,
    tags: normalizeTags(product?.tags),
    main_image: mainImage,
    image_url: mainImage,
    product_images: sortedImages,
    variants: sortedVariants,
    price_selling: primaryVariant?.price_selling ?? 0,
    price_compare: primaryVariant?.price_compare ?? null,
    inventory_quantity:
      sortedVariants.reduce((total, variant) => total + Number(variant?.inventory_quantity || 0), 0),
    discount_percent:
      primaryVariant?.discount_percent ??
      computeDiscountPercent(primaryVariant?.price_selling ?? 0, primaryVariant?.price_compare ?? null),
    status: product?.status || 'active',
    is_featured: Boolean(product?.is_featured),
    is_cod_available: product?.is_cod_available ?? true,
    shipping_charge: toNumber(product?.shipping_charge) ?? 0,
    cod_charge: toNumber(product?.cod_charge) ?? 0,
    platform_fee: toNumber(product?.platform_fee) ?? 0,
    convenience_fee: toNumber(product?.convenience_fee) ?? 0,
  };
}

function isVisibleProduct(product) {
  return Boolean(product?.status === 'active' && Number(product?.inventory_quantity || 0) > 0);
}

function escapeFilterValue(value) {
  return `"${String(value || '').replace(/"/g, '\\"')}"`;
}

function applyCollectionFilters(query, { categoryTitle = null, brandTitle = null } = {}) {
  if (categoryTitle) {
    const escapedCategory = escapeFilterValue(categoryTitle);
    return query.or(`category.eq.${escapedCategory},product_type.eq.${escapedCategory}`);
  }

  if (brandTitle) {
    const escapedBrand = escapeFilterValue(brandTitle);
    return query.or(`brand.eq.${escapedBrand},vendor.eq.${escapedBrand}`);
  }

  return query;
}

async function fetchVariantsForProductIds(productIds) {
  const chunkSize = 500;
  const collectedVariants = [];

  for (let index = 0; index < productIds.length; index += chunkSize) {
    const chunk = productIds.slice(index, index + chunkSize);
    const { data, error } = await supabase
      .from('variants')
      .select(
        `
          id,
          product_id,
          sku,
          option1_name,
          option1_value,
          price_selling,
          price_compare,
          cost_price,
          gst_percent,
          inventory_quantity,
          weight_grams,
          is_default,
          status
        `
      )
      .in('product_id', chunk)
      .eq('status', 'active')
      .order('is_default', { ascending: false })
      .order('sku', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    collectedVariants.push(...(data || []));
  }

  return { data: collectedVariants, error: null };
}

function hydrateProducts(products, variants) {
  const variantsByProductId = new Map();

  for (const variant of variants || []) {
    const productId = variant.product_id;
    const current = variantsByProductId.get(productId) || [];
    current.push(variant);
    variantsByProductId.set(productId, current);
  }

  return products
    .map((product) =>
      normalizeProduct({
        ...product,
        variants: variantsByProductId.get(product.id) || [],
        product_images: [],
      })
    )
    .filter((product) => (product.title || product.price_selling) && isVisibleProduct(product));
}

async function fetchProductsPageLive({ page = 1, pageSize = 60, categoryTitle = null, brandTitle = null } = {}) {
  const safePage = Math.max(1, Number(page || 1));
  const safePageSize = Math.max(1, Math.min(120, Number(pageSize || 60)));
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const { data, error, count } = await applyCollectionFilters(
    supabase
      .from('products')
      .select(
        `
          id,
          handle,
          slug,
          title,
          description,
          short_description,
          vendor,
          brand,
          category,
          product_type,
          tags,
          main_image,
          status,
          is_featured,
          is_cod_available,
          shipping_charge,
          cod_charge,
          platform_fee,
          convenience_fee,
          created_at
        `,
        { count: 'exact' }
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    { categoryTitle, brandTitle }
  ).range(from, to);

  if (error) {
    console.error('Error fetching product page:', error);
    return {
      products: [],
      total: 0,
      totalPages: 0,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  const uniqueProducts = Array.from(new Map((data || []).map((product) => [product.id, product])).values());
  const productIds = uniqueProducts.map((product) => product.id).filter(Boolean);
  const { data: variants, error: variantsError } = await fetchVariantsForProductIds(productIds);

  if (variantsError) {
    console.error('Error fetching product page variants:', variantsError);
    return {
      products: [],
      total: 0,
      totalPages: 0,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  const total = Number(count || 0);
  return {
    products: hydrateProducts(uniqueProducts, variants),
    total,
    totalPages: total > 0 ? Math.ceil(total / safePageSize) : 0,
    page: safePage,
    pageSize: safePageSize,
  };
}

export async function getProductsPage({ page = 1, pageSize = 60, categoryTitle = null, brandTitle = null, forceFresh = false } = {}) {
  const safePage = Math.max(1, Number(page || 1));
  const safePageSize = Math.max(1, Math.min(120, Number(pageSize || 60)));
  const cacheKey = buildCatalogCacheKey('products-page', {
    brand: brandTitle || 'all',
    category: categoryTitle || 'all',
    page: safePage,
    pageSize: safePageSize,
  });

  return withCatalogCache(
    cacheKey,
    () => fetchProductsPageLive({ page: safePage, pageSize: safePageSize, categoryTitle, brandTitle }),
    { ttlSeconds: CATALOG_CACHE_TTL_SECONDS, forceFresh }
  ).then((result) => {
    const products = Array.isArray(result?.products) ? result.products : [];
    const total = Number(result?.total || 0);

    // Recover from stale/partial cache entries that were written during a timeout
    // or transient Supabase failure. If total products exist but this page is empty,
    // or if the unfiltered first page is unexpectedly blank, fetch fresh data once.
    const shouldRetryFresh =
      !forceFresh &&
      (
        (safePage === 1 && !categoryTitle && !brandTitle && products.length === 0) ||
        (total > 0 && products.length === 0)
      );

    if (!shouldRetryFresh) {
      return result;
    }

    return getProductsPage({
      page: safePage,
      pageSize: safePageSize,
      categoryTitle,
      brandTitle,
      forceFresh: true,
    });
  });
}

export async function getProducts(options = {}) {
  const result = await getProductsPage(options);
  return result.products;
}

export async function getFeaturedProducts({ limit = 10, forceFresh = false } = {}) {
  const safeLimit = Math.max(1, Math.min(24, Number(limit || 10)));
  const cacheKey = buildCatalogCacheKey("featured-products", {
    limit: safeLimit,
  });

  const featuredProducts = await withCatalogCache(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
            id,
            handle,
            slug,
            title,
            description,
            short_description,
            vendor,
            brand,
            category,
            product_type,
            tags,
            main_image,
            status,
            is_featured,
            is_cod_available,
            shipping_charge,
            cod_charge,
            platform_fee,
            convenience_fee,
            created_at
          `
        )
        .eq("status", "active")
        .eq("is_featured", true)
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(safeLimit);

      if (error) {
        console.error("Error fetching featured products:", error);
        return [];
      }

      const uniqueProducts = Array.from(new Map((data || []).map((product) => [product.id, product])).values());
      const productIds = uniqueProducts.map((product) => product.id).filter(Boolean);
      const { data: variants, error: variantsError } = await fetchVariantsForProductIds(productIds);

      if (variantsError) {
        console.error("Error fetching featured product variants:", variantsError);
        return [];
      }

      return hydrateProducts(uniqueProducts, variants);
    },
    { ttlSeconds: CATALOG_CACHE_TTL_SECONDS, forceFresh }
  );

  if (!forceFresh && (!Array.isArray(featuredProducts) || featuredProducts.length === 0)) {
    return getFeaturedProducts({ limit: safeLimit, forceFresh: true });
  }

  return featuredProducts.filter(isVisibleProduct);
}

const getCachedCategorySummaries = cache(async function fetchCategorySummaries() {
  const PAGE_SIZE = 1000;
  const collected = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('products')
      .select('id, category, product_type, main_image, short_description, description')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching category summaries:', error);
      return [];
    }

    const pageItems = data || [];
    collected.push(
      ...pageItems.map((product) => ({
        ...product,
        image_url: product.main_image || '',
      }))
    );

    if (pageItems.length < PAGE_SIZE) {
      break;
    }
  }

  return buildCategorySummary(collected);
});

const getCachedBrandSummaries = cache(async function fetchBrandSummaries() {
  const PAGE_SIZE = 1000;
  const collected = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('products')
      .select('id, brand, vendor, main_image, short_description, description')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching brand summaries:', error);
      return [];
    }

    const pageItems = data || [];
    collected.push(
      ...pageItems.map((product) => ({
        ...product,
        image_url: product.main_image || '',
      }))
    );

    if (pageItems.length < PAGE_SIZE) {
      break;
    }
  }

  return buildBrandSummary(collected);
});

export async function getCategorySummaries({ forceFresh = false } = {}) {
  const categories = await withCatalogCache(
    buildCatalogCacheKey('category-summaries'),
    () => getCachedCategorySummaries(),
    { ttlSeconds: CATALOG_CACHE_TTL_SECONDS, forceFresh }
  );

  if (!forceFresh && (!Array.isArray(categories) || categories.length === 0)) {
    return getCategorySummaries({ forceFresh: true });
  }

  return categories;
}

export async function getBrandSummaries({ forceFresh = false } = {}) {
  const brands = await withCatalogCache(
    buildCatalogCacheKey('brand-summaries'),
    () => getCachedBrandSummaries(),
    { ttlSeconds: CATALOG_CACHE_TTL_SECONDS, forceFresh }
  );

  if (!forceFresh && (!Array.isArray(brands) || brands.length === 0)) {
    return getBrandSummaries({ forceFresh: true });
  }

  return brands;
}

export async function getFeaturedCategoryTabs({
  categories = null,
  categoryLimit = 12,
  productsPerCategory = 10,
  preloadedTabCount = 1,
  forceFresh = false,
} = {}) {
  const resolvedCategories = categories || (await getCategorySummaries({ forceFresh }));
  const cacheKey = buildCatalogCacheKey('featured-category-tabs', {
    categoryLimit: categoryLimit ?? 'all',
    preloadedTabCount,
    productsPerCategory,
  });

  const tabs = await withCatalogCache(
    cacheKey,
    async () => {
      const selectedCategories =
        typeof categoryLimit === 'number' && categoryLimit > 0
          ? resolvedCategories.slice(0, categoryLimit)
          : resolvedCategories;
      const preloadCount = Math.max(0, Math.min(preloadedTabCount, selectedCategories.length));
      const preloadedCategories = selectedCategories.slice(0, preloadCount);
      const categoryPages = await Promise.all(
        preloadedCategories.map((category) =>
          getProductsPage({
            page: 1,
            pageSize: productsPerCategory,
            categoryTitle: category.title,
            forceFresh,
          })
        )
      );

      return selectedCategories.map((category, index) => ({
        id: category.slug,
        label: category.title,
        categoryTitle: category.title,
        count: category.count,
        products: index < preloadCount ? categoryPages[index]?.products || [] : [],
        initialPage: index < preloadCount ? 1 : 0,
      }));
    },
    { ttlSeconds: CATALOG_CACHE_TTL_SECONDS, forceFresh }
  );

  if (!forceFresh && resolvedCategories.length > 0 && (!Array.isArray(tabs) || tabs.length === 0)) {
    return getFeaturedCategoryTabs({
      categories: resolvedCategories,
      categoryLimit,
      productsPerCategory,
      preloadedTabCount,
      forceFresh: true,
    });
  }

  return tabs;
}

export async function getCategoriesPageData({ previewSize = 4, previewCategoryLimit = 6, forceFresh = false } = {}) {
  const categories = await getCategorySummaries({ forceFresh });
  const cacheKey = buildCatalogCacheKey('categories-page', {
    previewCategoryLimit,
    previewSize,
  });

  const pageData = await withCatalogCache(
    cacheKey,
    async () => {
      const previewCategories =
        typeof previewCategoryLimit === 'number' && previewCategoryLimit > 0
          ? categories.slice(0, previewCategoryLimit)
          : [];
      const previewPages = await Promise.all(
        previewCategories.map((category) =>
          getProductsPage({
            page: 1,
            pageSize: previewSize,
            categoryTitle: category.title,
            forceFresh,
          })
        )
      );

      return categories.map((category, index) => ({
        ...category,
        products: index < previewCategories.length ? previewPages[index]?.products || [] : [],
      }));
    },
    { ttlSeconds: CATALOG_CACHE_TTL_SECONDS, forceFresh }
  );

  if (!forceFresh && categories.length > 0 && (!Array.isArray(pageData) || pageData.length === 0)) {
    return getCategoriesPageData({ previewSize, previewCategoryLimit, forceFresh: true });
  }

  return pageData;
}

export async function getBrandsPageData({ previewSize = 4, previewBrandLimit = 6, forceFresh = false } = {}) {
  const brands = await getBrandSummaries({ forceFresh });
  const cacheKey = buildCatalogCacheKey('brands-page', {
    previewBrandLimit,
    previewSize,
  });

  const pageData = await withCatalogCache(
    cacheKey,
    async () => {
      const previewBrands =
        typeof previewBrandLimit === 'number' && previewBrandLimit > 0
          ? brands.slice(0, previewBrandLimit)
          : [];
      const previewPages = await Promise.all(
        previewBrands.map((brand) =>
          getProductsPage({
            page: 1,
            pageSize: previewSize,
            brandTitle: brand.title,
            forceFresh,
          })
        )
      );

      return brands.map((brand, index) => ({
        ...brand,
        products: index < previewBrands.length ? previewPages[index]?.products || [] : [],
      }));
    },
    { ttlSeconds: CATALOG_CACHE_TTL_SECONDS, forceFresh }
  );

  if (!forceFresh && brands.length > 0 && (!Array.isArray(pageData) || pageData.length === 0)) {
    return getBrandsPageData({ previewSize, previewBrandLimit, forceFresh: true });
  }

  return pageData;
}

export async function getHomePageData({
  categoryLimit = 12,
  brandLimit = 10,
  featuredProductLimit = 10,
  productsPerCategory = 10,
  preloadedTabCount = 1,
  reviewLimit = 6,
  forceFresh = false,
} = {}) {
  const cacheKey = buildCatalogCacheKey('home-page', {
    brandLimit,
    categoryLimit,
    featuredProductLimit,
    preloadedTabCount,
    productsPerCategory,
    reviewLimit,
  });

  const homeData = await withCatalogCache(
    cacheKey,
    async () => {
      const [brands, categories, featuredProducts, customerReviews] = await Promise.all([
        getBrandSummaries({ forceFresh }),
        getCategorySummaries({ forceFresh }),
        getFeaturedProducts({ limit: featuredProductLimit, forceFresh }),
        getApprovedCustomerReviews(reviewLimit, { forceFresh }),
      ]);
      const featuredTabs = await getFeaturedCategoryTabs({
        categories,
        categoryLimit,
        productsPerCategory,
        preloadedTabCount,
        forceFresh,
      });

      return {
        brands:
          typeof brandLimit === 'number' && brandLimit > 0 ? brands.slice(0, brandLimit) : brands,
        categories,
        featuredProducts,
        featuredTabs,
        customerReviews,
      };
    },
    { ttlSeconds: CATALOG_CACHE_TTL_SECONDS, forceFresh }
  );

  const hasBrands = Array.isArray(homeData?.brands) && homeData.brands.length > 0;
  const hasCategories = Array.isArray(homeData?.categories) && homeData.categories.length > 0;
  const hasFeaturedProducts = Array.isArray(homeData?.featuredProducts);
  const hasFeaturedTabs = Array.isArray(homeData?.featuredTabs) && homeData.featuredTabs.length > 0;

  if (!forceFresh && (!hasBrands || !hasCategories || !hasFeaturedTabs || !hasFeaturedProducts)) {
    return getHomePageData({
      brandLimit,
      categoryLimit,
      featuredProductLimit,
      productsPerCategory,
      preloadedTabCount,
      reviewLimit,
      forceFresh: true,
    });
  }

  return homeData;
}

export async function warmCatalogCache() {
  const brands = await getBrandSummaries({ forceFresh: true });
  const categories = await getCategorySummaries({ forceFresh: true });
  const topBrands = brands.slice(0, 8);
  const topCategories = categories.slice(0, 8);

  await Promise.all([
    getBrandSummaries({ forceFresh: true }),
    getCategorySummaries({ forceFresh: true }),
    getApprovedCustomerReviews(6, { forceFresh: true }),
    getFeaturedProducts({ forceFresh: true }),
    getFeaturedCategoryTabs({ categories, forceFresh: true }),
    getHomePageData({ forceFresh: true }),
    getBrandsPageData({ forceFresh: true }),
    getCategoriesPageData({ forceFresh: true }),
    getProductsPage({ page: 1, pageSize: 60, forceFresh: true }),
  ]);

  await Promise.all(
    topBrands.map((brand) =>
      getProductsPage({
        page: 1,
        pageSize: 60,
        brandTitle: brand.title,
        forceFresh: true,
      })
    )
  );

  await Promise.all(
    topCategories.map((category) =>
      getProductsPage({
        page: 1,
        pageSize: 60,
        categoryTitle: category.title,
        forceFresh: true,
      })
    )
  );

  return {
    warmedAt: new Date().toISOString(),
    brandCount: brands.length,
    categoryCount: categories.length,
    warmedBrandPages: topBrands.map((brand) => brand.title),
    warmedCategoryPages: topCategories.map((category) => category.title),
  };
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select(
      `
        *,
        variants (*),
        product_images (*)
      `
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error('Error fetching product by id:', error);
    }

    return null;
  }

  const normalizedProduct = normalizeProduct(data);
  return isVisibleProduct(normalizedProduct) ? normalizedProduct : null;
}

async function getProductByField(field, value) {
  const { data, error } = await supabase
    .from('products')
    .select(
      `
        *,
        variants (*),
        product_images (*)
      `
    )
    .eq(field, value)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error(`Error fetching product by ${field}:`, error);
    }

    return null;
  }

  const normalizedProduct = normalizeProduct(data);
  return isVisibleProduct(normalizedProduct) ? normalizedProduct : null;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || '')
  );
}

export async function getProductByIdentifier(identifier) {
  const normalizedIdentifier = String(identifier || '').trim();

  if (!normalizedIdentifier) {
    return null;
  }

  if (isUuid(normalizedIdentifier)) {
    const productById = await getProductById(normalizedIdentifier);

    if (productById) {
      return productById;
    }
  }

  const productBySlug = await getProductByField('slug', normalizedIdentifier);

  if (productBySlug) {
    return productBySlug;
  }

  return getProductByField('handle', normalizedIdentifier);
}

export async function getProductsByIds(ids = []) {
  const normalizedIds = Array.from(new Set((ids || []).filter(Boolean)));

  if (!normalizedIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select(
      `
        *,
        variants (*),
        product_images (*)
      `
    )
    .in('id', normalizedIds);

  if (error) {
    console.error('Error fetching products by ids:', error);
    return [];
  }

  const productMap = new Map(
    (data || [])
      .map((product) => normalizeProduct(product))
      .filter(isVisibleProduct)
      .map((product) => [product.id, product])
  );
  return normalizedIds.map((id) => productMap.get(id)).filter(Boolean);
}

export async function getNavbarSearchItems() {
  const PAGE_SIZE = 1000;
  const MAX_NAVBAR_SEARCH_ITEMS = 3000;
  const collectedProducts = [];

  for (let from = 0; from < MAX_NAVBAR_SEARCH_ITEMS; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('products')
      .select('id, title, slug, handle, category, product_type, main_image, status, vendor')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching navbar search items:', error);
      return [];
    }

    const pageItems = data || [];
    collectedProducts.push(...pageItems);

    if (pageItems.length < PAGE_SIZE) {
      break;
    }
  }

  return collectedProducts
    .filter((product) => product?.title)
    .map((product) => {
      const category = formatCategoryLabel(product.category || product.product_type);

      return {
        id: product.id,
        title: product.title,
        slug: getProductSlug(product),
        href: getProductHref(product),
        image: product.main_image || '',
        category,
        categorySlug: slugifyCategory(category),
        vendor: product.vendor || '',
        handle: product.handle || '',
      };
    });
}

export async function searchNavbarProducts(query, limit = 24) {
  const normalizedQuery = String(query || '').trim();

  if (!normalizedQuery) {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(50, Number(limit || 24)));
  const escaped = normalizedQuery.replace(/[%_,]/g, (char) => `\\${char}`);
  const pattern = `%${escaped}%`;
  const { data, error } = await supabase
    .from('products')
    .select('id, title, slug, handle, category, product_type, main_image, status, vendor')
    .eq('status', 'active')
    .or(
      [
        `title.ilike.${pattern}`,
        `category.ilike.${pattern}`,
        `product_type.ilike.${pattern}`,
        `vendor.ilike.${pattern}`,
        `handle.ilike.${pattern}`,
        `slug.ilike.${pattern}`,
      ].join(',')
    )
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error('Error searching navbar products:', error);
    return [];
  }

  return (data || [])
    .filter((product) => product?.title)
    .map((product) => {
      const category = formatCategoryLabel(product.category || product.product_type);

      return {
        id: product.id,
        title: product.title,
        slug: getProductSlug(product),
        href: getProductHref(product),
        image: product.main_image || '',
        category,
        categorySlug: slugifyCategory(category),
        vendor: product.vendor || '',
        handle: product.handle || '',
      };
    });
}
