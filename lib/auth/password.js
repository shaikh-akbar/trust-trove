import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

function toBuffer(value) {
  return Buffer.from(value, "hex");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, originalHash] = storedHash.split(":");
  const derivedHash = scryptSync(password, salt, KEY_LENGTH).toString("hex");

  if (originalHash.length !== derivedHash.length) {
    return false;
  }

  return timingSafeEqual(toBuffer(originalHash), toBuffer(derivedHash));
}
