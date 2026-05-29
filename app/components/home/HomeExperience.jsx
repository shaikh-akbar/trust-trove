import Link from "next/link";
import { ArrowRight, BookOpenText, Layers3, ShoppingBag, Sparkles } from "lucide-react";
import HomeCustomerReviews from "./HomeCustomerReviews";
import ShopSection from "./ShopSection";
import StaticPromoBanner from "./StaticPromoBanner";
import CategoryTilesClient from "./CategoryTilesClient";

function SectionHeading({ eyebrow, title, href, actionLabel }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.32em] text-[var(--brand-navy)]/42">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-semibold text-[var(--brand-navy)] sm:text-[2.9rem]">{title}</h2>
      </div>
      {href && actionLabel ? (
        <Link
          href={href}
          className="inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
        >
          {actionLabel} <ArrowRight size={16} className="ml-2" />
        </Link>
      ) : null}
    </div>
  );
}

const crawlPriorityLinks = [
  {
    href: "/shop",
    label: "Shop",
    title: "Open the full catalog",
    text: "Give Google and shoppers one clear route into the full product inventory.",
    icon: ShoppingBag,
  },
  {
    href: "/categories",
    label: "Categories",
    title: "Browse category hubs",
    text: "Category pages help distribute crawl attention into product clusters.",
    icon: Layers3,
  },
  {
    href: "/new-arrivals",
    label: "New Arrivals",
    title: "See fresh catalog drops",
    text: "Recent arrivals help visitors and crawlers reach fresh product pages faster.",
    icon: Sparkles,
  },
  {
    href: "/blogs",
    label: "Blogs",
    title: "Read buying guides",
    text: "Editorial pages reinforce topical relevance and support product discovery.",
    icon: BookOpenText,
  },
  {
    href: "/brand-resources",
    label: "Brand Resources",
    title: "Visit the trust page",
    text: "A stable brand reference page strengthens entity and business signals.",
    icon: ShoppingBag,
  },
];

function ExploreGoModexaSection() {
  return (
    <section className="border-y border-[var(--line)] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explore GoModexa"
          title="Start with the pages that matter most."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {crawlPriorityLinks.map(({ href, label, title, text, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,#fffdf9_0%,#f7efe4_100%)] p-6 shadow-[0_24px_72px_-56px_rgba(20,29,96,0.24)] transition hover:-translate-y-1 hover:border-[var(--brand-navy)]/18 hover:bg-white"
            >
              <span className="inline-flex rounded-2xl bg-[var(--brand-navy)] p-3 text-[var(--surface-cream)]">
                <Icon size={18} />
              </span>
              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                {label}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-[var(--brand-navy)]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              <span className="mt-5 inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]">
                Open page <ArrowRight size={16} className="ml-2 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomeExperience({
  categories = [],
  featuredProducts = [],
  featuredTabs = [],
  customerReviews = [],
  reviewSummary = null,
  latestPosts = [],
}) {
  const shopTabs =
    featuredProducts.length > 0
      ? [
          {
            id: "featured-products",
            label: "Featured Products",
            categoryTitle: "Featured Products",
            count: featuredProducts.length,
            products: featuredProducts,
            initialPage: 1,
          },
          ...featuredTabs,
        ]
      : featuredTabs;

  return (
    <div className="bg-transparent">
      <StaticPromoBanner />

      <ShopSection
        tabs={shopTabs}
        eyebrow="Category lanes"
        title="Shop by Category"
      />

      <section className="bg-[linear-gradient(180deg,#f6ede2_0%,#fbf7f0_100%)] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Shop by category"
            title="Explore Popular Categories"
            href="/categories"
            actionLabel="Browse categories"
          />
          <CategoryTilesClient categories={categories} />
        </div>
      </section>
      <ExploreGoModexaSection />
      {latestPosts.length > 0 ? (
        <section className="bg-[linear-gradient(180deg,#fffdfa_0%,#f6ede2_100%)] py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Editorial Guides"
              title="Read buying guides and product-led articles."
              href="/blogs"
              actionLabel="Browse blogs"
            />
            <div className="grid gap-6 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blogs/${post.slug}`}
                  className="group rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_30px_90px_-58px_rgba(8,15,43,0.28)] transition hover:-translate-y-1 hover:border-[var(--brand-navy)]/18"
                >
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                    <span>{post.category}</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h3 className="mt-5 font-display text-3xl font-semibold leading-tight text-[var(--brand-navy)]">
                    {post.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{post.excerpt}</p>
                  <span className="mt-6 inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]">
                    Read guide <ArrowRight size={16} className="ml-2 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <HomeCustomerReviews reviews={customerReviews} reviewSummary={reviewSummary} />
    </div>
  );
}
