import { NewArrivalsExperience } from "../components/store/StorefrontPages";
import Link from "next/link";
import { getProductsPage } from "../../lib/product";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "New Arrivals",
  path: "/new-arrivals",
  description: "Discover the newest products on TrustTrove through a more premium launch-focused shopping experience.",
  keywords: ["new arrivals", "latest products", "fresh drops TrustTrove"],
});

export default async function NewArrivalsPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page || 1));
  const { products, totalPages } = await getProductsPage({ page, pageSize: 60 });
  const initialQuery = typeof params?.q === "string" ? params.q : "";

  return (
    <>
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
