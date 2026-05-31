import ShopSection from "./ShopSection";
import StaticPromoBanner from "./StaticPromoBanner";

export default function HomeExperience({
  featuredProducts = [],
  featuredProductsTotal = 0,
  featuredTabs = [],
}) {
  const shopTabs =
    featuredProducts.length > 0
      ? [
          {
            id: "featured-products",
            label: "Featured Products",
            categoryTitle: "Featured Products",
            count: featuredProductsTotal || featuredProducts.length,
            products: featuredProducts,
            initialPage: 1,
            isFeatured: true,
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
    </div>
  );
}
