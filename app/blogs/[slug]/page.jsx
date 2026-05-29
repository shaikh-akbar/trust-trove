import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getBlogPostBySlug,
  getBlogPostsByCategory,
  getCategoryPathFromTitle,
} from "../../../lib/content";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildMetadata,
} from "../../../lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: "Blog Not Found",
      path: `/blogs/${slug}`,
      description: "The requested article could not be found.",
    });
  }

  return buildMetadata({
    title: post.seoTitle || post.title,
    path: post.canonicalPath || `/blogs/${slug}`,
    description: post.metaDescription || post.excerpt,
    image: post.image || "/assets/gomodexa.png",
    keywords: post.keywords || [post.category, post.title, "GoModexa article"],
  });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const canonicalPath = post.canonicalPath || `/blogs/${slug}`;
  const categoryPath = getCategoryPathFromTitle(
    post?.productSource?.categoryTitle || post.category
  );
  const productPath = post?.productSource?.productPath || null;
  const relatedPosts = getBlogPostsByCategory(
    post?.productSource?.categoryTitle || post.category,
    { excludeSlug: post.slug, limit: 3 }
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blogs", path: "/blogs" },
    { name: post.title, path: canonicalPath },
  ]);
  const articleSchema = buildArticleSchema({
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    path: canonicalPath,
    publishedAt: post.publishedAt,
    modifiedAt: post.updatedAt || post.publishedAt,
    image: post.image || "/assets/gomodexa.png",
    keywords: post.keywords || [],
    section: post.category,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {articleSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      ) : null}
      <div className="bg-[var(--surface-soft)]">
        <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/blogs" className="inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]">
            <ArrowLeft size={16} className="mr-2" /> Back to blogs
          </Link>
          <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.28em] text-slate-400">{post.category}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--brand-navy)] sm:text-5xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <p>{post.readingTime}</p>
            <p>
              Published{" "}
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
            {post.metaDescription || post.excerpt}
          </p>
          {post.productSource ? (
            <div className="mt-8 rounded-[2rem] border border-[var(--line)] bg-[var(--surface-soft)] p-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                Product Data Reference
              </p>
              <h2 className="mt-3 text-lg font-semibold text-[var(--brand-navy)]">
                {post.productSource.title}
              </h2>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <p>Category: {post.productSource.categoryTitle}</p>
                <p>SKU: {post.productSource.sku}</p>
                <p>Cost Price: Rs {post.productSource.costPrice}</p>
                <p>Stock: {post.productSource.stockQty}</p>
              </div>
            </div>
          ) : null}
          <div className="mt-10 space-y-6 rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)]">
            {post.body.map((paragraph) => (
              <p key={paragraph} className="text-base leading-8 text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>
          <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_70px_-56px_rgba(20,29,96,0.22)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Shop the topic
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--brand-navy)]">
                Continue into the catalog
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {productPath ? (
                  <Link
                    href={productPath}
                    className="inline-flex rounded-full border border-[var(--line)] bg-[var(--brand-navy)] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white"
                  >
                    View this product
                  </Link>
                ) : null}
                <Link
                  href={categoryPath}
                  className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
                >
                  Explore {post?.productSource?.categoryTitle || post.category}
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
                >
                  Browse all products
                </Link>
              </div>
            </div>
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_70px_-56px_rgba(20,29,96,0.22)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                More guides
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--brand-navy)]">
                Related reading
              </h2>
              <div className="mt-5 grid gap-3">
                {relatedPosts.length > 0 ? (
                  relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.slug}
                      href={`/blogs/${relatedPost.slug}`}
                      className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 transition hover:border-[var(--brand-navy)]/20 hover:bg-white"
                    >
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                        {relatedPost.category}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--brand-navy)]">
                        {relatedPost.title}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-6 text-sm leading-7 text-slate-500">
                    More related reading will appear here as the blog library grows.
                  </div>
                )}
              </div>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}

