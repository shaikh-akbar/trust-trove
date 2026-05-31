import { Suspense } from "react";
import HomeExperience from "./components/home/HomeExperience";
import HomeDeferredSections from "./components/home/HomeDeferredSections";
import { getFeaturedCategoryTabs, getFeaturedProductsPage } from "../lib/product";
import { buildMetadata, getSiteUrl } from "../lib/seo";

export const metadata = buildMetadata({
  path: "/",
  description:
    "Explore a redesigned GoModexa homepage with premium product cards, editorial collections, blog content, and stronger SEO foundations.",
  keywords: ["GoModexa homepage", "premium ecommerce homepage", "curated products India"],
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
    name: "GoModexa Homepage",
    url: getSiteUrl("/"),
    description:
      "A premium GoModexa storefront featuring curated products, category edits, blog highlights, and new arrivals.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <HomeExperience
        featuredProducts={featuredProductsPage.products || []}
        featuredProductsTotal={Number(featuredProductsPage.total || 0)}
        featuredTabs={featuredTabs}
      />
      <Suspense fallback={null}>
        <HomeDeferredSections />
      </Suspense>
    </>
  );
}

