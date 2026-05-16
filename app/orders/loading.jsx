import PageLoadingState from "../components/feedback/PageLoadingState";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Orders"
      title="Opening your order history"
      description="We are fetching the latest payment and order status for your account."
    />
  );
}
