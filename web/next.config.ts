import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/local/:path*',
        destination: '/tx/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
