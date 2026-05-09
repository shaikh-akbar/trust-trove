import { NextResponse } from "next/server";
import { getCheckoutSummary } from "../../../../lib/checkout-server";
import { getSessionUser } from "../../../../lib/auth/session";

export async function POST(request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const summary = await getCheckoutSummary(
      user.id,
      body?.couponCode || "",
      body?.paymentType || "online",
      body?.postalCode || ""
    );
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
