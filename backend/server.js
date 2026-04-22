const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Multer – store uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/bmp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const MODEL_PATH = path.join(__dirname, "../model/enhance.py");

// ─── Helper: run Python model ─────────────────────────────────────────────────
function runPython(mode, b64Image, options = {}) {
  return new Promise((resolve, reject) => {
    const args = [
      MODEL_PATH,
      "--mode", mode,
      "--input", b64Image,
      "--options", JSON.stringify(options),
    ];

    const py = spawn("python3", args);
    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (d) => (stdout += d.toString()));
    py.stderr.on("data", (d) => (stderr += d.toString()));

    py.on("close", (code) => {
      if (code !== 0) {
        console.error("Python error:", stderr);
        return reject(new Error(stderr || "Python process failed"));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error("Failed to parse Python output: " + stdout));
      }
    });
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/analyse  – returns colour/quality stats
app.post("/api/analyse", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const b64 = req.file.buffer.toString("base64");
    const result = await runPython("analyse", b64);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/enhance  – returns enhanced image + before/after stats
app.post("/api/enhance", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const opts = {
      scale:      parseInt(req.body.scale      || "2"),
      sharpen:    req.body.sharpen    !== "false",
      denoise:    req.body.denoise    !== "false",
      contrast:   parseFloat(req.body.contrast   || "1.3"),
      brightness: parseFloat(req.body.brightness || "1.0"),
      saturation: parseFloat(req.body.saturation || "1.2"),
    };

    const b64 = req.file.buffer.toString("base64");
    const result = await runPython("enhance", b64, opts);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", model: "local" }));

app.listen(PORT, () => {
  console.log(`\n🚀  Image Enhancer API running at http://localhost:${PORT}`);
  console.log(`📦  Model path: ${MODEL_PATH}\n`);
});
