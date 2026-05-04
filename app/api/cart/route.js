import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/auth/session";
import {
  addCartItemForUser,
  clearCartForUser,
  getCartSnapshotForUser,
  mergeGuestCartForUser,
  removeCartItemForUser,
  updateCartItemQuantityForUser,
} from "../../../lib/cart-server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  try {
    const snapshot = await getCartSnapshotForUser(user.id);
    return NextResponse.json(snapshot);
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
    if (body?.action === "sync") {
      const snapshot = await mergeGuestCartForUser(user.id, body.items);
      return NextResponse.json(snapshot);
    }

    const snapshot = await addCartItemForUser(user.id, body);
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  const body = await request.json();

  try {
    const snapshot = await updateCartItemQuantityForUser(user.id, body.cartItemId, body.quantity);
    return NextResponse.json(snapshot);
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
  const mode = searchParams.get("mode");
  const cartItemId = searchParams.get("cartItemId");

  try {
    const snapshot =
      mode === "clear"
        ? await clearCartForUser(user.id)
        : await removeCartItemForUser(user.id, cartItemId);

    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
