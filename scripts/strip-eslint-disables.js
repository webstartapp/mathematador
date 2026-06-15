const fs = require("fs");
const path = require("path");

const walk = (directoryPath) => {
  let results = [];
  const list = fs.readdirSync(directoryPath);
  list.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (
        file !== "node_modules" &&
        file !== "_generated" &&
        file !== "build" &&
        file !== "web-build"
      ) {
        results = results.concat(walk(filePath));
      }
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      results.push(filePath);
    }
  });
  return results;
};

const dirs = [
  path.join(__dirname, "../server/src"),
  path.join(__dirname, "../mathematador-app/src"),
];

dirs.forEach((directoryPath) => {
  if (!fs.existsSync(directoryPath)) return;
  const files = walk(directoryPath);
  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
    if (content.includes("eslint-disable")) {
      const cleaned = content
        .replace(/\/\*[\s\S]*?eslint-disable[\s\S]*?\*\/\r?\n?/g, "")
        .replace(/\/\/[^\n]*eslint-disable[^\n]*\r?\n?/g, "");

      fs.writeFileSync(file, cleaned, "utf-8");
      console.log(
        `Stripped eslint-disable from ${path.relative(path.join(__dirname, ".."), file)}`,
      );
    }
  });
});
