import { NextResponse } from "next/server";
import { createUserAddress, getUserAddresses } from "../../../lib/checkout-server";
import { getSessionUser } from "../../../lib/auth/session";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  try {
    const addresses = await getUserAddresses(user.id);
    return NextResponse.json({ addresses });
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
    const address = await createUserAddress(user.id, body);
    return NextResponse.json({ address });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
