import AdminOrdersClient from "../../components/admin/AdminOrdersClient";
import { getAdminOrders, requireAdminUser } from "../../../lib/admin-server";
import {
  ADMIN_FULFILLMENT_STATUS_OPTIONS,
  ADMIN_ORDER_STATUS_OPTIONS,
  ADMIN_PAYMENT_STATUS_OPTIONS,
} from "../../../lib/order-admin";

export const metadata = {
  title: "Admin Orders | TrustTrove",
  description: "Manage and review TrustTrove orders from the admin panel.",
};

export default async function AdminOrdersPage({ searchParams }) {
  await requireAdminUser();
  const params = await searchParams;
  const startDate = typeof params?.startDate === "string" ? params.startDate : "";
  const endDate = typeof params?.endDate === "string" ? params.endDate : "";
  const orders = await getAdminOrders({ startDate, endDate });

  return (
    <AdminOrdersClient
      orders={orders}
      initialStartDate={startDate}
      initialEndDate={endDate}
      statusOptions={ADMIN_ORDER_STATUS_OPTIONS}
      fulfillmentOptions={ADMIN_FULFILLMENT_STATUS_OPTIONS}
      paymentOptions={ADMIN_PAYMENT_STATUS_OPTIONS}
    />
  );
}
