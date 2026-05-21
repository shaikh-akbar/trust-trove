import { ForgotPasswordExperience } from "../components/account/AccountExperience";
import { buildNoIndexMetadata } from "../../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Forgot Password",
  description: "Send a one-time password to your email and reset your GoModexa account password.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordExperience />;
}

