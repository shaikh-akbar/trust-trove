import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../lib/admin-server";
import { clearCatalogCache } from "../../../../../lib/catalog-cache";
import { updateAdminProduct } from "../../../../../lib/product-admin";

export async function PATCH(request, { params }) {
  await requireAdminUser();

  try {
    const body = await request.json();
    const routeParams = await params;
    const product = await updateAdminProduct(routeParams.id, body);
    await clearCatalogCache();
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
