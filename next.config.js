/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: 'img.clerk.com' }],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'referrer-policy', value: 'no-referrer' }],
      },
    ]
  },
}

module.exports = nextConfig
