import HomeExperience from "./components/home/HomeExperience";
import { getSortedBlogPosts } from "../lib/content";
import { getHomePageData } from "../lib/product";
import { getApprovedCustomerReviewSummary } from "../lib/product-social-server";
import { buildMetadata, getSiteUrl } from "../lib/seo";

export const metadata = buildMetadata({
  path: "/",
  description:
    "Explore a redesigned GoModexa homepage with premium product cards, editorial collections, blog content, and stronger SEO foundations.",
  keywords: ["GoModexa homepage", "premium ecommerce homepage", "curated products India"],
});

export default async function Home() {
  const { brands, categories, featuredProducts, featuredTabs, customerReviews } = await getHomePageData();
  const latestPosts = getSortedBlogPosts().slice(0, 3);
  const reviewSummary = await getApprovedCustomerReviewSummary();
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
        brands={brands}
        categories={categories}
        featuredProducts={featuredProducts}
        featuredTabs={featuredTabs}
        customerReviews={customerReviews}
        reviewSummary={reviewSummary}
        latestPosts={latestPosts}
      />
    </>
  );
}

