/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
// Enable static export only when explicitly requested in prod builds
const enableExport = isProd && (process.env.NEXT_OUTPUT === 'export' || process.env.NEXT_EXPORT === 'true')

const nextConfig = {
  reactStrictMode: true,
  ...(enableExport ? { output: 'export' } : {}),
  images: {
    // Unoptimized images are required for static export
    unoptimized: !!enableExport,
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
  // Trailing slash for Firebase hosting (only matters for static export)
  ...(enableExport ? { trailingSlash: true } : {}),
}

module.exports = nextConfig
