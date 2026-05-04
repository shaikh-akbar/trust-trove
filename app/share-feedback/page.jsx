import { redirect } from "next/navigation";
import CustomerReviewFormClient from "../components/reviews/CustomerReviewFormClient";
import { getSessionUser } from "../../lib/auth/session";

export const metadata = {
  title: "Share Feedback | TrustTrove",
  description: "Leave a customer review about your TrustTrove shopping experience.",
};

export default async function ShareFeedbackPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin?redirectTo=/share-feedback");
  }

  return <CustomerReviewFormClient user={user} />;
}
