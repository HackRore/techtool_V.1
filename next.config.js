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
      {
        source: '/assistant',
        destination: '/',
        permanent: true,
      },
      {
        source: '/compare',
        destination: '/tools',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
