import { useState, useCallback, useEffect } from "react";
import Dropzone from "./components/Dropzone";
import Controls from "./components/Controls";
import AnalysisPanel from "./components/AnalysisPanel";
import ImageCompare from "./components/ImageCompare";
import "./App.css";

const API = "http://localhost:5000/api";

const defaultOptions = {
  scale: 2,
  sharpen: true,
  denoise: true,
  contrast: 1.3,
  brightness: 1.0,
  saturation: 1.2,
};

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [enhanced, setEnhanced] = useState(null);
  const [before, setBefore] = useState(null);
  const [after, setAfter] = useState(null);
  const [options, setOptions] = useState(defaultOptions);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("idle");
  const [theme, setTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const handleFile = useCallback(async (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setEnhanced(null); setBefore(null); setAfter(null); setAnalysis(null);
    setStage("analysing"); setLoading(true);

    try {
      const fd = new FormData();
      fd.append("image", f);
      const res = await fetch(`${API}/analyse`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.status === "ok") { setAnalysis(data.analysis); setStage("ready"); }
      else { alert("Analysis failed: " + (data.error || "unknown")); setStage("idle"); }
    } catch {
      alert("Cannot reach backend. Is the server running on port 5000?");
      setStage("idle");
    } finally { setLoading(false); }
  }, []);

  const handleEnhance = async () => {
    if (!file) return;
    setStage("enhancing"); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      Object.entries(options).forEach(([k, v]) => fd.append(k, String(v)));
      const res = await fetch(`${API}/enhance`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.status === "ok") {
        setEnhanced(`data:image/png;base64,${data.image}`);
        setBefore(data.before); setAfter(data.after); setStage("done");
      } else { alert("Enhancement failed: " + (data.error || "unknown")); setStage("ready"); }
    } catch (e) { alert("Enhancement error: " + e.message); setStage("ready"); }
    finally { setLoading(false); }
  };

  const handleDownload = () => {
    if (!enhanced) return;
    const a = document.createElement("a");
    a.href = enhanced;
    a.download = "enhanced_" + (file?.name || "image.png");
    a.click();
  };

  const handleReset = () => {
    setFile(null); setPreview(null); setAnalysis(null);
    setEnhanced(null); setBefore(null); setAfter(null); setStage("idle");
  };

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <div className="wordmark">
            <span className="wordmark-serif">Pix</span>
            <span className="wordmark-sans">lift</span>
          </div>
          {file && (
            <div className="file-pill" onClick={handleReset} title="Click to start over">
              <span className="file-pill-dot" />
              <span className="file-pill-name">{file.name}</span>
              <span className="file-pill-x">×</span>
            </div>
          )}
        </div>
        <div className="header-right">
          {stage === "done" && (
            <button className="btn-download" onClick={handleDownload}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Save
            </button>
          )}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M11.89 3.05l-1.06 1.06M3.05 11.89l1.06 1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 9a6 6 0 01-7-7 6 6 0 100 14 6 6 0 007-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="body">
        {/* Canvas */}
        <section className="canvas-col">
          {!file ? (
            <Dropzone onFile={handleFile} />
          ) : (
            <div className="canvas-inner">
              {stage === "done" && enhanced ? (
                <ImageCompare original={preview} enhanced={enhanced} />
              ) : (
                <div className="preview-frame">
                  <img src={preview} alt="original" className="preview-img" draggable={false} />
                  {loading && (
                    <div className="loading-veil">
                      <div className="loading-ring" />
                      <p className="loading-label">
                        {stage === "analysing" ? "Reading image…" : "Enhancing…"}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {stage === "done" && (
                <div className="compare-hint">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4 6H1M8 6h3M4 6l2-2M4 6l2 2M8 6l-2-2M8 6l-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Drag to compare
                </div>
              )}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="sidebar">
          {stage === "idle" && (
            <div className="sidebar-empty">
              <p className="serif-hint">Drop a photo<br /><em>to get started</em></p>
            </div>
          )}

          {stage === "analysing" && (
            <div className="sidebar-empty">
              <div className="sidebar-spinner" />
              <p className="sidebar-status">Analysing image…</p>
            </div>
          )}

          {(analysis || before) && stage !== "analysing" && (
            <AnalysisPanel analysis={analysis} before={before} after={after} stage={stage} />
          )}

          {(stage === "ready" || stage === "done" || stage === "enhancing") && (
            <Controls
              options={options}
              onChange={setOptions}
              onEnhance={handleEnhance}
              loading={loading}
              stage={stage}
            />
          )}
        </aside>
      </main>
    </div>
  );
}
