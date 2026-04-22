import "./AnalysisPanel.css";

function Swatch({ hex, pct }) {
  return (
    <div className="swatch" title={`${hex} — ${pct}%`}>
      <div className="swatch-color" style={{ background: hex }} />
      <span className="swatch-pct">{pct}%</span>
    </div>
  );
}

function StatRow({ label, before, after, unit = "", good = "high" }) {
  const improved = after != null && (good === "high" ? after > before : after < before);
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <div className="stat-vals">
        <span className="stat-before">{before}{unit}</span>
        {after != null && (
          <>
            <span className="stat-arrow">→</span>
            <span className={`stat-after ${improved ? "green" : ""}`}>{after}{unit}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function AnalysisPanel({ analysis, before, after, stage }) {
  const show = before || analysis;
  if (!show) return null;

  const a = before || analysis;
  const b = after;

  return (
    <div className="analysis-panel">
      <div className="ap-header">
        <span className="ap-title">IMAGE ANALYSIS</span>
        <span className="ap-dim">{a.width}×{a.height} · {a.megapixels}MP</span>
      </div>

      <div className="ap-stats">
        <StatRow label="Sharpness" before={a.sharpness_score} after={b?.sharpness_score} unit="%" />
        <StatRow label="Contrast Ratio" before={a.contrast_ratio} after={b?.contrast_ratio} />
        <StatRow label="Brightness" before={a.brightness_pct} after={b?.brightness_pct} unit="%" />
        <StatRow label="Saturation" before={a.saturation_pct} after={b?.saturation_pct} unit="%" />
        <StatRow label="Noise Level" before={a.noise_level} after={b?.noise_level} good="low" />
        {b && <StatRow label="Resolution" before={`${a.width}×${a.height}`} after={`${b.width}×${b.height}`} />}
      </div>

      <div className="ap-colours">
        <span className="ap-label">DOMINANT COLOURS</span>
        <div className="swatches">
          {a.dominant_colours.map((c, i) => (
            <Swatch key={i} hex={c.hex} pct={c.percent} />
          ))}
        </div>
      </div>

      {stage === "done" && b && (
        <div className="ap-badge">
          ✓ Enhanced to {b.width}×{b.height} ({b.megapixels}MP)
        </div>
      )}
    </div>
  );
}
