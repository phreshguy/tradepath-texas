import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/local/:city/:trade',
        destination: '/tx/:city/:trade',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
