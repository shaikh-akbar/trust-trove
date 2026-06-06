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

  return buildCollectionMetadata({
    title: "New Arrivals",
    path: "/new-arrivals",
    page,
    query,
    description:
      "Discover the newest products on GoModexa through a more premium launch-focused shopping experience.",
    keywords: ["new arrivals", "latest products", "fresh drops GoModexa"],
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

