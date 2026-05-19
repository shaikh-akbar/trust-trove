import { redirect } from "next/navigation";
import { AccountDashboardShell, LogoutSidebarButton } from "../components/account/AccountDashboard";
import TicketsClient from "../components/account/TicketsClient";
import { logoutAction } from "../actions/auth";
import { getAccountDashboardData } from "../../lib/account-server";
import { getOrdersForUser } from "../../lib/checkout-server";
import { getSessionUser } from "../../lib/auth/session";
import { getTicketsForUser } from "../../lib/tickets-server";

export const metadata = {
  title: "My Tickets | GoModexa",
  description: "View account support status and support actions in your GoModexa dashboard.",
};

export default async function MyTicketsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin?redirectTo=/my-tickets");
  }

  const { profile, stats } = await getAccountDashboardData(user.id);
  const [tickets, orders] = await Promise.all([
    getTicketsForUser(user.id),
    getOrdersForUser(user.id),
  ]);

  return (
    <AccountDashboardShell
      currentPath="/my-tickets"
      title="My Tickets"
      description="Keep support-related actions inside the same GoModexa account center experience."
      profile={profile}
      stats={stats}
      logoutButton={
        <LogoutSidebarButton>
          <form action={logoutAction}>
            <button>Logout</button>
          </form>
        </LogoutSidebarButton>
      }
    >
      <TicketsClient initialTickets={tickets} orders={orders} />
    </AccountDashboardShell>
  );
}

