import AdminTicketsClient from "../../components/admin/AdminTicketsClient";
import { requireAdminUser } from "../../../lib/admin-server";
import { getAdminTickets } from "../../../lib/tickets-server";

export const metadata = {
  title: "Admin Tickets | GoModexa",
  description: "Manage support tickets raised by GoModexa customers.",
};

export default async function AdminTicketsPage() {
  await requireAdminUser();
  const tickets = await getAdminTickets();

  return <AdminTicketsClient initialTickets={tickets} />;
}

