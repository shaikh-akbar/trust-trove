import { redirect } from "next/navigation";
import CustomerReviewFormClient from "../components/reviews/CustomerReviewFormClient";
import { getSessionUser } from "../../lib/auth/session";
import { buildNoIndexMetadata } from "../../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Share Feedback",
  description: "Leave a customer review about your GoModexa shopping experience.",
  path: "/share-feedback",
});

export default async function ShareFeedbackPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin?redirectTo=/share-feedback");
  }

  return <CustomerReviewFormClient user={user} />;
}

