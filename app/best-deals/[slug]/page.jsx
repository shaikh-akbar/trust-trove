import { notFound } from "next/navigation";
import BestDealsExperience from "../../components/store/BestDealsExperience";
import {
  buildBestDealsMetadata,
  buildBestDealsStructuredData,
  getBestDealsPagePayload,
  getBestDealsStaticParams,
} from "../page-helpers";

export function generateStaticParams() {
  return getBestDealsStaticParams();
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const payload = await getBestDealsPagePayload(resolvedParams?.slug);

  if (!payload) {
    return {};
  }

  return buildBestDealsMetadata(payload.definition);
}

export default async function BestDealsSlugPage({ params }) {
  const resolvedParams = await params;
  const payload = await getBestDealsPagePayload(resolvedParams?.slug);

  if (!payload) {
    notFound();
  }

  const { breadcrumb, collection, faq } = buildBestDealsStructuredData(
    payload.definition,
    payload.products
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }}
      />
      {faq ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      ) : null}
      <BestDealsExperience
        definition={payload.definition}
        tabs={payload.tabs}
        products={payload.products}
      />
    </>
  );
}
