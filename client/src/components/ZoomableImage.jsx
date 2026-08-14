import React, { useEffect, useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_ZOOM = 2.5;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP = 30;

// Pinch-to-zoom + pan + double-tap/double-click, dependency-free via the
// Pointer Events API (unifies touch and mouse) — used anywhere a photo
// needs mobile-style maximize/minimize, not just a static "fit to screen" view.
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
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchStart.current.scale * (dist / pinchStart.current.dist)));
      setScale(nextScale);
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
    <div
      className="inline-block overflow-hidden select-none max-h-full max-w-full"
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
        className="max-h-full max-w-full object-contain rounded-lg mx-auto"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transition: isInteracting ? "none" : "transform 0.15s ease-out",
        }}
      />
    </div>
  );
}
