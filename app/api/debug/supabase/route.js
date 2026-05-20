import { supabase } from "../../../../lib/supabase";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";

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

function getProjectRef(value) {
  const url = String(value || "").trim();
  const match = url.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return match ? match[1] : null;
}

async function fetchProductCounts(client) {
  const [
    productsResult,
    activeProductsResult,
    variantsResult,
    activeVariantsResult,
    sampleProductsResult,
  ] = await Promise.all([
    client.from("products").select("*", { count: "exact", head: true }),
    client.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
    client.from("variants").select("*", { count: "exact", head: true }),
    client
      .from("variants")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .gt("inventory_quantity", 0),
    client
      .from("products")
      .select("id, title, status, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  return {
    totalProducts: Number(productsResult.count || 0),
    activeProducts: Number(activeProductsResult.count || 0),
    totalVariants: Number(variantsResult.count || 0),
    activeInStockVariants: Number(activeVariantsResult.count || 0),
    sampleProducts: sampleProductsResult.data || [],
    errors: [
      productsResult.error,
      activeProductsResult.error,
      variantsResult.error,
      activeVariantsResult.error,
      sampleProductsResult.error,
    ]
      .filter(Boolean)
      .map((error) => ({
        code: error.code || null,
        message: error.message || "Unknown error",
      })),
  };
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const publicAnonKeyPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceRoleKeyPresent = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const [anon, admin] = await Promise.all([
    fetchProductCounts(supabase),
    fetchProductCounts(getSupabaseAdmin()),
  ]);

  return Response.json({
    ok: true,
    environment: {
      publicSupabaseUrl: publicUrl,
      publicSupabaseProjectRef: getProjectRef(publicUrl),
      publicAnonKeyPresent,
      serviceRoleKeyPresent,
    },
    anon,
    admin,
    checkedAt: new Date().toISOString(),
  });
}
