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
    let modified = false;
    const lines = content.split("\n");
    const newLines = lines.map((line) => {
      if (line.includes("eslint-disable")) {
        modified = true;
        // Replace the whole comment block or clean the line
        return line
          .replace(/\/\*[\s\S]*?eslint-disable[\s\S]*?\*\//g, "")
          .replace(/\/\/[\s]*eslint-disable-next-line.*/g, "");
      }
      return line;
    });

    if (modified) {
      // Reassemble and write back, filtering out empty lines if they were just comments
      const cleaned = newLines.join("\n");
      fs.writeFileSync(file, cleaned, "utf-8");
      console.log(
        `Stripped eslint-disable from ${path.relative(path.join(__dirname, ".."), file)}`,
      );
    }
  });
});
