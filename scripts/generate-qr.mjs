import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const configPath = path.join(root, "public/js/config.js");
const outDir = path.join(root, "public/assets/qr");

function rejectLocalhost(url) {
  if (/localhost|127\.0\.0\.1/i.test(url)) {
    throw new Error("Refusing to encode localhost in QR");
  }
}

function readBaseUrl() {
  if (process.env.BASE_URL) {
    const url = process.env.BASE_URL.replace(/\/$/, "");
    rejectLocalhost(url);
    return url;
  }
  const src = fs.readFileSync(configPath, "utf8");
  const m = src.match(/baseUrl:\s*["']([^"']+)["']/);
  if (!m) throw new Error("BASE_URL missing");
  const url = m[1].replace(/\/$/, "");
  rejectLocalhost(url);
  return url;
}

const base = readBaseUrl();
const target = `${base}/menu`;
fs.mkdirSync(outDir, { recursive: true });
await QRCode.toFile(path.join(outDir, "menu-qr.svg"), target, { type: "svg", margin: 2, width: 512 });
await QRCode.toFile(path.join(outDir, "menu-qr.png"), target, { type: "png", margin: 2, width: 1024 });
console.log("QR encodes:", target);
