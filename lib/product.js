import { supabase } from './supabase';
import { formatCategoryLabel, slugifyCategory } from './storefront';

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
  const priceSelling = toNumber(variant?.price_selling) ?? 0;
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
    slug: product?.slug || product?.handle || String(product?.id),
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

async function fetchProductsQuery() {
  return supabase
    .from('products')
    .select(
      `
        *,
        variants (*),
        product_images (*)
      `
    )
    .order('created_at', { ascending: false });
}

export async function getProducts() {
  const { data, error } = await fetchProductsQuery();

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data || [])
    .map(normalizeProduct)
    .filter((product) => product.title || product.price_selling);
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

  return normalizeProduct(data);
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

  const productMap = new Map((data || []).map((product) => [product.id, normalizeProduct(product)]));
  return normalizedIds.map((id) => productMap.get(id)).filter(Boolean);
}

export async function getNavbarSearchItems() {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, slug, category, product_type, main_image, status')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(120);

  if (error) {
    console.error('Error fetching navbar search items:', error);
    return [];
  }

  return (data || [])
    .filter((product) => product?.title)
    .map((product) => {
      const category = formatCategoryLabel(product.category || product.product_type);

      return {
        id: product.id,
        title: product.title,
        slug: product.slug || product.id,
        href: `/product/${product.id}`,
        image: product.main_image || '',
        category,
        categorySlug: slugifyCategory(category),
      };
    });
}
