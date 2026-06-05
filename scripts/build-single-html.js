const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const stylesPath = path.join(root, "styles.css");
const scriptPath = path.join(root, "script.js");
const outputPath = path.join(root, "blue-archive-quiz-single.html");

const html = fs.readFileSync(indexPath, "utf8");
const css = fs.readFileSync(stylesPath, "utf8");
const js = fs.readFileSync(scriptPath, "utf8");

const bundled = html
  .replace(
    /<link rel="stylesheet" href="styles\.css"\s*\/>/,
    () => `<style>\n${css}\n    </style>`,
  )
  .replace(
    /\s*<script src="script\.js"><\/script>/,
    () => `\n    <script>\n${js}\n    </script>`,
  );

fs.writeFileSync(outputPath, bundled, "utf8");

console.log(
  JSON.stringify(
    {
      output: outputPath,
      bytes: Buffer.byteLength(bundled),
    },
    null,
    2,
  ),
);
