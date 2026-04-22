import "./Controls.css";

export default function Controls({ options, onChange, onEnhance, loading, stage }) {
  const set = (key, val) => onChange({ ...options, [key]: val });

  return (
    <div className="controls">
      <div className="ctrl-header">
        <span className="ctrl-title">ENHANCE SETTINGS</span>
      </div>

      <div className="ctrl-group">
        <label className="ctrl-label">
          Upscale Factor
          <span className="ctrl-value">{options.scale}×</span>
        </label>
        <input
          type="range" min="1" max="4" step="1"
          value={options.scale}
          onChange={(e) => set("scale", +e.target.value)}
        />
        <div className="range-ticks">
          {[1,2,3,4].map(v => (
            <span key={v} className={options.scale === v ? "tick active" : "tick"}>{v}×</span>
          ))}
        </div>
      </div>

      <div className="ctrl-group">
        <label className="ctrl-label">
          Contrast
          <span className="ctrl-value">{options.contrast.toFixed(1)}</span>
        </label>
        <input
          type="range" min="0.5" max="2.5" step="0.1"
          value={options.contrast}
          onChange={(e) => set("contrast", +e.target.value)}
        />
      </div>

      <div className="ctrl-group">
        <label className="ctrl-label">
          Brightness
          <span className="ctrl-value">{options.brightness.toFixed(1)}</span>
        </label>
        <input
          type="range" min="0.5" max="2.0" step="0.1"
          value={options.brightness}
          onChange={(e) => set("brightness", +e.target.value)}
        />
      </div>

      <div className="ctrl-group">
        <label className="ctrl-label">
          Saturation
          <span className="ctrl-value">{options.saturation.toFixed(1)}</span>
        </label>
        <input
          type="range" min="0.0" max="3.0" step="0.1"
          value={options.saturation}
          onChange={(e) => set("saturation", +e.target.value)}
        />
      </div>

      <div className="ctrl-toggles">
        <label className="toggle-item">
          <input
            type="checkbox"
            checked={options.sharpen}
            onChange={(e) => set("sharpen", e.target.checked)}
          />
          <span>Unsharp Mask (Sharpen)</span>
        </label>
        <label className="toggle-item">
          <input
            type="checkbox"
            checked={options.denoise}
            onChange={(e) => set("denoise", e.target.checked)}
          />
          <span>Bilateral Denoise</span>
        </label>
      </div>

      <button
        className="btn-enhance"
        onClick={onEnhance}
        disabled={loading}
      >
        {loading ? (
          <span>Processing…</span>
        ) : stage === "done" ? (
          <span>↺ Re-Enhance</span>
        ) : (
          <span>⚡ Enhance Image</span>
        )}
      </button>
    </div>
  );
}
