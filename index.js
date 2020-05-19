// Require Node.js dependencies
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
const { readFile } = fs;

// Node.js CJS constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import polka from "polka";
import send from "@polka/send-type";
import sirv from "sirv";

// CONSTANTS
export const PUBLIC_DIR = join(__dirname, "public");
export const VIEWS_DIR = join(__dirname, "views");
const PORT = process.env.PORT || 1338;

const httpServer = polka();

httpServer.use(sirv(PUBLIC_DIR, { dev: true }));

httpServer.get("/", async(req, res) => {
    try {
        console.time("get_home");
        const mainPage = await readFile(join(VIEWS_DIR, "index.html"), "utf-8");

        send(res, 200, mainPage, { "Content-Type": "text/html" });
        console.timeEnd("get_home");
    }
    catch (err) {
        send(res, 500, err.message);
    }
});

httpServer.listen(PORT, () => {
    console.log(`Server started at: ${`http://localhost:${PORT}`}`);
});
