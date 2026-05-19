import { notFound } from "next/navigation";
import Link from "next/link";
import { BrandDetailExperience } from "../../components/store/StorefrontPages";
import { getBrandSummaries, getProductsPage } from "../../../lib/product";
import { buildMetadata } from "../../../lib/seo";

const CATALOG_PAGE_SIZE = 24;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const brand = (await getBrandSummaries()).find((item) => item.slug === slug);

  if (!brand) {
    return buildMetadata({
      title: "Brand Not Found",
      path: `/brands/${slug}`,
      description: "The requested brand was not found on GoModexa.",
    });
  }

  return buildMetadata({
    title: brand.title,
    path: `/brands/${slug}`,
    description: `Browse ${brand.title} products on GoModexa with a cleaner brand page and easier product discovery.`,
    keywords: [brand.title, `${brand.title} online`, `${brand.title} products`],
  });
}

export default async function BrandDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const currentSearchParams = await searchParams;
  const page = Math.max(1, Number(currentSearchParams?.page || 1));
  const brands = await getBrandSummaries();
  const brand = brands.find((item) => item.slug === slug);

  if (!brand) {
    notFound();
  }

  const { products, totalPages } = await getProductsPage({
    page,
    pageSize: CATALOG_PAGE_SIZE,
    brandTitle: brand.title,
  });

  return (
    <>
      <BrandDetailExperience
        products={products}
        brand={brand}
        initialQuery={typeof currentSearchParams?.q === "string" ? currentSearchParams.q : ""}
      />
      {totalPages > 1 ? (
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-14 pt-4 sm:px-6 lg:px-8">
          {page > 1 ? (
            <Link
              href={`/brands/${slug}?page=${page - 1}`}
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
              href={`/brands/${slug}?page=${page + 1}`}
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

