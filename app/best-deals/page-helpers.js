import {
  getBestDealsChildPageDefinitions,
  getBestDealsPageDefinitionBySlug,
  getBestDealsPageDefinitions,
} from "../../lib/product-deals";
import { getBestDealsProducts } from "../../lib/product";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildFaqSchema,
  buildMetadata,
} from "../../lib/seo";
import { getProductHref } from "../../lib/product-route";

export async function getBestDealsPagePayload(slug = "") {
  const definition = getBestDealsPageDefinitionBySlug(slug);

  if (!definition) {
    return null;
  }

  const products = await getBestDealsProducts({
    slug: definition.slug,
    limit: 10,
  });

  return {
    definition,
    tabs: getBestDealsPageDefinitions(),
    products,
  };
}

export function buildBestDealsMetadata(definition) {
  return buildMetadata({
    title: definition.seoTitle,
    path: definition.path,
    description: definition.metaDescription,
    keywords: definition.keywords,
  });
}

export function buildBestDealsStructuredData(definition, products) {
  return {
    breadcrumb: buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Best Deals", path: "/best-deals" },
      ...(definition.path !== "/best-deals"
        ? [{ name: definition.title, path: definition.path }]
        : []),
    ]),
    collection: buildCollectionPageSchema({
      name: definition.title,
      description: definition.metaDescription,
      path: definition.path,
      items: products.map((product) => ({
        name: product.title || product.name,
        url: getProductHref(product),
      })),
    }),
    faq: buildFaqSchema(definition.faqs || []),
  };
}

export function getBestDealsStaticParams() {
  return getBestDealsChildPageDefinitions().map((definition) => ({
    slug: definition.slug,
  }));
}
