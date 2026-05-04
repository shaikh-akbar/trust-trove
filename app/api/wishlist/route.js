import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/auth/session";
import {
  addWishlistProductForUser,
  getWishlistProductIdsForUser,
  removeWishlistProductForUser,
} from "../../../lib/product-social-server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  try {
    const productIds = await getWishlistProductIdsForUser(user.id);
    return NextResponse.json({ productIds });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  const body = await request.json();

  try {
    const productIds = await addWishlistProductForUser(user.id, body?.productId);
    return NextResponse.json({ productIds });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  try {
    const productIds = await removeWishlistProductForUser(user.id, productId);
    return NextResponse.json({ productIds });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
