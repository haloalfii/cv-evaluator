import fs from "fs";
import path from "path";

const DATA_FILE = path.join("src/data/uploads.json");

// Ensure the file exists
if (!fs.existsSync("src/data")) fs.mkdirSync("src/data", { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

// Helper to read/write data
function readData() {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data || "[]");
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function saveUpload(upload) {
  const uploads = readData();
  uploads.push(upload);
  writeData(uploads);
}

export function getUploadById(id) {
  const uploads = readData();
  return uploads.find((u) => u.id === id);
}
