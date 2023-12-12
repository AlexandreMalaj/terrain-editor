// Import Node.js Dependencies
const repl = require("repl");
const path = require("path");
const fs = require("fs");

// Import Third-party Dependencies
const esbuild = require("esbuild");

// CONSTANTS
const kAssetsDir = path.join(__dirname, "assets");

const kOutDir = path.join(__dirname, "out");

fs.mkdirSync(kOutDir, { recursive: true });

async function main() {
  await esbuild.build({
    entryPoints: [
      path.join(kAssetsDir, "scripts", "index.js")
    ],
    loader: {
      ".jpg": "file",
      ".png": "file"
    },
    platform: "node",
    bundle: true,
    outdir: kOutDir
  });

  fs.copyFileSync(path.join(__dirname, "editor.html"), path.join(kOutDir, "index.html"));
}
main().catch(() => process.exit(1));

