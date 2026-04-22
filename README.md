# PIXLIFT — Local AI Image Enhancer

> Fully offline image enhancement tool. No API key. No cloud.  
> Stack: React + Vite · Express · Python (OpenCV + Pillow)

---

## What It Does

- **Upscale** images up to 4× using Lanczos resampling + pixel injection
- **Sharpen** using Unsharp Mask (Laplacian-based)
- **Denoise** using Bilateral Filter (edge-preserving)
- **Enhance Contrast, Brightness, Saturation**
- **Analyse** colour palette, sharpness score, noise level, contrast ratio
- **Compare** original vs enhanced with a drag slider

---

## Folder Structure

```
image-enhancer/
├── backend/
│   ├── server.js        ← Express API (port 5000)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Dropzone.jsx
│   │   │   ├── Controls.jsx
│   │   │   ├── AnalysisPanel.jsx
│   │   │   └── ImageCompare.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── model/
    ├── enhance.py       ← Local Python model (no API)
    └── requirements.txt
```

---

## Prerequisites

Make sure you have installed:

| Tool       | Minimum Version | Check                  |
|------------|-----------------|------------------------|
| Node.js    | 18+             | `node -v`              |
| npm        | 9+              | `npm -v`               |
| Python     | 3.9+            | `python3 --version`    |
| pip        | latest          | `pip3 --version`       |

---

## Running Instructions (Step by Step)

### Step 1 — Install Python dependencies

```bash
cd image-enhancer/model
pip3 install -r requirements.txt
```

> On some systems use `pip` instead of `pip3`

---

### Step 2 — Install & Start the Backend

Open a terminal:

```bash
cd image-enhancer/backend
npm install
node server.js
```

You should see:
```
🚀  Image Enhancer API running at http://localhost:5000
```

---

### Step 3 — Install & Start the Frontend

Open a **second** terminal:

```bash
cd image-enhancer/frontend
npm install
npm run dev
```

You should see:
```
  VITE ready at http://localhost:3000
```

---

### Step 4 — Open the App

Go to **http://localhost:3000** in your browser.

---

## No API Key Needed

The model (`enhance.py`) runs entirely locally using:
- **OpenCV** — bilateral denoising, sharpness analysis, colour clustering
- **Pillow** — upscaling, contrast, brightness, saturation
- **NumPy** — pixel-level operations

Zero network requests are made for image processing.

---

## Troubleshooting

**"Cannot reach backend"**  
→ Make sure `node server.js` is running in `backend/` on port 5000.

**Python errors on enhance**  
→ Run `pip3 install -r model/requirements.txt` again.  
→ Make sure `python3` is in your PATH (`which python3`).

**Port already in use**  
→ Backend port: change `PORT` in `backend/server.js`  
→ Frontend port: change `server.port` in `frontend/vite.config.js`

**Large images are slow**  
→ Scale factor 4× on a large image takes more time — try 2× first.

---
<p align="center">
  Made with ❤️ by <br><br>
  <a href="https://github.com/anishkumar0504">ANISH</a><br>
  <a href="https://github.com/Abhi7253878">Abhishek</a><br>
  <a href="https://github.com/Ashishkr7079">Ashish</a>
</p>
## Tips

- Drag the slider on the result to compare before/after
- The colour swatches show the 5 dominant colours in your image
- Green values in the stats panel = improvement after enhancement
- Hit "Re-Enhance" to try different settings without re-uploading
