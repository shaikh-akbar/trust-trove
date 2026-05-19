import { ResetPasswordExperience } from "../components/account/AccountExperience";

export const metadata = {
  title: "Reset Password | GoModexa",
  description: "Use your OTP and choose a new password for your GoModexa account.",
};

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const email = typeof params?.email === "string" ? params.email : "";

  return <ResetPasswordExperience email={email} />;
}

