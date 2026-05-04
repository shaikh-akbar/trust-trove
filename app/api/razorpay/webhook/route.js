import { NextResponse } from "next/server";
import { handleRazorpayWebhook } from "../../../../lib/checkout-server";

export const runtime = "nodejs";

export async function POST(request) {
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Razorpay signature." }, { status: 400 });
  }

  try {
    const payload = await request.text();
    const result = await handleRazorpayWebhook({ payload, signature });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
