/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'], deviceSizes: [360, 414, 640, 828, 1080, 1280, 1600, 1920], imageSizes: [96, 160, 256, 384] },
  async redirects() {
    return [{ source: '/', destination: '/de', permanent: false }];
  },
  async headers() {
    // static files in /public are not content-hashed: cache a week, then serve stale for a day while revalidating (instead of max-age=0 on every visit)
    const staticCache = [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }];
    return [
      { source: '/assets/:path*', headers: staticCache },
      { source: '/icons/:path*', headers: staticCache },
      { source: '/og/:path*', headers: staticCache },
      {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
      },
    ];
  },
};
export default nextConfig;
