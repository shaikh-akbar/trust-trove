import HomeExperience from "./components/home/HomeExperience";
import { getHomePageData } from "../lib/product";
import { buildMetadata, getSiteUrl } from "../lib/seo";

export const metadata = buildMetadata({
  path: "/",
  description:
    "Explore a redesigned TrustTrove homepage with premium product cards, editorial collections, blog content, and stronger SEO foundations.",
  keywords: ["TrustTrove homepage", "premium ecommerce homepage", "curated products India"],
});

export default async function Home() {
  const { brands, categories, featuredTabs, customerReviews } = await getHomePageData();
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "TrustTrove Homepage",
    url: getSiteUrl("/"),
    description:
      "A premium TrustTrove storefront featuring curated products, category edits, blog highlights, and new arrivals.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <HomeExperience
        brands={brands}
        categories={categories}
        featuredTabs={featuredTabs}
        customerReviews={customerReviews}
      />
    </>
  );
}
