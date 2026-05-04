import { SignUpExperience } from "../components/account/AccountExperience";

export const metadata = {
  title: "Sign Up | TrustTrove",
  description: "Create a TrustTrove account for faster checkout, saved products, and order tracking.",
};

export default async function SignUpPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo = typeof params?.redirectTo === "string" ? params.redirectTo : "";

  return <SignUpExperience redirectTo={redirectTo} />;
}
