module.exports = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3000/api',
  },
  webpack: (config) => {
    // Custom webpack configurations can be added here
    return config;
  },
};