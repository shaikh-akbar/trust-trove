import { SignInExperience } from "../components/account/AccountExperience";

export const metadata = {
  title: "Sign In | TrustTrove",
  description: "Sign in to your TrustTrove account to track orders and manage your profile.",
};

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo = typeof params?.redirectTo === "string" ? params.redirectTo : "";

  return <SignInExperience redirectTo={redirectTo} />;
}
