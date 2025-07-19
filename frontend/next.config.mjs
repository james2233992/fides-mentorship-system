/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better error detection
  reactStrictMode: true,
  
  // Disable ESLint during production builds (temporary)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable x-powered-by header for security
  poweredByHeader: false,
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Image optimization configuration
  images: {
    domains: [
      'localhost',
      'fides-api.railway.app',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Production optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Experimental features for better performance
  experimental: {
    // Enable server components optimization
    optimizeCss: true,
  },
  
  // Environment variables with fallbacks
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
    // Hardcoded fallbacks for when Vercel env vars fail
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://fides-mentorship-system-production.up.railway.app/api',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://fides-mentorship-system-production.up.railway.app',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'FIDES Mentorship',
  },
  
  // Headers for security
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
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ];
  },
  
  // Redirects for old routes
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Ignore node_modules in frontend build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;