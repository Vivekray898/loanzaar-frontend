/** @type {import('next').NextConfig} */
const nextConfig = {
  // For dev mode, allow dynamic rendering
  // For build/export, user should use npm run build which uses the export setting
  // This allows catch-all routes to work properly without requiring all paths upfront
  // Redirect legacy pages to new App Router routes
  async redirects() {
    return [
      {
        source: '/profile',
        destination: '/account/profile',
        permanent: true,
      },
    ];
  },
}

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  nextConfig, // We pass the nextConfig object directly here
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "tbh-ie",
    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Webpack-specific Sentry options (preferred)
    webpack: {
      treeshake: {
        // Remove debug logging statements from client bundles at build time
        removeDebugLogging: true,
      },
      // Enables automatic instrumentation of Vercel Cron Monitors
      automaticVercelMonitors: true,
    },
  }
);