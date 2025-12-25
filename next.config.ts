import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  images: {
    domains: [
      'img5.pic.in.th',
      'gafiwshop.xyz',
      'playzaa.online',
      'www.oned.net',
      'richmanshop.com',
      'www.termgame24.com',
      'apiportal.kasikornbank.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gafiwshop.xyz',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'playzaa.online',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.oned.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img5.pic.in.th',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'richmanshop.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.termgame24.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'apiportal.kasikornbank.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.middle-pay.com https://api.ads4u.com https://gafiwshop.xyz https://api.peamsub24hr.com https://api.inwcloud.shop; frame-src https://challenges.cloudflare.com;"
          }
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          }
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800'
          }
        ],
      },
    ];
  },
  
  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  turbopack: {},
  
  // Webpack optimizations (for non-Turbopack builds)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize bundle size
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
