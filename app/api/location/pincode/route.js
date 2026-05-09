import { NextResponse } from "next/server";
import { getWukusyPincodeAvailability, normalizePostalCode } from "../../../../lib/wukusy-fulfillment";

export async function POST(request) {
  try {
    const body = await request.json();
    const postalCode = normalizePostalCode(body?.postalCode || "");

    if (!postalCode) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit pincode." },
        { status: 400 }
      );
    }

    const availability = getWukusyPincodeAvailability(postalCode);
    return NextResponse.json(availability);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to verify pincode." },
      { status: 400 }
    );
  }
}
