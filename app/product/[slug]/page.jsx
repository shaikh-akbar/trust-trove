import { notFound, redirect } from "next/navigation";
import ProductPageClient from "../../components/product/ProductPageClient";
import { getProductByIdentifier, getProductsPage } from "../../../lib/product";
import { getBlogPostsForProduct, getCategoryPathFromTitle } from "../../../lib/content";
import { getProductHref } from "../../../lib/product-route";
import { getApprovedCustomerReviewSummary } from "../../../lib/product-social-server";
import {
  buildBreadcrumbSchema,
  buildMetadata,
  buildProductSchema,
} from "../../../lib/seo";

function stripHtml(value) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function getProductPagePayload(identifier) {
  const product = await getProductByIdentifier(identifier);

  if (!product) {
    return { product: null, relatedProducts: [] };
  }

  const categoryTitle = product.category || product.product_type || null;
  const relatedPage = await getProductsPage({
    page: 1,
    pageSize: 8,
    categoryTitle,
  });
  const sameCategoryProducts = (relatedPage.products || []).filter(
    (item) => item.id !== product.id
  );

  let relatedProducts = sameCategoryProducts.slice(0, 4);

  if (relatedProducts.length < 4) {
    const fallbackPage = await getProductsPage({
      page: 1,
      pageSize: 8,
    });
    const fallbackProducts = (fallbackPage.products || []).filter(
      (item) => item.id !== product.id
    );
    relatedProducts = fallbackProducts.slice(0, 4);
  }

  return { product, relatedProducts };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { product } = await getProductPagePayload(slug);

  if (!product) {
    return buildMetadata({
      title: "Product Not Found",
      path: `/product/${slug}`,
      description: "The requested product was not found on GoModexa.",
      robots: {
        index: false,
        follow: false,
      },
    });
  }

  const description =
    product.short_description ||
    stripHtml(product.description).slice(0, 160) ||
    `Shop ${product.title} online at GoModexa.`;

  return buildMetadata({
    title: product.title,
    path: getProductHref(product),
    description,
    image: product.main_image || "/assets/gomodexa.png",
    keywords: [
      product.title,
      product.category,
      product.product_type,
      product.vendor,
      `${product.title} online`,
      `${product.category || product.product_type || "product"} India`,
    ].filter(Boolean),
  });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const { product, relatedProducts } = await getProductPagePayload(slug);

  if (!product) {
    notFound();
  }

  const canonicalPath = getProductHref(product);
  if (canonicalPath !== `/product/${slug}`) {
    redirect(canonicalPath);
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    {
      name: product.category || product.product_type || "Products",
      path: "/shop",
    },
    { name: product.title, path: canonicalPath },
  ]);
  const productSchema = buildProductSchema(product, { path: canonicalPath });
  const relatedPosts = getBlogPostsForProduct(product, { limit: 3 });
  const reviewSummary = await getApprovedCustomerReviewSummary();
  const categoryPath = getCategoryPathFromTitle(
    product.category || product.product_type
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {productSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      ) : null}
      <ProductPageClient
        product={product}
        relatedProducts={relatedProducts}
        relatedPosts={relatedPosts}
        reviewSummary={reviewSummary}
        categoryPath={categoryPath}
      />
    </>
  );
}
