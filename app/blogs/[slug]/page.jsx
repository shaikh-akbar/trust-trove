import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BLOG_POSTS } from "../../../lib/content";
import { buildMetadata } from "../../../lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((entry) => entry.slug === slug);

  if (!post) {
    return buildMetadata({
      title: "Blog Not Found",
      path: `/blogs/${slug}`,
      description: "The requested article could not be found.",
    });
  }

  return buildMetadata({
    title: post.title,
    path: `/blogs/${slug}`,
    description: post.excerpt,
    keywords: [post.category, post.title, "GoModexa article"],
  });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((entry) => entry.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-[var(--surface-soft)]">
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/blogs" className="inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]">
          <ArrowLeft size={16} className="mr-2" /> Back to blogs
        </Link>
        <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.28em] text-slate-400">{post.category}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--brand-navy)] sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-sm text-slate-500">{post.readingTime}</p>
        <div className="mt-10 space-y-6 rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)]">
          {post.body.map((paragraph) => (
            <p key={paragraph} className="text-base leading-8 text-slate-700">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

