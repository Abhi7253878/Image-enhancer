import { useState, useCallback } from "react";
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
  const [stage, setStage] = useState("idle"); // idle | analysing | enhancing | done

  const handleFile = useCallback(async (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setEnhanced(null);
    setBefore(null);
    setAfter(null);
    setAnalysis(null);
    setStage("analysing");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("image", f);
      const res = await fetch(`${API}/analyse`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.status === "ok") {
        setAnalysis(data.analysis);
        setStage("ready");
      } else {
        alert("Analysis failed: " + (data.error || "unknown"));
        setStage("idle");
      }
    } catch (e) {
      alert("Cannot reach backend. Is the server running on port 5000?");
      setStage("idle");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEnhance = async () => {
    if (!file) return;
    setStage("enhancing");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      Object.entries(options).forEach(([k, v]) => fd.append(k, String(v)));

      const res = await fetch(`${API}/enhance`, { method: "POST", body: fd });
      const data = await res.json();

      if (data.status === "ok") {
        setEnhanced(`data:image/png;base64,${data.image}`);
        setBefore(data.before);
        setAfter(data.after);
        setStage("done");
      } else {
        alert("Enhancement failed: " + (data.error || "unknown"));
        setStage("ready");
      }
    } catch (e) {
      alert("Enhancement error: " + e.message);
      setStage("ready");
    } finally {
      setLoading(false);
    }
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
    setEnhanced(null); setBefore(null); setAfter(null);
    setStage("idle");
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">PIXLIFT</span>
        </div>
        <div className="header-tag">Local AI · No API Key · Fully Offline</div>
      </header>

      <main className="app-main">
        {/* LEFT COLUMN */}
        <section className="col-left">
          {!file ? (
            <Dropzone onFile={handleFile} />
          ) : (
            <div className="image-area">
              {stage === "done" && enhanced ? (
                <ImageCompare original={preview} enhanced={enhanced} />
              ) : (
                <div className="preview-wrap">
                  <img src={preview} alt="original" className="preview-img" />
                  {loading && (
                    <div className="overlay-loading">
                      <div className="spinner" />
                      <span>{stage === "analysing" ? "Analysing…" : "Enhancing…"}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="image-actions">
                <button className="btn-ghost" onClick={handleReset}>↺ New Image</button>
                {stage === "done" && (
                  <button className="btn-accent" onClick={handleDownload}>⬇ Download Enhanced</button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN */}
        <section className="col-right">
          {analysis && (
            <AnalysisPanel
              analysis={analysis}
              before={before}
              after={after}
              stage={stage}
            />
          )}

          {(stage === "ready" || stage === "done") && (
            <Controls
              options={options}
              onChange={setOptions}
              onEnhance={handleEnhance}
              loading={loading}
              stage={stage}
            />
          )}

          {stage === "idle" && (
            <div className="idle-hint">
              <p className="mono muted">// drop an image to begin</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
