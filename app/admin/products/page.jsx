import AdminProductsClient from "../../components/admin/AdminProductsClient";
import { requireAdminUser } from "../../../lib/admin-server";
import {
  ADMIN_PRODUCTS_PAGE_SIZE,
  ADMIN_PRODUCT_STATUSES,
  getAdminProductsPage,
} from "../../../lib/product-admin";

export const metadata = {
  title: "Admin Products | GoModexa",
  description: "Manage featured products, status, and SEO fields from the GoModexa admin panel.",
};

export default async function AdminProductsPage({ searchParams }) {
  await requireAdminUser();
  const currentSearchParams = await searchParams;
  const page = Number(currentSearchParams?.page || 1);
  const search = currentSearchParams?.q || "";
  const status = currentSearchParams?.status || "all";
  const category = currentSearchParams?.category || "all";
  const initialData = await getAdminProductsPage({
    page,
    pageSize: ADMIN_PRODUCTS_PAGE_SIZE,
    search,
    status,
    category,
  });

  return (
    <AdminProductsClient
      initialData={initialData}
      initialQuery={search}
      initialFilter={status}
      initialCategory={category}
      statusOptions={ADMIN_PRODUCT_STATUSES}
    />
  );
}

