import "./Controls.css";

function Slider({ label, value, min, max, step, onChange, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider-row">
      <div className="slider-meta">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{format ? format(value) : value}</span>
      </div>
      <div className="slider-track-wrap">
        <input
          type="range" min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          style={{ "--pct": `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Controls({ options, onChange, onEnhance, loading, stage }) {
  const set = (key, val) => onChange({ ...options, [key]: val });

  return (
    <div className="controls">
      <div className="ctrl-section-label">Upscale</div>

      <div className="scale-buttons">
        {[1, 2, 3, 4].map(v => (
          <button
            key={v}
            className={`scale-btn ${options.scale === v ? "active" : ""}`}
            onClick={() => set("scale", v)}
          >
            {v}×
          </button>
        ))}
      </div>

      <div className="ctrl-divider" />
      <div className="ctrl-section-label">Adjustments</div>

      <Slider label="Contrast"   value={options.contrast}   min={0.5} max={2.5} step={0.05}
        onChange={v => set("contrast", v)}   format={v => v.toFixed(2)} />
      <Slider label="Brightness" value={options.brightness} min={0.5} max={2.0} step={0.05}
        onChange={v => set("brightness", v)} format={v => v.toFixed(2)} />
      <Slider label="Saturation" value={options.saturation} min={0.0} max={3.0} step={0.05}
        onChange={v => set("saturation", v)} format={v => v.toFixed(2)} />

      <div className="ctrl-divider" />
      <div className="ctrl-section-label">Processing</div>

      <div className="toggles">
        <label className="toggle">
          <input type="checkbox" checked={options.sharpen}
            onChange={e => set("sharpen", e.target.checked)} />
          <div className="toggle-text">
            <span className="toggle-name">Sharpen</span>
            <span className="toggle-desc">Unsharp mask on edges</span>
          </div>
        </label>
        <label className="toggle">
          <input type="checkbox" checked={options.denoise}
            onChange={e => set("denoise", e.target.checked)} />
          <div className="toggle-text">
            <span className="toggle-name">Denoise</span>
            <span className="toggle-desc">Bilateral noise reduction</span>
          </div>
        </label>
      </div>

      <button
        className="enhance-btn"
        onClick={onEnhance}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="enhance-spinner" />
            Processing…
          </>
        ) : stage === "done" ? (
          "Re-enhance"
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M3.05 3.05l1.42 1.42M10.53 10.53l1.42 1.42M10.53 3.05l-1.42 1.42M3.05 10.53l1.42 1.42" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Enhance
          </>
        )}
      </button>
    </div>
  );
}
