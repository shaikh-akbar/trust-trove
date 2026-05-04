import { CategoriesExperience } from "../components/store/StorefrontPages";
import { getProducts } from "../../lib/product";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Categories",
  path: "/categories",
  description: "Explore TrustTrove categories through cleaner collection pages designed for stronger discovery and SEO clarity.",
  keywords: ["TrustTrove categories", "shop by category", "collection pages India"],
});

export default async function CategoriesPage() {
  const products = await getProducts();

  return <CategoriesExperience products={products} />;
}
