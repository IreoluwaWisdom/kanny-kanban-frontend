/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['lh3.googleusercontent.com', 'www.gravatar.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Optimize fonts
  optimizeFonts: true,
  // Compress output
  compress: true,
  // Reduce bundle size
  swcMinify: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Trailing slash for Firebase hosting
  trailingSlash: true,
}

module.exports = nextConfig

