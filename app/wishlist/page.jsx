import { redirect } from "next/navigation";
import WishlistPageClient from "../components/wishlist/WishlistPageClient";
import { getSessionUser } from "../../lib/auth/session";
import { getWishlistProductIdsForUser } from "../../lib/product-social-server";
import { getProductsByIds } from "../../lib/product";

export const metadata = {
  title: "Wishlist | GoModexa",
  description: "View your saved GoModexa products and return to them anytime.",
};

export default async function WishlistPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin?redirectTo=/wishlist");
  }

  const wishlistProductIds = await getWishlistProductIdsForUser(user.id);
  const products = await getProductsByIds(wishlistProductIds);

  return <WishlistPageClient products={products} />;
}

