import { NextResponse } from "next/server";
import { createCheckoutOrder } from "../../../../lib/checkout-server";
import { getSessionUser } from "../../../../lib/auth/session";

export async function POST(request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const order = await createCheckoutOrder(user.id, body);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
