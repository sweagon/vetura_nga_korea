// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
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
        hostname: 'formula-export.com',
        pathname: '/**',
      },
    ],
    // Modern image formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 60 days
    minimumCacheTTL: 60 * 60 * 24 * 60, // 60 days
  },

  // Compression
  compress: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // React strict mode for better development
  reactStrictMode: true,

  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // HTTP headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      // Cache static assets
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects (optional - add if you need)
  async redirects() {
    return [
      // Example: Redirect old paths
      // {
      //   source: '/old-cars',
      //   destination: '/cars',
      //   permanent: true,
      // },
    ];
  },

  // Experimental features (optional)
  experimental: {
    optimizeCss: true, // Optimize CSS
    scrollRestoration: true, // Better scroll handling
  },
};

module.exports = nextConfig;