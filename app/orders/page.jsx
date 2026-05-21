import { redirect } from "next/navigation";
import Link from "next/link";
import { AccountDashboardShell, LogoutSidebarButton, OrdersPanel } from "../components/account/AccountDashboard";
import { logoutAction } from "../actions/auth";
import { getAccountDashboardData } from "../../lib/account-server";
import { getSessionUser } from "../../lib/auth/session";
import { buildNoIndexMetadata } from "../../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Orders",
  description: "Track your GoModexa orders and payment status.",
  path: "/orders",
});

export default async function OrdersPage({ searchParams }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin?redirectTo=/orders");
  }

  const params = await searchParams;
  const placed = typeof params?.placed === "string" ? params.placed : "";
  const { profile, orders, stats } = await getAccountDashboardData(user.id);

  return (
    <AccountDashboardShell
      currentPath="/orders"
      title="My Orders"
      description="Track every GoModexa purchase, payment status, and delivery milestone in one place."
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
        <Link
          href="/my-tickets"
          className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#161f66] transition hover:bg-white/90"
        >
          View Tickets
        </Link>
      }
    >
      {placed ? (
        <p className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          Payment verified. Order {placed} has been placed successfully.
        </p>
      ) : null}
      <OrdersPanel orders={orders} />
    </AccountDashboardShell>
  );
}

