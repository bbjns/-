import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
  redirects: async () => [
    { source: '/en', destination: '/en/calculator', permanent: false },
    { source: '/zh', destination: '/zh/calculator', permanent: false },
    { source: '/ko', destination: '/ko/calculator', permanent: false },
  ],
};

export default withNextIntl(nextConfig);
