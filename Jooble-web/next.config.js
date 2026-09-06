/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Performance optimizations
  swcMinify: true,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Optimize fonts
  optimizeFonts: true,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
