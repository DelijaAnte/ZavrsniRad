// Force Metro to prefer CommonJS entry points for certain packages.
// This avoids issues where Metro picks an ES-module build that can't be resolved correctly.
const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.resolverMainFields = ["main", "module", "react-native"];

module.exports = config;

