import React, { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.5;
const DOUBLE_TAP_ZOOM = 2.5;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP = 30;

function clampScale(s) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
}

// Pinch-to-zoom + pan + double-tap/double-click + explicit +/- buttons,
// dependency-free via the Pointer Events API (unifies touch and mouse) —
// used anywhere a photo needs mobile-style maximize/minimize, not just a
// static "fit to screen" view.
export default function ZoomableImage({ src, alt }) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const pinchStart = useRef(null);
  const panStart = useRef(null);
  const lastTap = useRef({ time: 0, x: 0, y: 0 });

  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [src]);

  const distanceBetween = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const toggleZoom = () => {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(DOUBLE_TAP_ZOOM);
    }
  };

  const zoomBy = (delta) => {
    setScale((s) => {
      const next = clampScale(s + delta);
      if (next <= MIN_SCALE) setTranslate({ x: 0, y: 0 });
      return next;
    });
  };

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: distanceBetween(a, b), scale };
      panStart.current = null;
    } else if (pointers.current.size === 1) {
      panStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y };

      const now = Date.now();
      const closeToLastTap = Math.hypot(e.clientX - lastTap.current.x, e.clientY - lastTap.current.y) < DOUBLE_TAP_SLOP;
      if (now - lastTap.current.time < DOUBLE_TAP_MS && closeToLastTap) {
        toggleZoom();
        lastTap.current = { time: 0, x: 0, y: 0 };
      } else {
        lastTap.current = { time: now, x: e.clientX, y: e.clientY };
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = distanceBetween(a, b);
      setScale(clampScale(pinchStart.current.scale * (dist / pinchStart.current.dist)));
    } else if (pointers.current.size === 1 && panStart.current && scale > 1) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setTranslate({ x: panStart.current.tx + dx, y: panStart.current.ty + dy });
    }
  };

  const handlePointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      panStart.current = null;
      if (scale <= 1) setTranslate({ x: 0, y: 0 });
    }
  };

  const isInteracting = pointers.current.size > 0;

  return (
    <div className="absolute inset-0">
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: "none", cursor: scale > 1 ? "grab" : "zoom-in" }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="max-h-full max-w-full object-contain rounded-lg"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: isInteracting ? "none" : "transform 0.15s ease-out",
          }}
        />
      </div>

      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 rounded-full p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => zoomBy(-ZOOM_STEP)}
          disabled={scale <= MIN_SCALE}
          className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <span className="text-white text-xs w-11 text-center select-none">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={() => zoomBy(ZOOM_STEP)}
          disabled={scale >= MAX_SCALE}
          className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
      </div>
    </div>
  );
}
