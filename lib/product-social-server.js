import "server-only";
import { getSupabaseAdmin } from "./supabase-admin";
import { buildCatalogCacheKey, CATALOG_CACHE_TTL_SECONDS, withCatalogCache } from "./catalog-cache";

export async function getWishlistProductIdsForUser(userId) {
  if (!userId) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to read wishlist items:", error.message);
    return [];
  }

  return (data || []).map((row) => row.product_id).filter(Boolean);
}

export async function addWishlistProductForUser(userId, productId) {
  if (!userId) {
    throw new Error("User is required.");
  }

  if (!productId) {
    throw new Error("Product is required.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("wishlist_items")
    .upsert(
      {
        user_id: userId,
        product_id: productId,
      },
      {
        onConflict: "user_id,product_id",
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  return getWishlistProductIdsForUser(userId);
}

export async function removeWishlistProductForUser(userId, productId) {
  if (!userId) {
    throw new Error("User is required.");
  }

  if (!productId) {
    throw new Error("Product is required.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    throw new Error(error.message);
  }

  return getWishlistProductIdsForUser(userId);
}

async function fetchApprovedCustomerReviews(limit = 6) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("customer_reviews")
    .select("id, display_name, city, rating, headline, review_text, created_at")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Unable to read customer reviews:", error.message);
    return [];
  }

  return (data || []).map((review) => ({
    id: review.id,
    displayName: review.display_name,
    city: review.city || "",
    rating: Number(review.rating || 0),
    headline: review.headline || "",
    reviewText: review.review_text || "",
    createdAt: review.created_at,
  }));
}

export async function getApprovedCustomerReviews(limit = 6, { forceFresh = false } = {}) {
  const safeLimit = Math.max(1, Math.min(12, Number(limit || 6)));

  return withCatalogCache(
    buildCatalogCacheKey("customer-reviews", { limit: safeLimit }),
    () => fetchApprovedCustomerReviews(safeLimit),
    { ttlSeconds: CATALOG_CACHE_TTL_SECONDS, forceFresh }
  );
}

export async function upsertCustomerReviewForUser(user, payload = {}) {
  if (!user?.id) {
    throw new Error("User is required.");
  }

  const rating = Number(payload?.rating || 0);
  const reviewText = String(payload?.reviewText || "").trim();
  const headline = String(payload?.headline || "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Please choose a rating between 1 and 5.");
  }

  if (!reviewText) {
    throw new Error("Please enter your review.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("customer_reviews")
    .upsert(
      {
        user_id: user.id,
        display_name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        city: user.city || null,
        rating,
        headline: headline || null,
        review_text: reviewText,
        is_approved: true,
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
