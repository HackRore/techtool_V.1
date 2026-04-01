/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/testlab',
        destination: '/tools',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
