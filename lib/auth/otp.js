import "server-only";
import { createHash, randomInt } from "node:crypto";

const OTP_TTL_MINUTES = 10;

export function generateOtp() {
  return String(randomInt(100000, 1000000));
}

export function hashOtp(otp) {
  return createHash("sha256").update(otp).digest("hex");
}

export function getOtpExpiryIso() {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();
}

export function isOtpExpired(expiresAt) {
  return new Date(expiresAt).getTime() < Date.now();
}
