export function getProductSlug(product) {
  if (!product) {
    return '';
  }

  return String(product.slug || product.handle || '').trim();
}

export function getProductHref(product) {
  const slug = getProductSlug(product);
  return slug ? `/product/${slug}` : '/shop';
}
