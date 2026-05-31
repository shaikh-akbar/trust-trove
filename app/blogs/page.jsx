import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BLOGS_PER_PAGE, getSortedBlogPosts } from "../../lib/content";
import { buildMetadata } from "../../lib/seo";

function parsePageValue(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw || "1", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildPageHref(pageNumber) {
  return pageNumber > 1 ? `/blogs?page=${pageNumber}` : "/blogs";
}

function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  } else if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  } else {
    pages.add(currentPage - 1);
    pages.add(currentPage + 1);
  }

  const sortedPages = Array.from(pages)
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((left, right) => left - right);
  const items = [];

  for (let index = 0; index < sortedPages.length; index += 1) {
    const pageNumber = sortedPages[index];
    const previousPage = sortedPages[index - 1];

    if (previousPage && pageNumber - previousPage > 1) {
      items.push("ellipsis");
    }

    items.push(pageNumber);
  }

  return items;
}

function buildMobilePaginationItems(currentPage, totalPages) {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage === 1) {
    pages.add(2);
    pages.add(3);
  } else if (currentPage === totalPages) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  } else {
    pages.add(currentPage + 1);
  }

  const sortedPages = Array.from(pages)
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((left, right) => left - right);
  const items = [];

  for (let index = 0; index < sortedPages.length; index += 1) {
    const pageNumber = sortedPages[index];
    const previousPage = sortedPages[index - 1];

    if (previousPage && pageNumber - previousPage > 1) {
      items.push("ellipsis");
    }

    items.push(pageNumber);
  }

  return items;
}

export async function generateMetadata({ searchParams }) {
  const page = parsePageValue((await searchParams).page);
  const pageSuffix = page > 1 ? ` - Page ${page}` : "";

  return buildMetadata({
    title: `Blogs${pageSuffix}`,
    path: buildPageHref(page),
    description: "Read GoModexa blog articles covering style, gifting, store trust, and smarter shopping decisions.",
    keywords: ["GoModexa blogs", "shopping blog", "style journal", "gift guide"],
  });
}

export default async function BlogsPage({ searchParams }) {
  const posts = getSortedBlogPosts();
  const currentPage = parsePageValue((await searchParams).page);
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOGS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * BLOGS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, startIndex + BLOGS_PER_PAGE);
  const paginationItems = buildPaginationItems(safePage, totalPages);
  const mobilePaginationItems = buildMobilePaginationItems(safePage, totalPages);

  return (
    <div className="bg-[var(--surface-soft)]">
      <section className="border-b border-[var(--line)] bg-[var(--brand-navy)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-[var(--brand-gold)]">GoModexa Journal</p>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--surface-cream)] sm:text-5xl">
            Editorial content that gives the store more depth and discoverability.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            Browse practical articles around gifting, lifestyle shopping, trust, and everyday product discovery.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)] transition hover:-translate-y-1"
            >
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                <span>{post.category}</span>
                <span>{post.readingTime}</span>
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">{post.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{post.excerpt}</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Published {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <span className="mt-8 inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]">
                Read article <ArrowRight size={16} className="ml-2" />
              </span>
            </Link>
          ))}
        </div>

        {totalPages > 1 ? (
          <div className="mt-10 flex flex-col gap-4 rounded-[2rem] border border-[var(--line)] bg-white p-4 shadow-[0_24px_70px_-56px_rgba(20,29,96,0.22)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-center text-sm text-slate-500 sm:text-left">
              Page {safePage} of {totalPages}
            </p>
            <div className="flex items-center justify-center gap-2 sm:justify-end">
              {safePage > 1 ? (
                <Link
                  href={buildPageHref(safePage - 1)}
                  aria-label="Previous page"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--brand-navy)]/14 bg-[var(--surface-soft)] text-[var(--brand-navy)] transition hover:bg-white"
                >
                  <ArrowLeft size={16} />
                </Link>
              ) : null}
              <div className="flex items-center justify-center gap-2 sm:hidden">
                {mobilePaginationItems.map((item, index) => {
                  if (item === "ellipsis") {
                    return (
                      <span
                        key={`mobile-ellipsis-${index}`}
                        className="inline-flex min-w-7 items-center justify-center px-1 py-2 text-sm font-black text-slate-400"
                      >
                        ...
                      </span>
                    );
                  }

                  const isActive = item === safePage;

                  return (
                    <Link
                      key={`mobile-${item}`}
                      href={buildPageHref(item)}
                      className={`inline-flex min-w-11 items-center justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] transition ${
                        isActive
                          ? "bg-[var(--brand-navy)] text-white"
                          : "border border-[var(--brand-navy)]/14 bg-[var(--surface-soft)] text-[var(--brand-navy)] hover:bg-white"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item}
                    </Link>
                  );
                })}
              </div>
              <div className="hidden flex-wrap gap-3 sm:flex">
                {paginationItems.map((item, index) => {
                  if (item === "ellipsis") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="inline-flex min-w-11 items-center justify-center px-1 py-2 text-sm font-black text-slate-400"
                      >
                        ...
                      </span>
                    );
                  }

                  const isActive = item === safePage;

                  return (
                    <Link
                      key={item}
                      href={buildPageHref(item)}
                      className={`inline-flex min-w-11 items-center justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] transition ${
                        isActive
                          ? "bg-[var(--brand-navy)] text-white"
                          : "border border-[var(--brand-navy)]/14 bg-[var(--surface-soft)] text-[var(--brand-navy)] hover:bg-white"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item}
                    </Link>
                  );
                })}
              </div>
              {safePage < totalPages ? (
                <Link
                  href={buildPageHref(safePage + 1)}
                  aria-label="Next page"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--brand-navy)]/14 bg-[var(--surface-soft)] text-[var(--brand-navy)] transition hover:bg-white"
                >
                  <ArrowRight size={16} />
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

