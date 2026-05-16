import AdminProductsClient from "../../components/admin/AdminProductsClient";
import { requireAdminUser } from "../../../lib/admin-server";
import { ADMIN_PRODUCT_STATUSES, getAdminProducts } from "../../../lib/product-admin";

export const metadata = {
  title: "Admin Products | TrustTrove",
  description: "Manage featured products, status, and SEO fields from the TrustTrove admin panel.",
};

export default async function AdminProductsPage() {
  await requireAdminUser();
  const products = await getAdminProducts();

  return <AdminProductsClient initialProducts={products} statusOptions={ADMIN_PRODUCT_STATUSES} />;
}
