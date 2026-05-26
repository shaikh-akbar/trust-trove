import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getBlogPostsByCategory,
  getCategoryGuideCopy,
} from "../../../lib/content";
import {
  CategoryDetailExperience,
} from "../../components/store/StorefrontPages";
import { getCategorySummaries, getProductsPage } from "../../../lib/product";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildMetadata,
} from "../../../lib/seo";
import { getProductHref } from "../../../lib/product-route";

const CATALOG_PAGE_SIZE = 24;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = (await getCategorySummaries()).find((item) => item.slug === slug);

  if (!category) {
    return buildMetadata({
      title: "Category Not Found",
      path: `/categories/${slug}`,
      description: "The requested category was not found on GoModexa.",
    });
  }

  return buildMetadata({
    title: category.title,
    path: `/categories/${slug}`,
    description: `Browse ${category.title} products on GoModexa with cleaner collection design, stronger structure, and easier discovery.`,
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
    pageSize: CATALOG_PAGE_SIZE,
    categoryTitle: category.title,
  });
  const matchingPosts = getBlogPostsByCategory(category.title, { limit: 3 });
  const categoryGuide = getCategoryGuideCopy(category);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Categories", path: "/categories" },
              { name: category.title, path: `/categories/${slug}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageSchema({
              name: category.title,
              description:
                category.description ||
                `Browse ${category.title} products on GoModexa.`,
              path: `/categories/${slug}`,
              items: products.map((product) => ({
                name: product.title || product.name,
                url: getProductHref(product),
              })),
            })
          ),
        }}
      />
      <CategoryDetailExperience
        products={products}
        category={category}
        initialQuery={typeof currentSearchParams?.q === "string" ? currentSearchParams.q : ""}
      />
      <section className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-soft)] p-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Category SEO Copy
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--brand-navy)]">
                {categoryGuide.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {categoryGuide.intro}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {categoryGuide.body}
              </p>
            </div>
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_70px_-56px_rgba(20,29,96,0.22)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Related Guides
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--brand-navy)]">
                Read before you buy
              </h2>
              <div className="mt-5 grid gap-3">
                {matchingPosts.length > 0 ? (
                  matchingPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blogs/${post.slug}`}
                      className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 transition hover:border-[var(--brand-navy)]/20 hover:bg-white"
                    >
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                        {post.category}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--brand-navy)]">
                        {post.title}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-6 text-sm leading-7 text-slate-500">
                    Matching buying guides for this category will appear here as the blog library grows.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
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

