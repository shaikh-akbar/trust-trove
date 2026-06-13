import { Suspense } from "react";
import HomeExperience from "./components/home/HomeExperience";
import HomeDeferredSections from "./components/home/HomeDeferredSections";
import { getFeaturedCategoryTabs, getFeaturedProductsPage } from "../lib/product";
import { buildMetadata, getSiteUrl } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Official Website for GoModexa",
  path: "/",
  description:
    "Official GoModexa website for shopping curated lifestyle products online in India across fashion, travel, beauty, home, gadgets, and everyday essentials at gomodexa.com.",
  keywords: [
    "GoModexa official website",
    "gomodexa.com",
    "gomodexa",
    "GoModexa India",
    "shop GoModexa online",
    "curated products India",
  ],
});

export default async function Home() {
  const [featuredProductsPage, featuredTabs] = await Promise.all([
    getFeaturedProductsPage({ page: 1, pageSize: 10 }),
    getFeaturedCategoryTabs({
      categoryLimit: 8,
      productsPerCategory: 10,
      preloadedTabCount: 0,
    }),
  ]);
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "GoModexa Official Homepage",
    url: getSiteUrl("/"),
    description:
      "The official homepage of GoModexa at gomodexa.com featuring curated products, category discovery, blog highlights, and new arrivals.",
    isPartOf: {
      "@id": getSiteUrl("/#website"),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <h1 className="sr-only">
        GoModexa official website and online shopping store in India
      </h1>
      <HomeExperience
        featuredProducts={featuredProductsPage.products || []}
        featuredProductsTotal={Number(featuredProductsPage.total || 0)}
        featuredTabs={featuredTabs}
      />
      <Suspense fallback={null}>
        <HomeDeferredSections />
      </Suspense>
      <section className="bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe4_100%)] py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white px-5 py-6 shadow-[0_26px_70px_-52px_rgba(15,23,42,0.24)] sm:px-7 sm:py-8">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--brand-navy)]/55">
              GoModexa Official Website
            </p>
            <h2 className="mt-3 text-3xl font-normal tracking-normal text-[var(--brand-navy)] sm:text-4xl">
              Shop the official GoModexa store at gomodexa.com
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              GoModexa is an India-focused online shopping website for curated
              lifestyle products across fashion, beauty, travel, home,
              gadgets, and everyday essentials.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

