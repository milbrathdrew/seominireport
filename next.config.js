/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    dirs: ['src'],
  },
  images: {
    domains: [],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 