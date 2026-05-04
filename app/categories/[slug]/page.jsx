import { notFound } from "next/navigation";
import {
  CategoryDetailExperience,
  buildCategorySummary,
} from "../../components/store/StorefrontPages";
import { getProducts } from "../../../lib/product";
import { buildMetadata } from "../../../lib/seo";
import { formatCategoryLabel } from "../../../lib/storefront";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const products = await getProducts();
  const category = buildCategorySummary(products).find((item) => item.slug === slug);

  if (!category) {
    return buildMetadata({
      title: "Category Not Found",
      path: `/categories/${slug}`,
      description: "The requested category was not found on TrustTrove.",
    });
  }

  return buildMetadata({
    title: category.title,
    path: `/categories/${slug}`,
    description: `Browse ${category.title} products on TrustTrove with cleaner collection design, stronger structure, and easier discovery.`,
    keywords: [category.title, `${category.title} online`, `${category.title} collection`],
  });
}

export default async function CategoryDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const currentSearchParams = await searchParams;
  const products = await getProducts();
  const categories = buildCategorySummary(products);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const filteredProducts = products.filter(
    (product) => formatCategoryLabel(product.category || product.product_type).toLowerCase() === category.title.toLowerCase()
  );

  return (
    <CategoryDetailExperience
      products={filteredProducts}
      category={category}
      initialQuery={typeof currentSearchParams?.q === "string" ? currentSearchParams.q : ""}
    />
  );
}
