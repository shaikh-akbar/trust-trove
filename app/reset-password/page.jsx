import { ResetPasswordExperience } from "../components/account/AccountExperience";

export const metadata = {
  title: "Reset Password | TrustTrove",
  description: "Use your OTP and choose a new password for your TrustTrove account.",
};

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const email = typeof params?.email === "string" ? params.email : "";

  return <ResetPasswordExperience email={email} />;
}
