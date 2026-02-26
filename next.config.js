// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
  images: {
    domains: ['ferrari-export.com'],
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
    ],
  },
};

module.exports = nextConfig;