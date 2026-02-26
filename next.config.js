// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'autokoreakosova.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ci.encar.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ferrari-export.com',
        pathname: '/**',
      },
    ],
  },
  // Remove any images.domains config if present
};

module.exports = nextConfig;