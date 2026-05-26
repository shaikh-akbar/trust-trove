/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3np62i3isvr1h.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "wukusy.app",
      },
      {
        protocol: "https",
        hostname: "seller.wukusy.app",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
};

export default nextConfig;
