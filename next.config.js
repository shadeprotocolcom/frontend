/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
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

    return config;
  },
};

module.exports = nextConfig;
