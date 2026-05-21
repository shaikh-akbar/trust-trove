import { ResetPasswordExperience } from "../components/account/AccountExperience";
import { buildNoIndexMetadata } from "../../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Reset Password",
  description: "Use your OTP and choose a new password for your GoModexa account.",
  path: "/reset-password",
});

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const email = typeof params?.email === "string" ? params.email : "";

  return <ResetPasswordExperience email={email} />;
}

