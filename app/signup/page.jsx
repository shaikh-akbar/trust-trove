import { SignUpExperience } from "../components/account/AccountExperience";
import { buildNoIndexMetadata } from "../../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Sign Up",
  description: "Create a GoModexa account for faster checkout, saved products, and order tracking.",
  path: "/signup",
});

export default async function SignUpPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo = typeof params?.redirectTo === "string" ? params.redirectTo : "";

  return <SignUpExperience redirectTo={redirectTo} />;
}

