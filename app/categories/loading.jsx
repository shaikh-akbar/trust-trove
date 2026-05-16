import PageLoadingState from "../components/feedback/PageLoadingState";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Categories"
      title="Loading category collections"
      description="We are preparing category data without blocking the whole screen."
    />
  );
}
