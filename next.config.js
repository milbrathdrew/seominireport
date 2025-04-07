/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['src'],
  },
  images: {
    domains: [],
  },
}

module.exports = nextConfig 