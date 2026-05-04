import { ShopExperience } from "../components/store/StorefrontPages";
import { getProducts } from "../../lib/product";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Shop",
  path: "/shop",
  description: "Browse the full TrustTrove catalog with product search, price filtering, and modern collection browsing.",
  keywords: ["shop TrustTrove", "product filters", "search products online"],
});

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const products = await getProducts();
  const initialQuery = typeof params?.q === "string" ? params.q : "";

  return <ShopExperience products={products} initialQuery={initialQuery} />;
}
