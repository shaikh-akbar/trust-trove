import BestDealsExperience from "../components/store/BestDealsExperience";
import {
  buildBestDealsMetadata,
  buildBestDealsStructuredData,
  getBestDealsPagePayload,
} from "./page-helpers";

export async function generateMetadata() {
  const payload = await getBestDealsPagePayload();
  return buildBestDealsMetadata(payload.definition);
}

export default async function BestDealsPage() {
  const payload = await getBestDealsPagePayload();
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
