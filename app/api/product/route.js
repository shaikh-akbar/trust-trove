import { getProductByIdentifier, getProductsPage } from "../../../lib/product";

export async function GET(request) {
  const identifier = request.nextUrl.searchParams.get("id") || "";

  if (!identifier.trim()) {
    return Response.json({ error: "Product id is required." }, { status: 400 });
  }

  const product = await getProductByIdentifier(identifier);

  if (!product) {
    return Response.json({ product: null, relatedProducts: [] }, { status: 404 });
  }

  const categoryTitle = product.category || product.product_type || null;
  const relatedPage = await getProductsPage({
    page: 1,
    pageSize: 8,
    categoryTitle,
  });
  const sameCategoryProducts = (relatedPage.products || []).filter((item) => item.id !== product.id);

  let relatedProducts = sameCategoryProducts.slice(0, 4);

  if (relatedProducts.length < 4) {
    const fallbackPage = await getProductsPage({
      page: 1,
      pageSize: 8,
    });
    const fallbackProducts = (fallbackPage.products || []).filter((item) => item.id !== product.id);
    relatedProducts = fallbackProducts.slice(0, 4);
  }

  return Response.json({
    product,
    relatedProducts,
  });
}
