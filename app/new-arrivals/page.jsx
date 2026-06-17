import { NewArrivalsExperience } from "../components/store/StorefrontPages";
import { getProductsPage } from "../../lib/product";
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
  const pageSuffix = page > 1 ? ` | Page ${page}` : "";

  return buildCollectionMetadata({
    title: `New Arrivals Online In India${pageSuffix}`,
    path: "/new-arrivals",
    page,
    query,
    allowPaginatedIndex: true,
    description:
      page > 1
        ? `Browse page ${page} of the latest new arrivals on GoModexa, featuring fresh products across fashion, home, beauty, gadgets, and daily-use categories.`
        : "Discover the latest new arrivals on GoModexa across fashion, home, beauty, gadgets, and everyday lifestyle categories.",
    keywords: [
      "new arrivals online India",
      "latest products online India",
      "fresh drops GoModexa",
      "new lifestyle products India",
    ],
    category: "new arrivals",
  });
}

export default async function NewArrivalsPage({ searchParams }) {
  const params = await searchParams;
  const page = getPageNumber(params?.page);
  const { products, totalPages } = await getProductsPage({
    page,
    pageSize: CATALOG_PAGE_SIZE,
    newArrivalsOnly: true,
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
              { name: "New Arrivals", path: "/new-arrivals" },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageSchema({
              name: "New Arrivals",
              description:
                "Discover the newest products on GoModexa through a launch-focused shopping experience.",
              path: "/new-arrivals",
              page,
              totalPages,
              items: products.map((product) => ({
                name: product.title || product.name,
                url: getProductHref(product),
              })),
            })
          ),
        }}
      />
      <NewArrivalsExperience
        products={products}
        initialQuery={initialQuery}
        currentPage={page}
        totalPages={totalPages}
      />
    </>
  );
}

