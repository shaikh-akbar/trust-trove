import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/auth/session";
import { createTicketForUser, getTicketsForUser } from "../../../lib/tickets-server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  try {
    const tickets = await getTicketsForUser(user.id);
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const ticket = await createTicketForUser(user.id, body);
    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
