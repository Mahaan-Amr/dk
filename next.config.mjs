import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly allow API routes
  rewrites: async () => {
    return [];
  },
  // Updated configuration for external packages
  serverExternalPackages: ['mongoose'],
  // Disable ESLint warnings for build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove deprecated experimental options
};

export default withNextIntl(nextConfig); 