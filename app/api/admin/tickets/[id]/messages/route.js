import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../../lib/admin-server";
import { addAdminTicketReply } from "../../../../../../lib/tickets-server";

export async function POST(request, { params }) {
  const adminUser = await requireAdminUser();

  try {
    const body = await request.json();
    const { id } = await params;
    const ticket = await addAdminTicketReply(adminUser.id, id, body?.message);
    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
