import { useCallback, useState } from "react";
import "./Dropzone.css";

export default function Dropzone({ onFile }) {
  const [dragging, setDragging] = useState(false);

  const process = (f) => {
    if (!f || !f.type.startsWith("image/")) return alert("Please drop an image file.");
    onFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    process(f);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <label
      className={`dropzone ${dragging ? "dragging" : ""}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => process(e.target.files[0])}
      />
      <div className="dz-inner">
        <div className="dz-icon">⬡</div>
        <p className="dz-title">Drop image here</p>
        <p className="dz-sub">or click to browse — JPG, PNG, WebP, BMP</p>
        <div className="dz-badge">No API key · 100% local model</div>
      </div>
    </label>
  );
}
