import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../../lib/auth/session";
import { addCustomerTicketReply } from "../../../../../lib/tickets-server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request, { params }) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const { id } = await params;
    const ticket = await addCustomerTicketReply(user.id, id, body?.message);
    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
