import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

export default function HomeExperience({
  categories = [],
  featuredProducts = [],
  featuredTabs = [],
  customerReviews = [],
  reviewSummary = null,
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
      <HomeCustomerReviews reviews={customerReviews} reviewSummary={reviewSummary} />
    </div>
  );
}
