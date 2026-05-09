import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CategoryDetailExperience,
} from "../../components/store/StorefrontPages";
import { getCategorySummaries, getProductsPage } from "../../../lib/product";
import { buildMetadata } from "../../../lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = (await getCategorySummaries()).find((item) => item.slug === slug);

  if (!category) {
    return buildMetadata({
      title: "Category Not Found",
      path: `/categories/${slug}`,
      description: "The requested category was not found on TrustTrove.",
    });
  }

  return buildMetadata({
    title: category.title,
    path: `/categories/${slug}`,
    description: `Browse ${category.title} products on TrustTrove with cleaner collection design, stronger structure, and easier discovery.`,
    keywords: [category.title, `${category.title} online`, `${category.title} collection`],
  });
}

export default async function CategoryDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const currentSearchParams = await searchParams;
  const page = Math.max(1, Number(currentSearchParams?.page || 1));
  const categories = await getCategorySummaries();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const { products, totalPages } = await getProductsPage({
    page,
    pageSize: 60,
    categoryTitle: category.title,
  });

  return (
    <>
      <CategoryDetailExperience
        products={products}
        category={category}
        initialQuery={typeof currentSearchParams?.q === "string" ? currentSearchParams.q : ""}
      />
      {totalPages > 1 ? (
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-14 pt-4 sm:px-6 lg:px-8">
          {page > 1 ? (
            <Link
              href={`/categories/${slug}?page=${page - 1}`}
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
              href={`/categories/${slug}?page=${page + 1}`}
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
