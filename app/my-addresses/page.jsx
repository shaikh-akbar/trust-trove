import { redirect } from "next/navigation";
import { AccountDashboardShell, LogoutSidebarButton } from "../components/account/AccountDashboard";
import AccountAddressesClient from "../components/account/AccountAddressesClient";
import { logoutAction } from "../actions/auth";
import { getAccountDashboardData } from "../../lib/account-server";
import { getSessionUser } from "../../lib/auth/session";

export const metadata = {
  title: "My Addresses | GoModexa",
  description: "Manage your saved GoModexa delivery addresses.",
};

export default async function MyAddressesPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin?redirectTo=/my-addresses");
  }

  const { profile, addresses, stats } = await getAccountDashboardData(user.id);

  return (
    <AccountDashboardShell
      currentPath="/my-addresses"
      title="Your Addresses"
      description="Manage saved delivery addresses for faster checkout and smoother repeat orders."
      profile={profile}
      stats={stats}
      logoutButton={
        <LogoutSidebarButton>
          <form action={logoutAction}>
            <button>Logout</button>
          </form>
        </LogoutSidebarButton>
      }
      action={
        null
      }
    >
      <AccountAddressesClient initialAddresses={addresses} profile={profile} />
    </AccountDashboardShell>
  );
}

