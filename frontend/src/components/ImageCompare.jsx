import { useState, useRef, useCallback } from "react";
import "./ImageCompare.css";

export default function ImageCompare({ original, enhanced }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX) => {
    const rect = containerRef.current.getBoundingClientRect();
    const p = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 2), 98);
    setPos(p);
  }, []);

  const onMouseDown = (e) => { dragging.current = true; updatePos(e.clientX); };
  const onMouseMove = (e) => { if (dragging.current) updatePos(e.clientX); };
  const onMouseUp   = () => { dragging.current = false; };
  const onTouchMove = (e) => updatePos(e.touches[0].clientX);

  return (
    <div
      className="compare-wrap"
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* Enhanced (full) */}
      <img src={enhanced} className="compare-img compare-enhanced" alt="enhanced" draggable={false} />

      {/* Original clipped */}
      <div className="compare-original-clip" style={{ width: `${pos}%` }}>
        <img src={original} className="compare-img" alt="original" draggable={false} />
      </div>

      {/* Divider */}
      <div className="compare-handle" style={{ left: `${pos}%` }}>
        <div className="handle-line" />
        <div className="handle-knob">⇔</div>
      </div>

      {/* Labels */}
      <span className="cmp-label cmp-before" style={{ opacity: pos > 20 ? 1 : 0 }}>ORIGINAL</span>
      <span className="cmp-label cmp-after"  style={{ opacity: pos < 80 ? 1 : 0 }}>ENHANCED</span>
    </div>
  );
}
