import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4001;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "../data");

console.log(`[json-editor] escoltant a http://localhost:${PORT}`);
console.log(`[json-editor] DATA_DIR = ${DATA_DIR}`);

// Llistar fitxers
app.get("/editor/api/files", (req, res) => {
  try {
    const files = fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.endsWith(".json"));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Error reading directory" });
  }
});

// Llegir contingut fitxer
app.get("/editor/api/file/:name", (req, res) => {
  const filePath = path.join(DATA_DIR, req.params.name);
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(500).json({ error: "Error reading file" });
  }
});

// Desa contingut fitxer
app.post("/editor/api/file/:name", (req, res) => {
  const filePath = path.join(DATA_DIR, req.params.name);
  try {
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), "utf-8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error writing file" });
  }
});

app.listen(PORT, () => {
  console.log(`[json-editor] escoltant a http://localhost:${PORT}`);
});
