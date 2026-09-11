#!/usr/bin/env node

// Metro's default transformer only knows how to handle JS/TS/JSON. To let
// src/content/pages/*.md be statically imported as a plain string (so the
// markdown body lives in a real .md file instead of an escaped JSON string -
// see metro.config.js), this wraps the project's own default transformer:
// for .md files it reads the raw text and rewrites it into a tiny
// `module.exports = "..."` source string before handing off, and for every
// other extension it delegates unchanged. The upstream transformer path is
// discovered the same way metro.config.js discovers it (via
// expo/metro-config's getDefaultConfig) rather than hardcoded, so it keeps
// working if Expo changes its internal transformer location.

const fs = require("fs");
const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = path.resolve(__dirname, "..");
const upstreamTransformerPath =
  getDefaultConfig(projectRoot).transformer.babelTransformerPath;
const upstreamTransformer = require(upstreamTransformerPath);

const isMarkdownFile = (filename) => filename.endsWith(".md");

module.exports.transform = (params) => {
  if (!isMarkdownFile(params.filename)) {
    return upstreamTransformer.transform(params);
  }

  const markdownSource = fs.readFileSync(params.filename, "utf8");
  return upstreamTransformer.transform({
    ...params,
    src: `module.exports = ${JSON.stringify(markdownSource)};`,
  });
};
