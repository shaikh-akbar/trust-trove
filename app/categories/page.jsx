import { CategoriesExperience } from "../components/store/StorefrontPages";
import { getCategoriesPageData } from "../../lib/product";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildMetadata,
} from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Categories",
  path: "/categories",
  description: "Explore GoModexa categories through cleaner collection pages designed for stronger discovery and SEO clarity.",
  keywords: ["GoModexa categories", "shop by category", "collection pages India"],
});

export default async function CategoriesPage() {
  const categories = await getCategoriesPageData({
    previewSize: 12,
    previewCategoryLimit: 6,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Categories", path: "/categories" },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageSchema({
              name: "Categories",
              description:
                "Explore product categories on GoModexa through dedicated collection pages.",
              path: "/categories",
              items: categories.map((category) => ({
                name: category.title,
                url: `/categories/${category.slug}`,
              })),
            })
          ),
        }}
      />
      <CategoriesExperience categories={categories} />
    </>
  );
}

