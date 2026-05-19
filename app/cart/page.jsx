import CartPageClient from "../components/cart/CartPageClient";
import { buildNoIndexMetadata } from "../../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Cart",
  path: "/cart",
  description: "Review your GoModexa cart, update quantities, and continue to checkout.",
});

export default function CartPage() {
  return <CartPageClient />;
}

