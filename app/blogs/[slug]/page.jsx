import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getProductByIdentifier, getProductsPage } from "../../../lib/product";
import {
  BLOG_POSTS,
  getBlogPostBySlug,
  getBlogPostsByCategory,
  getCategoryPathFromTitle,
} from "../../../lib/content";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildMetadata,
} from "../../../lib/seo";

export const dynamicParams = false;

function formatPrice(value) {
  return `Rs ${Number(value || 0)}`;
}

function getProductIdentifierFromPath(path) {
  const normalizedPath = String(path || "").trim();

  if (!normalizedPath.startsWith("/product/")) {
    return "";
  }

  return normalizedPath.replace("/product/", "").trim();
}

function countWords(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function formatComparePrice(value) {
  const price = Number(value || 0);
  return price > 0 ? `Rs ${price}` : "";
}

function toAnchorId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function getProductIdentifiersFromLinks(items = []) {
  return Array.from(
    new Set(
      items
        .map((item) => getProductIdentifierFromPath(item?.href))
        .filter(Boolean)
    )
  );
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

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
    includeDefaultKeywords: false,
    openGraphType: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt || post.publishedAt,
    section: post.category,
    tags: [...(post.keywords || []), ...(post.topicTags || []), post.category],
    authors: [post.authorName || "GoModexa"],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
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
  const productIdentifier = getProductIdentifierFromPath(productPath);
  const linkedProduct = productIdentifier
    ? await getProductByIdentifier(productIdentifier)
    : null;
  const displayPrice =
    Number(linkedProduct?.price_selling || linkedProduct?.variants?.[0]?.price_selling || 0) ||
    Number(post?.productSource?.costPrice || 0);
  const displayStock =
    Number(linkedProduct?.inventory_quantity || linkedProduct?.variants?.[0]?.inventory_quantity || 0) ||
    Number(post?.productSource?.stockQty || 0);
  const relatedPosts = getBlogPostsByCategory(
    post?.productSource?.categoryTitle || post.category,
    { excludeSlug: post.slug, limit: 3 }
  );
  const keyTakeaways = Array.isArray(post.keyTakeaways) ? post.keyTakeaways.filter(Boolean) : [];
  const articleSections = Array.isArray(post.sections) ? post.sections.filter(Boolean) : [];
  const faqItems = Array.isArray(post.faq) ? post.faq.filter(Boolean) : [];
  const relatedLinks = Array.isArray(post.relatedLinks) ? post.relatedLinks.filter(Boolean) : [];
  const relatedProductIdentifiers = Array.from(
    new Set(
      [
        getProductIdentifierFromPath(productPath),
        ...getProductIdentifiersFromLinks(relatedLinks),
      ].filter(Boolean)
    )
  ).slice(0, 4);
  const linkedRelatedProducts = (
    await Promise.all(relatedProductIdentifiers.map((identifier) => getProductByIdentifier(identifier)))
  ).filter(Boolean);
  const categoryFallbackPage =
    linkedRelatedProducts.length > 0
      ? { products: [] }
      : await getProductsPage({
          categoryTitle: post?.productSource?.categoryTitle || post.category,
          page: 1,
          pageSize: 4,
        });
  const genericFallbackPage =
    linkedRelatedProducts.length > 0 || (categoryFallbackPage?.products || []).length > 0
      ? { products: [] }
      : await getProductsPage({
          page: 1,
          pageSize: 4,
        });
  const fallbackRelatedProducts = [
    ...((categoryFallbackPage?.products || []).filter(Boolean)),
    ...((genericFallbackPage?.products || []).filter(Boolean)),
  ];
  const relatedProducts = Array.from(
    new Map(
      [...linkedRelatedProducts, ...fallbackRelatedProducts].map((product) => [product.id, product])
    ).values()
  ).slice(0, 4);
  const topicTags = Array.isArray(post.topicTags)
    ? Array.from(new Set(post.topicTags.filter(Boolean)))
    : [];
  const articleTextSegments = [
    ...(Array.isArray(post.body) ? post.body : []),
    ...articleSections.flatMap((section) => [
      section?.heading || "",
      ...(Array.isArray(section?.paragraphs) ? section.paragraphs : []),
    ]),
    ...faqItems.flatMap((item) => [item?.question || "", item?.answer || ""]),
  ].filter(Boolean);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blogs", path: "/blogs" },
    { name: post.title, path: canonicalPath },
  ]);
  const articleSchema = buildArticleSchema({
    schemaType: "Article",
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    path: canonicalPath,
    publishedAt: post.publishedAt,
    modifiedAt: post.updatedAt || post.publishedAt,
    image: post.image || "/assets/gomodexa.png",
    keywords: [...(post.keywords || []), ...topicTags],
    section: post.category,
    articleBody: articleTextSegments.join(" "),
    wordCount: articleTextSegments.reduce((total, segment) => total + countWords(segment), 0),
  });
  const faqSchema = buildFaqSchema(faqItems);

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
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <div className="bg-[var(--surface-soft)]">
        <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/blogs" className="inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]">
            <ArrowLeft size={16} className="mr-2" /> Back to blogs
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-slate-400">
            <Link href={categoryPath} className="transition hover:text-[var(--brand-navy)]">
              {post.category}
            </Link>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <Link href="/shop" className="transition hover:text-[var(--brand-navy)]">
              Shop all products
            </Link>
          </div>
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
            {post.updatedAt ? (
              <p>
                Updated{" "}
                {new Date(post.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            ) : null}
          </div>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
            {post.metaDescription || post.excerpt}
          </p>
          {topicTags.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {topicTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          {articleSections.length > 1 ? (
            <nav className="mt-8 rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_70px_-56px_rgba(20,29,96,0.22)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                In this article
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {articleSections.map((section) => (
                  <a
                    key={section.heading}
                    href={`#${toAnchorId(section.heading)}`}
                    className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--brand-navy)] transition hover:border-[var(--brand-navy)]/20 hover:bg-white"
                  >
                    {section.heading}
                  </a>
                ))}
              </div>
            </nav>
          ) : null}
          {keyTakeaways.length > 0 ? (
            <section className="mt-8 rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_70px_-56px_rgba(20,29,96,0.22)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Key takeaways
              </p>
              <ul className="mt-4 grid gap-3">
                {keyTakeaways.map((item) => (
                  <li
                    key={item}
                    className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 text-sm leading-7 text-slate-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
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
                <p>Price: {formatPrice(displayPrice)}</p>
                <p>Stock: {displayStock}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {productPath ? (
                  <Link
                    href={productPath}
                    className="inline-flex rounded-full border border-[var(--line)] bg-[var(--brand-navy)] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white"
                  >
                    Open product page
                  </Link>
                ) : null}
                <Link
                  href={categoryPath}
                  className="inline-flex rounded-full border border-[var(--line)] bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
                >
                  Shop {post.productSource.categoryTitle}
                </Link>
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
          {articleSections.length > 0 ? (
            <div className="mt-10 space-y-6">
              {articleSections.map((section) => (
                <section
                  key={section.heading}
                  id={toAnchorId(section.heading)}
                  className="rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)]"
                >
                  <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-3xl">
                    {section.heading}
                  </h2>
                  <div className="mt-5 space-y-5">
                    {(section.paragraphs || []).map((paragraph) => (
                      <p key={paragraph} className="text-base leading-8 text-slate-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
          {relatedProducts.length > 0 ? (
            <section className="mt-10 rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Related products
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-3xl">
                Shop the exact products mentioned in this guide
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {relatedProducts.map((product) => {
                  const productHref = `/product/${product.slug || product.handle}`;
                  const imageUrl =
                    product?.main_image || product?.product_images?.[0]?.src || "";
                  const productTitle = product?.title || product?.name || "Untitled product";
                  const sellingPrice = Number(
                    product?.price_selling || product?.variants?.[0]?.price_selling || 0
                  );
                  const comparePrice = Number(
                    product?.price_compare ||
                      product?.variants?.[0]?.price_compare ||
                      (sellingPrice > 0 ? Math.round(sellingPrice * 1.35) : 0)
                  );
                  const inventory = Number(
                    product?.inventory_quantity ||
                      product?.variants?.[0]?.inventory_quantity ||
                      0
                  );

                  return (
                    <Link
                      key={product.id || productHref}
                      href={productHref}
                      className="group overflow-hidden rounded-[1.45rem] border border-[var(--line)] bg-[var(--surface-soft)] transition hover:-translate-y-1 hover:border-[var(--brand-navy)]/20 hover:bg-white"
                    >
                      <div className="relative aspect-[4/3.8] overflow-hidden bg-white">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={productTitle}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                          {product?.category || product?.product_type || post.category}
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[var(--brand-navy)]">
                          {productTitle}
                        </h3>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="text-base font-black tracking-tight text-[var(--brand-navy)]">
                            {formatPrice(sellingPrice)}
                          </span>
                          {comparePrice > sellingPrice ? (
                            <span className="text-xs font-semibold text-slate-400 line-through">
                              {formatComparePrice(comparePrice)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          {inventory > 0 ? `${inventory} pcs left` : "Check latest availability"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}
          {faqItems.length > 0 ? (
            <section className="mt-10 rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                FAQ
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-3xl">
                Questions shoppers usually ask
              </h2>
              <div className="mt-6 space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-5"
                  >
                    <h3 className="text-base font-semibold text-[var(--brand-navy)]">
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {relatedLinks.length > 0 ? (
            <section className="mt-10 rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Keep exploring
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-3xl">
                More helpful reading
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {relatedLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 text-sm font-semibold leading-6 text-[var(--brand-navy)] transition hover:border-[var(--brand-navy)]/20 hover:bg-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
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

