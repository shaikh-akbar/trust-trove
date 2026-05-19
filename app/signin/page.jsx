import { SignInExperience } from "../components/account/AccountExperience";
import { buildNoIndexMetadata } from "../../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Sign In",
  path: "/signin",
  description: "Sign in to your GoModexa account to track orders and manage your profile.",
});

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo = typeof params?.redirectTo === "string" ? params.redirectTo : "";

  return <SignInExperience redirectTo={redirectTo} />;
}

