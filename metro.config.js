// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Required for Expo Router
  isCSSEnabled: true,
});

// This is needed for resolving the `app` directory for server-side rendering.
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;
