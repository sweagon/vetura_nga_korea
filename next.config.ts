// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['formula-export.com'],
  },
  // Optional: Redirect from old domain if you still own it
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'formula-export.com',
          },
        ],
        destination: 'https://formula-export.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;