import AdminShell from "../components/admin/AdminShell";
import { requireAdminUser } from "../../lib/admin-server";
import { buildNoIndexMetadata } from "../../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Admin",
  path: "/admin",
  description: "Internal GoModexa admin dashboard.",
});

export default async function AdminLayout({ children }) {
  const user = await requireAdminUser();

  return (
    <AdminShell
      user={user}
      title="Operations dashboard"
      description="A focused control room for orders, customer activity, and store operations."
    >
      {children}
    </AdminShell>
  );
}
