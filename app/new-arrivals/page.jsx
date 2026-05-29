import { NewArrivalsExperience } from "../components/store/StorefrontPages";
import Link from "next/link";
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
  const { products, totalPages } = await getProductsPage({ page, pageSize: CATALOG_PAGE_SIZE });
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
      <NewArrivalsExperience products={products} initialQuery={initialQuery} />
      {totalPages > 1 ? (
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-14 pt-4 sm:px-6 lg:px-8">
          {page > 1 ? (
            <Link
              href={`/new-arrivals?page=${page - 1}`}
              className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
            >
              Previous
            </Link>
          ) : (
            <span className="pointer-events-none rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Previous
            </span>
          )}
          <p className="text-sm font-semibold text-slate-500">
            Page {page} of {totalPages}
          </p>
          {page < totalPages ? (
            <Link
              href={`/new-arrivals?page=${page + 1}`}
              className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
            >
              Next
            </Link>
          ) : (
            <span className="pointer-events-none rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Next
            </span>
          )}
        </div>
      ) : null}
    </>
  );
}

