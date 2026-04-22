import { useState, useRef, useCallback, useEffect } from "react";
import "./ImageCompare.css";

export default function ImageCompare({ original, enhanced }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);

  const calc = useCallback((clientX) => {
    const r = ref.current.getBoundingClientRect();
    return Math.min(Math.max(((clientX - r.left) / r.width) * 100, 1), 99);
  }, []);

  const onMouseDown = (e) => { setDragging(true); setPos(calc(e.clientX)); };
  const onTouchStart = (e) => { setDragging(true); setPos(calc(e.touches[0].clientX)); };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(calc(x));
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, calc]);

  return (
    <div
      className={`compare ${dragging ? "grabbing" : ""}`}
      ref={ref}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Enhanced full */}
      <img src={enhanced} className="cmp-img cmp-enhanced" alt="enhanced" draggable={false} />

      {/* Original clipped */}
   {/* Original clipped */}
<div className="cmp-original" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
  <img src={original} className="cmp-img" alt="original" draggable={false} />
</div>

      {/* Divider */}
      <div className="cmp-divider" style={{ left: `${pos}%` }}>
        <div className="cmp-line" />
        <div className={`cmp-knob ${dragging ? "active" : ""}`}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M6 9H1M12 9h5M6 9l3-3M6 9l3 3M12 9l-3-3M12 9l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="cmp-tag cmp-tag-left"  style={{ opacity: pos > 15 ? 1 : 0 }}>Original</span>
      <span className="cmp-tag cmp-tag-right" style={{ opacity: pos < 85 ? 1 : 0 }}>Enhanced</span>
    </div>
  );
}
