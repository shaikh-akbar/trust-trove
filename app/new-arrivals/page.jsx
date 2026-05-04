import { NewArrivalsExperience } from "../components/store/StorefrontPages";
import { getProducts } from "../../lib/product";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "New Arrivals",
  path: "/new-arrivals",
  description: "Discover the newest products on TrustTrove through a more premium launch-focused shopping experience.",
  keywords: ["new arrivals", "latest products", "fresh drops TrustTrove"],
});

export default async function NewArrivalsPage({ searchParams }) {
  const params = await searchParams;
  const products = await getProducts();
  const initialQuery = typeof params?.q === "string" ? params.q : "";

  return <NewArrivalsExperience products={products} initialQuery={initialQuery} />;
}
