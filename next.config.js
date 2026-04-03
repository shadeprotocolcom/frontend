/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: "standalone", // disabled — using next start directly
  transpilePackages: ["@shade-protocol/sdk"],
  webpack: (config) => {
    // Enable WASM support for snarkjs / circomlibjs
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Suppress node: protocol warnings from ethers/snarkjs
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      readline: false,
    };

    // Fix ESM package resolution for @noble/* and other ESM-only packages
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
    };

    return config;
  },
};

module.exports = nextConfig;
