import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../lib/admin-server";
import {
  ADMIN_PRODUCTS_PAGE_SIZE,
  getAdminProductsPage,
} from "../../../../lib/product-admin";

export async function GET(request) {
  await requireAdminUser();

  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || ADMIN_PRODUCTS_PAGE_SIZE);
    const search = searchParams.get("q") || "";
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "all";

    const result = await getAdminProductsPage({
      page,
      pageSize,
      search,
      status,
      category,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
