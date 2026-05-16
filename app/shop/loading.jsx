import PageLoadingState from "../components/feedback/PageLoadingState";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Shop"
      title="Loading the catalog"
      description="Fresh products and filters are being prepared for this page."
    />
  );
}
