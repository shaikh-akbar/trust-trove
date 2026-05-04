import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/auth/session";
import { upsertCustomerReviewForUser } from "../../../lib/product-social-server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  const body = await request.json();

  try {
    await upsertCustomerReviewForUser(user, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
