/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
      },
      {
        protocol: 'https',
        hostname: 'a1.muscache.com',
      },
      {
        protocol: 'https',
        hostname: 'a2.muscache.com',
      }
    ],
  },
}

module.exports = nextConfig 