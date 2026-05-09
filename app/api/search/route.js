import { searchNavbarProducts } from "../../../lib/product";

export async function GET(request) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const limit = Number(request.nextUrl.searchParams.get("limit") || 24);
  const items = await searchNavbarProducts(query, limit);

  return Response.json({ items });
}
