import { redirect } from "next/navigation";
import CheckoutClient from "../components/cart/CheckoutClient";
import { getSessionUser } from "../../lib/auth/session";
import { getUserAddresses } from "../../lib/checkout-server";

export const metadata = {
  title: "Checkout | TrustTrove",
  description: "Secure checkout for your TrustTrove order.",
};

export default async function CheckoutPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin?redirectTo=/checkout");
  }

  const addresses = await getUserAddresses(user.id);

  return <CheckoutClient user={user} initialAddresses={addresses} />;
}
