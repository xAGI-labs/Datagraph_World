/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence warnings for WalletConnect
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908

  // Use serverExternalPackages for app router (works with both Webpack and Turbopack)
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],

  // Image configuration for external hosts
  images: {
    domains: ["lh3.googleusercontent.com"],
  },

  // Turbopack configuration (now stable)
  turbopack: {
    // Add any Turbopack-specific configurations here if needed
  },
};

export default nextConfig;
