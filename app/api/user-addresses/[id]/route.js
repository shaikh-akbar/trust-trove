import { NextResponse } from "next/server";
import { deleteUserAddress, updateUserAddress } from "../../../../lib/checkout-server";
import { getSessionUser } from "../../../../lib/auth/session";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(request, { params }) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const address = await updateUserAddress(user.id, id, body);
    return NextResponse.json({ address });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const user = await getSessionUser();

  if (!user) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    await deleteUserAddress(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
