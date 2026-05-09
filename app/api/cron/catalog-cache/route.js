import { warmCatalogCache } from "../../../../lib/product";
import { isCatalogCacheEnabled } from "../../../../lib/catalog-cache";

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

export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCatalogCacheEnabled()) {
    return Response.json(
      {
        error: "Supabase catalog cache is not configured.",
        expectedEnv: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET"],
      },
      { status: 500 }
    );
  }

  const result = await warmCatalogCache();
  return Response.json({ ok: true, ...result });
}
