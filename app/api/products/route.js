import { getFeaturedProductsPage, getProductsPage } from "../../../lib/product";

export async function GET(request) {
  const url = request.nextUrl;
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.max(1, Math.min(20, Number(url.searchParams.get("pageSize") || 10)));
  const categoryTitle = url.searchParams.get("category") || null;
  const isFeatured = url.searchParams.get("featured") === "true";

  const result = isFeatured
    ? await getFeaturedProductsPage({
        page,
        pageSize,
      })
    : await getProductsPage({
        page,
        pageSize,
        categoryTitle,
      });

  return Response.json(result);
}
