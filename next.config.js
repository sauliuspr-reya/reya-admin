/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Similarly, allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Only expose essential environment variables to the client
  // All other environment variables should be accessed server-side only
  serverExternalPackages: ['pg'],
  images: {
    domains: ['cdn.discordapp.com'],
  },
}

module.exports = nextConfig
