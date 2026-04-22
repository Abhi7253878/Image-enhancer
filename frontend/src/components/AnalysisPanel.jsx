import "./AnalysisPanel.css";

function StatBar({ label, value, max = 100, unit = "", improved }) {
  return (
    <div className="stat-bar-row">
      <div className="stat-bar-meta">
        <span className="stat-bar-label">{label}</span>
        <span className={`stat-bar-val ${improved === true ? "improved" : improved === false ? "worse" : ""}`}>
          {value}{unit}
        </span>
      </div>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Delta({ label, before, after, unit = "", lowerIsBetter = false }) {
  const changed = after != null && after !== before;
  const better = after != null && (lowerIsBetter ? after < before : after > before);

  return (
    <div className="delta-row">
      <span className="delta-label">{label}</span>
      <div className="delta-vals">
        <span className="delta-before">{before}{unit}</span>
        {after != null && (
          <>
            <span className="delta-arrow">→</span>
            <span className={`delta-after ${better ? "better" : changed ? "worse" : ""}`}>
              {after}{unit}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function AnalysisPanel({ analysis, before, after, stage }) {
  const a = before || analysis;
  const b = after;
  if (!a) return null;

  return (
    <div className="analysis-panel">
      {/* Header */}
      <div className="ap-header">
        <span className="ap-title">Analysis</span>
        <span className="ap-dim">{a.width} × {a.height}</span>
      </div>

      {/* Quality bars (before only) */}
      {!b && (
        <div className="ap-bars">
          <StatBar label="Sharpness"  value={a.sharpness_score}  unit="%" />
          <StatBar label="Brightness" value={a.brightness_pct}   unit="%" />
          <StatBar label="Saturation" value={a.saturation_pct}   unit="%" />
        </div>
      )}

      {/* Before/After deltas */}
      {b && (
        <div className="ap-deltas">
          <div className="ap-deltas-label">Before → After</div>
          <Delta label="Resolution" before={`${a.width}×${a.height}`} after={`${b.width}×${b.height}`} />
          <Delta label="Sharpness"  before={a.sharpness_score} after={b.sharpness_score} unit="%" />
          <Delta label="Contrast"   before={a.contrast_ratio}  after={b.contrast_ratio} />
          <Delta label="Noise"      before={a.noise_level}     after={b.noise_level} lowerIsBetter />
          <Delta label="Brightness" before={a.brightness_pct}  after={b.brightness_pct} unit="%" />
        </div>
      )}

      {/* Dominant colours */}
      <div className="ap-colours">
        <span className="ap-colours-label">Palette</span>
        <div className="ap-swatches">
          {a.dominant_colours.map((c, i) => (
            <div key={i} className="ap-swatch" title={`${c.hex} · ${c.percent}%`}>
              <div className="ap-swatch-color" style={{ background: c.hex }} />
              <span className="ap-swatch-pct">{c.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Done badge */}
      {stage === "done" && b && (
        <div className="ap-done-badge">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 6.5l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Enhanced to {b.megapixels}MP
        </div>
      )}
    </div>
  );
}
