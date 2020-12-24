/* eslint-disable no-sync */

// Import Node.js Dependencies
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import Third-party Dependencies
import esbuild from "esbuild";

// Node.js CJS constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CONSTANTS
const kAssetsDir = path.join(__dirname, "assets");
const kOutDir = path.join(__dirname, "out");

fs.mkdirSync(kOutDir, { recursive: true });

async function main() {
    await esbuild.build({
        entryPoints: [path.join(kAssetsDir, "scripts", "index.js")],
        loader: {
            ".jpg": "file",
            ".png": "file"
        },
        bundle: true,
        outdir: kOutDir
    });

    fs.copyFileSync(path.join(__dirname, "editor.html"), path.join(kOutDir, "index.html"));
}
main().catch(() => process.exit(1));

