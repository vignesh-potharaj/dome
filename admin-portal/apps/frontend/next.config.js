module.exports = {
  reactStrictMode: true,
  // Explicit empty turbopack config to avoid the Next.js error when Turbopack
  // is enabled but a webpack config is present in the repository.
  turbopack: {},
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3000/api',
  },
  webpack: (config) => {
    // Custom webpack configurations can be added here
    return config;
  },
};