import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getRazorpayAuthHeader() {
  const keyId = getRequiredEnv("RAZORPAY_KEY_ID");
  const keySecret = getRequiredEnv("RAZORPAY_KEY_SECRET");
  const token = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${token}`;
}

export function getRazorpayCheckoutKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || getRequiredEnv("RAZORPAY_KEY_ID");
}

function secureCompare(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

export async function createRazorpayOrder({ amount, receipt, notes = {}, currency = "INR" }) {
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: getRazorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      notes,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.description || data?.error?.reason || "Failed to create Razorpay order.");
  }

  return data;
}

export async function fetchRazorpayPayment(paymentId) {
  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: getRazorpayAuthHeader(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.description || "Failed to fetch Razorpay payment.");
  }

  return data;
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const keySecret = getRequiredEnv("RAZORPAY_KEY_SECRET");
  const generatedSignature = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return secureCompare(generatedSignature, signature);
}

export function verifyRazorpayWebhookSignature({ payload, signature }) {
  const webhookSecret = getRequiredEnv("RAZORPAY_WEBHOOK_SECRET");
  const generatedSignature = createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  return secureCompare(generatedSignature, signature);
}
