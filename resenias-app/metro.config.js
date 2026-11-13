const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Soporte para archivos WebAssembly requeridos por expo-sqlite
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './src/global.css' });
