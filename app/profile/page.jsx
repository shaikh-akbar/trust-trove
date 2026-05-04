import { redirect } from "next/navigation";
import { AccountDashboardShell, LogoutSidebarButton, ProfileOverview } from "../components/account/AccountDashboard";
import ProfileEditorModal from "../components/account/ProfileEditorModal";
import { logoutAction } from "../actions/auth";
import { getAccountDashboardData } from "../../lib/account-server";
import { getSessionUser } from "../../lib/auth/session";

export const metadata = {
  title: "My Profile | TrustTrove",
  description: "Manage your TrustTrove account, orders, and saved products.",
};

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin");
  }

  const { profile, addresses, stats } = await getAccountDashboardData(user.id);

  return (
    <AccountDashboardShell
      currentPath="/profile"
      title="My Profile"
      description="Manage your account details, saved addresses, and order activity from one clean TrustTrove dashboard."
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
        <ProfileEditorModal profile={profile} triggerLabel="Edit Profile" />
      }
    >
      <ProfileOverview
        profile={profile}
        addresses={addresses}
        stats={stats}
        editProfileAction={<ProfileEditorModal profile={profile} triggerLabel="Update" triggerVariant="secondary" />}
      />
    </AccountDashboardShell>
  );
}
