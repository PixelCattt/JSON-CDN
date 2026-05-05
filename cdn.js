const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = 8025;
const ROOT = "/YOUR-PATH-HERE";

function safePath(urlPath = "") {
    const normalizedRoot = path.resolve(ROOT);
    const fullPath = path.join(ROOT, urlPath);
    const normalized = path.resolve(fullPath);

    if (normalized !== normalizedRoot && !normalized.startsWith(normalizedRoot + path.sep)) return null;
    return normalized;
}

app.use((req, res) => {
    const urlPath = decodeURIComponent(req.path).replace(/^\/+/, "");
    const target = safePath(urlPath);

    if (!target) {
        return res.status(403).json({ error: "Invalid Path" });
    }

    if (!fs.existsSync(target)) {
        return res.status(404).json({ error: "Not Found" });
    }

    const stat = fs.statSync(target);
    if (stat.isFile()) {
        return res.sendFile(target, {
            headers: {
                "Cache-Control": "public, max-age=86400"
            }
        });
    }

    const Folders = [];
    const Files = [];

    const items = fs.readdirSync(target, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.posix.join(urlPath, item.name);

        if (item.isDirectory()) {
            Folders.push({
                [item.name]: `${fullPath}`
            });
        } else {
            Files.push({
                [item.name]: `${fullPath}`
            });
        }
    }

    const out = {};
    if (Folders.length) out.Folders = Folders;
    if (Files.length) out.Files = Files;

    res.json(out);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`CDN Started on Port: ${PORT}`);
});
