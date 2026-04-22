const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

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
// Writes image to a temp file to avoid ARG_MAX / ENAMETOOLONG limits
function runPython(mode, imageBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    // Write image buffer to a temp file
    const tmpInput = path.join(os.tmpdir(), `pixlift_in_${Date.now()}.bin`);
    const tmpOpts  = path.join(os.tmpdir(), `pixlift_opts_${Date.now()}.json`);

    try {
      fs.writeFileSync(tmpInput, imageBuffer);
      fs.writeFileSync(tmpOpts, JSON.stringify(options));
    } catch (e) {
      return reject(new Error("Failed to write temp files: " + e.message));
    }

    const args = [
      MODEL_PATH,
      "--mode",    mode,
      "--input",   tmpInput,
      "--options", tmpOpts,
    ];

    const py = spawn("python3", args);
    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (d) => (stdout += d.toString()));
    py.stderr.on("data", (d) => (stderr += d.toString()));

    py.on("close", (code) => {
      // Clean up temp files
      try { fs.unlinkSync(tmpInput); } catch {}
      try { fs.unlinkSync(tmpOpts);  } catch {}

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
    const result = await runPython("analyse", req.file.buffer);
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

    const result = await runPython("enhance", req.file.buffer, opts);
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
