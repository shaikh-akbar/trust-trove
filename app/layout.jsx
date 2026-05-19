import "./globals.css";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import AppProviders from "./components/AppProviders";
import { getSessionUser } from "../lib/auth/session";
import { getCartSnapshotForUser } from "../lib/cart-server";
import { getWishlistProductIdsForUser } from "../lib/product-social-server";
import { buildMetadata, buildOrganizationSchema, buildWebsiteSchema } from "../lib/seo";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = buildMetadata({
  description:
    "GoModexa is a premium ecommerce destination for curated lifestyle products, fashion, accessories, and fresh arrivals in India.",
  keywords: ["GoModexa India", "premium ecommerce brand", "curated products online", "fashion and gadgets"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8fafc",
};

export default async function RootLayout({ children }) {
  let user = await getSessionUser();
  let initialCart = null;
  let initialWishlistProductIds = [];

  if (user) {
    try {
      initialCart = await getCartSnapshotForUser(user.id);
      initialWishlistProductIds = await getWishlistProductIdsForUser(user.id);
    } catch (error) {
      console.warn("Ignoring stale session after user hydration failed:", error.message);
      user = null;
    }
  }

  const organizationSchema = buildOrganizationSchema();
  const websiteSchema = buildWebsiteSchema();

  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className={`${displayFont.variable} ${bodyFont.variable} min-h-full flex flex-col font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <AppProviders initialUser={user} initialCart={initialCart} initialWishlistProductIds={initialWishlistProductIds}>
          <Navbar user={user} />
          <main className="flex-grow pb-20 md:pb-0">
            {children}
          </main>
          <MobileBottomNav user={user} />
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}

