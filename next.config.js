/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config()

const ENV_VARS = {
  SITE_NAME: process.env.SITE_NAME,
  SITE_URL: process.env.SITE_URL,
}

module.exports = {
  env: ENV_VARS,
  publicRuntimeConfig: ENV_VARS,
  poweredByHeader: false,
  images: {
    domains: ['media.crystallize.com'],
  },
  future: {
    webpack5: true,
  },
  experimental: { optimizeCss: true },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}
