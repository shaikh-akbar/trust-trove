import { notFound, permanentRedirect } from "next/navigation";
import ProductPageClient from "../../components/product/ProductPageClient";
import { getProductByIdentifier, getProductsPage } from "../../../lib/product";
import {
  getBlogPostsForProduct,
  getCategoryPathFromTitle,
  getProductFaqs,
  getProductSeoCopy,
} from "../../../lib/content";
import { getProductHref } from "../../../lib/product-route";
import { getApprovedCustomerReviewSummary } from "../../../lib/product-social-server";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildMetadata,
  buildProductMetaDescription,
  buildProductMetaTitle,
  buildProductKeywords,
  buildProductSchema,
  hasIndexableProductPageSignals,
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

  const shouldIndex = hasIndexableProductPageSignals(product);
  const canonicalPath = getProductHref(product);
  const isCanonicalRequest = canonicalPath === `/product/${slug}`;

  return buildMetadata({
    title: buildProductMetaTitle(product),
    path: canonicalPath,
    description: buildProductMetaDescription({
      ...product,
      description:
        product.short_description || stripHtml(product.description).slice(0, 220),
    }),
    image: product.main_image || "/assets/gomodexa.png",
    keywords: buildProductKeywords(product),
    includeDefaultKeywords: false,
    robots: !isCanonicalRequest
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
            noimageindex: true,
          },
        }
      : shouldIndex
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        },
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
    permanentRedirect(canonicalPath);
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
  const productSeoCopy = getProductSeoCopy(product);
  const productFaqs = getProductFaqs(product);
  const faqSchema = buildFaqSchema(productFaqs);

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
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <ProductPageClient
        product={product}
        relatedProducts={relatedProducts}
        relatedPosts={relatedPosts}
        reviewSummary={reviewSummary}
        categoryPath={categoryPath}
        seoCopy={productSeoCopy}
        faqs={productFaqs}
      />
    </>
  );
}
