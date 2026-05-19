import { BrandsExperience } from "../components/store/StorefrontPages";
import { getBrandsPageData } from "../../lib/product";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Brands",
  path: "/brands",
  description: "Explore GoModexa brands through cleaner label pages designed for easier discovery and paginated browsing.",
  keywords: ["GoModexa brands", "shop by brand", "brand pages India"],
});

export default async function BrandsPage() {
  const brands = await getBrandsPageData();

  return <BrandsExperience brands={brands} />;
}

