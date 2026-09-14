// See metro.config.js / scripts/markdownRawTransformer.js - .md files are
// bundled as plain strings, not the numeric asset ids the other ambient
// declarations in this folder (images.d.ts) describe.
declare module "*.md" {
  const markdownSource: string;
  export default markdownSource;
}
