/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    // Agar aap external images (jaise Supabase ya DeoDap) use karenge, toh yahan domain allow karna padega
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Filhaal sab allow kiya hai, baad mein specific kar sakte hain
      },
    ],
  },
};

export default nextConfig;