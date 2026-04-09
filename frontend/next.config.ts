import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // @ts-ignore
  allowedDevOrigins: ['172.25.144.1', 'localhost'],
};

export default nextConfig;
