import { NextResponse } from "next/server";
import { verifyCheckoutPayment } from "../../../../lib/checkout-server";
import { getSessionUser } from "../../../../lib/auth/session";

export async function POST(request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await verifyCheckoutPayment(user.id, body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
