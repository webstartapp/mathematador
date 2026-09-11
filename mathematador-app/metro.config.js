const { getDefaultConfig } = require("expo/metro-config");

// Public page content is authored as plain .md files (see
// src/content/pages/*.md) so changes render as readable prose diffs in
// GitHub instead of escaped-string diffs inside JSON. Metro has no built-in
// loader for that extension (only .json is bundled natively), so this
// registers .md as a source extension and routes it through a transformer
// that turns the raw file into a string module - see
// scripts/markdownRawTransformer.js for the mechanism.
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("md");
config.transformer.babelTransformerPath =
  require.resolve("./scripts/markdownRawTransformer.js");

module.exports = config;
