import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../lib/admin-server";
import { updateOrderAdminStatus } from "../../../../../lib/order-admin";

export async function PATCH(request, { params }) {
  await requireAdminUser();

  try {
    const body = await request.json();
    const routeParams = await params;
    const order = await updateOrderAdminStatus(routeParams.id, body);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
