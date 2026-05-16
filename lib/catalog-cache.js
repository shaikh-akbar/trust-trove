import "server-only";

import { getSupabaseAdmin } from "./supabase-admin";

const CACHE_TABLE = "catalog_cache";
const CATALOG_CACHE_PREFIX = "trusttrove:catalog:v2";
const DEFAULT_TTL_SECONDS = 60 * 60;

let cacheTableAvailable = true;

function getCacheClient() {
  return getSupabaseAdmin();
}

export function isCatalogCacheEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function buildCatalogCacheKey(scope, params = {}) {
  const suffix = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("|");

  return suffix ? `${CATALOG_CACHE_PREFIX}:${scope}:${suffix}` : `${CATALOG_CACHE_PREFIX}:${scope}`;
}

function getAgeSeconds(updatedAt) {
  if (!updatedAt) {
    return Number.POSITIVE_INFINITY;
  }

  const updatedTime = new Date(updatedAt).getTime();

  if (!Number.isFinite(updatedTime)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Math.floor((Date.now() - updatedTime) / 1000));
}

function isMissingTableError(error) {
  const message = String(error?.message || "").toLowerCase();
  return error?.code === "42P01" || message.includes("catalog_cache") || message.includes("does not exist");
}

export async function readCatalogCache(key, ttlSeconds = DEFAULT_TTL_SECONDS) {
  if (!isCatalogCacheEnabled() || !cacheTableAvailable) {
    return null;
  }

  try {
    const { data, error } = await getCacheClient()
      .from(CACHE_TABLE)
      .select("payload, updated_at")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) {
        cacheTableAvailable = false;
      }

      console.error("Catalog cache read failed:", error);
      return null;
    }

    if (!data?.payload) {
      return null;
    }

    return {
      value: data.payload,
      updatedAt: data.updated_at || null,
      isFresh: getAgeSeconds(data.updated_at) <= ttlSeconds,
    };
  } catch (error) {
    console.error("Catalog cache read failed:", error);
    return null;
  }
}

export async function writeCatalogCache(key, value) {
  if (!isCatalogCacheEnabled() || !cacheTableAvailable) {
    return value;
  }

  try {
    const { error } = await getCacheClient().from(CACHE_TABLE).upsert(
      {
        key,
        payload: value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      if (isMissingTableError(error)) {
        cacheTableAvailable = false;
      }

      console.error("Catalog cache write failed:", error);
    }
  } catch (error) {
    console.error("Catalog cache write failed:", error);
  }

  return value;
}

export async function clearCatalogCache(prefix = CATALOG_CACHE_PREFIX) {
  if (!isCatalogCacheEnabled() || !cacheTableAvailable) {
    return;
  }

  try {
    const { error } = await getCacheClient().from(CACHE_TABLE).delete().like("key", `${prefix}%`);

    if (error) {
      if (isMissingTableError(error)) {
        cacheTableAvailable = false;
      }

      console.error("Catalog cache clear failed:", error);
    }
  } catch (error) {
    console.error("Catalog cache clear failed:", error);
  }
}

export async function withCatalogCache(key, loader, { ttlSeconds = DEFAULT_TTL_SECONDS, forceFresh = false } = {}) {
  if (!forceFresh) {
    const cachedEntry = await readCatalogCache(key, ttlSeconds);

    if (cachedEntry?.value != null) {
      return cachedEntry.value;
    }
  }

  const freshValue = await loader();
  await writeCatalogCache(key, freshValue);
  return freshValue;
}

export { DEFAULT_TTL_SECONDS as CATALOG_CACHE_TTL_SECONDS };
