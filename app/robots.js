import { getSiteUrl } from "../lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/cart",
          "/checkout",
          "/forgot-password",
          "/my-addresses",
          "/my-tickets",
          "/orders",
          "/profile",
          "/reset-password",
          "/share-feedback",
          "/signin",
          "/signup",
          "/wishlist",
        ],
      },
    ],
    sitemap: getSiteUrl("/sitemap.xml"),
    host: getSiteUrl("/"),
  };
}
