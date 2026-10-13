const path = require('path');

module.exports = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname, '../../..'),
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3000/api',
  },
  webpack: (config) => {
    // Custom webpack configurations can be added here
    return config;
  },
};