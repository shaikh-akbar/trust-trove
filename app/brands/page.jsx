import { BrandsExperience } from "../components/store/StorefrontPages";
import { getBrandsPageData } from "../../lib/product";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildNoIndexMetadata,
  buildMetadata,
} from "../../lib/seo";

export async function generateMetadata() {
  const brands = await getBrandsPageData();

  if (!brands.length) {
    return buildNoIndexMetadata({
      title: "Brands",
      path: "/brands",
      description: "Brand browsing will appear here when public-facing brand data is available on GoModexa.",
    });
  }

  return buildMetadata({
    title: "Brands",
    path: "/brands",
    description: "Explore GoModexa brands through cleaner label pages designed for easier discovery and paginated browsing.",
    keywords: ["GoModexa brands", "shop by brand", "brand pages India"],
  });
}

export default async function BrandsPage() {
  const brands = await getBrandsPageData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Brands", path: "/brands" },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageSchema({
              name: "Brands",
              description:
                "Explore all GoModexa brands through dedicated brand collection pages.",
              path: "/brands",
              items: brands.map((brand) => ({
                name: brand.title,
                url: `/brands/${brand.slug}`,
              })),
            })
          ),
        }}
      />
      {brands.length > 0 ? (
        <BrandsExperience brands={brands} />
      ) : (
        <div className="bg-[var(--surface-soft)]">
          <section className="border-b border-[var(--line)] bg-[var(--brand-navy)] text-white">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
              <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-[var(--brand-gold)]">
                Brands
              </p>
              <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--surface-cream)] sm:text-5xl">
                Brand pages will appear when verified public-facing brand data is available.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                For now, explore categories, blogs, and product pages for the strongest discovery experience on GoModexa.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

