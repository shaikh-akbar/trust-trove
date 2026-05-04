import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../lib/admin-server";
import { updateAdminTicket } from "../../../../../lib/tickets-server";

export async function PATCH(request, { params }) {
  await requireAdminUser();

  try {
    const body = await request.json();
    const { id } = await params;
    const ticket = await updateAdminTicket(id, body);
    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
