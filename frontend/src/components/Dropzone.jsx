import { useCallback, useState } from "react";
import "./Dropzone.css";

export default function Dropzone({ onFile }) {
  const [dragging, setDragging] = useState(false);

  const process = (f) => {
    if (!f || !f.type.startsWith("image/")) return alert("Please drop an image file.");
    onFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    process(e.dataTransfer.files[0]);
  }, []);

  return (
    <label
      className={`dropzone ${dragging ? "dragging" : ""}`}
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
    >
      <input
        type="file" accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => process(e.target.files[0])}
      />
      <div className="dz-content">
        <div className="dz-icon-wrap">
          <svg className="dz-icon" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="11" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 22l6-5 5 4 4-3.5L28 22" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="dz-text">
          <p className="dz-title">
            <span className="dz-serif">Drop</span> your image here
          </p>
          <p className="dz-sub">or <span className="dz-link">browse files</span></p>
          <p className="dz-formats">JPG · PNG · WebP · BMP</p>
        </div>
      </div>
    </label>
  );
}
