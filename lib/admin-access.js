import "server-only";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function getAdminEmails() {
  return String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isAdminEmail(email) {
  return getAdminEmails().includes(normalizeEmail(email));
}
