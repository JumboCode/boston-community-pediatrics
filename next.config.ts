import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-d899e9b4014047699cafc4710a50477f.r2.dev",
      },
    ],
  },
};

export default nextConfig;
