import { BrandsExperience } from "../components/store/StorefrontPages";
import { getBrandsPageData } from "../../lib/product";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildMetadata,
} from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Brands",
  path: "/brands",
  description: "Explore GoModexa brands through cleaner label pages designed for easier discovery and paginated browsing.",
  keywords: ["GoModexa brands", "shop by brand", "brand pages India"],
});

export default async function BrandsPage() {
  const brands = await getBrandsPageData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Brands", path: "/brands" },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageSchema({
              name: "Brands",
              description:
                "Explore all GoModexa brands through dedicated brand collection pages.",
              path: "/brands",
              items: brands.map((brand) => ({
                name: brand.title,
                url: `/brands/${brand.slug}`,
              })),
            })
          ),
        }}
      />
      <BrandsExperience brands={brands} />
    </>
  );
}

