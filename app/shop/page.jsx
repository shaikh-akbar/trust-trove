import { ShopExperience } from "../components/store/StorefrontPages";
import Link from "next/link";
import { getCategorySummaries, getProductsPage } from "../../lib/product";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildMetadata,
} from "../../lib/seo";
import { getProductHref } from "../../lib/product-route";

const CATALOG_PAGE_SIZE = 24;

export const metadata = buildMetadata({
  title: "Shop",
  path: "/shop",
  description: "Browse the full GoModexa catalog with product search, price filtering, and modern collection browsing.",
  keywords: ["shop GoModexa", "product filters", "search products online"],
});

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page || 1));
  const [{ products, totalPages }, categories] = await Promise.all([
    getProductsPage({ page, pageSize: CATALOG_PAGE_SIZE }),
    getCategorySummaries(),
  ]);
  const initialQuery = typeof params?.q === "string" ? params.q : "";

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
      <ShopExperience products={products} categories={categories} initialQuery={initialQuery} />
      {totalPages > 1 ? (
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-14 pt-4 sm:px-6 lg:px-8">
          {page > 1 ? (
            <Link
              href={`/shop?page=${page - 1}`}
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
              href={`/shop?page=${page + 1}`}
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

