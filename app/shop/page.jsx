import { ShopExperience } from "../components/store/StorefrontPages";
import { getCategorySummaries, getProductsPage } from "../../lib/product";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildCollectionMetadata,
  getPageNumber,
  getQueryValue,
} from "../../lib/seo";
import { getProductHref } from "../../lib/product-route";

const CATALOG_PAGE_SIZE = 24;

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const page = getPageNumber(params?.page);
  const query = getQueryValue(params?.q);
  const categorySlug = getQueryValue(params?.category);

  return buildCollectionMetadata({
    title: "Shop",
    path: "/shop",
    page,
    query,
    hasFilters: Boolean(categorySlug),
    description:
      "Browse the full GoModexa catalog with product search, price filtering, and modern collection browsing.",
    keywords: ["shop GoModexa", "product filters", "search products online"],
  });
}

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const page = getPageNumber(params?.page);
  const categorySlug = getQueryValue(params?.category);
  const categories = await getCategorySummaries();
  const activeCategory =
    categories.find((category) => category.slug === categorySlug) || null;
  const { products, totalPages } = await getProductsPage({
    page,
    pageSize: CATALOG_PAGE_SIZE,
    categoryTitle: activeCategory?.title || null,
  });
  const initialQuery = getQueryValue(params?.q);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Shop", path: "/shop" },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageSchema({
              name: "Shop",
              description:
                "Browse the full GoModexa catalog with product search and collection discovery.",
              path: "/shop",
              items: products.map((product) => ({
                name: product.title || product.name,
                url: getProductHref(product),
              })),
            })
          ),
        }}
      />
      <ShopExperience
        products={products}
        categories={categories}
        initialQuery={initialQuery}
        activeCategorySlug={activeCategory?.slug || ""}
        activeCategoryTitle={activeCategory?.title || ""}
        currentPage={page}
        totalPages={totalPages}
      />
    </>
  );
}

