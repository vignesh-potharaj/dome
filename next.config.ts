import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Removed devIndicators entries that are not supported by the NextConfig type
  // Provide an explicit (empty) turbopack configuration so Next's Turbopack
  // detection doesn't fail when a webpack config exists in the repo.
  // If you prefer to force webpack instead, run the dev/build commands with
  // the `--webpack` flag or remove/migrate webpack customizations.
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
