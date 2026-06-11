import { syncWukusyAndWarmCache } from "../../../../lib/wukusy-sync";

export const dynamic = "force-dynamic";

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const querySecret = request.nextUrl.searchParams.get("secret") || "";

  return bearerToken === secret || querySecret === secret;
}

function parseBooleanParam(value, fallback = false) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function parseNumberParam(value, fallback = undefined) {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.WUKUSY_COOKIE) {
    return Response.json(
      {
        error: "Missing WUKUSY_COOKIE for authenticated Wukusy crawl.",
        expectedEnv: ["WUKUSY_COOKIE", "CRON_SECRET", "SUPABASE_SERVICE_ROLE_KEY"],
      },
      { status: 500 }
    );
  }

  try {
    const crawl = parseBooleanParam(request.nextUrl.searchParams.get("crawl"), true);
    const hideUnmatchedVariants = parseBooleanParam(
      request.nextUrl.searchParams.get("hideUnmatchedVariants"),
      false
    );
    const limit = parseNumberParam(request.nextUrl.searchParams.get("limit"), undefined);
    const delayMs = parseNumberParam(
      request.nextUrl.searchParams.get("delayMs"),
      parseNumberParam(process.env.WUKUSY_CRAWL_DELAY_MS, 150)
    );
    const marginAmount = parseNumberParam(
      request.nextUrl.searchParams.get("marginAmount"),
      parseNumberParam(process.env.WUKUSY_MARGIN_AMOUNT, undefined)
    );

    const result = await syncWukusyAndWarmCache({
      crawl,
      hideUnmatchedVariants,
      limit,
      delayMs,
      marginAmount,
    });

    return Response.json({
      ok: true,
      mode: crawl ? "crawl-list-card-sync" : "json-payload-sync",
      startedFrom: process.env.WUKUSY_START_URL || "https://wukusy.app/dropshiper/index",
      hideUnmatchedVariants,
      delayMs,
      marginAmount,
      ...result,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error?.message || "Wukusy stock sync failed.",
      },
      { status: 500 }
    );
  }
}
