import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "../../lib/content";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Blogs",
  path: "/blogs",
  description: "Read TrustTrove blog articles covering style, gifting, store trust, and smarter shopping decisions.",
  keywords: ["TrustTrove blogs", "shopping blog", "style journal", "gift guide"],
});

export default function BlogsPage() {
  return (
    <div className="bg-[var(--surface-soft)]">
      <section className="border-b border-[var(--line)] bg-[var(--brand-navy)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-[var(--brand-gold)]">TrustTrove Journal</p>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--surface-cream)] sm:text-5xl">
            Editorial content that gives the store more depth and discoverability.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
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
              <span className="mt-8 inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]">
                Read article <ArrowRight size={16} className="ml-2" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
