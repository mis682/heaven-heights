import React, { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, RotateCcw, Maximize2, X } from "lucide-react";
import ZoomableImage from "./ZoomableImage";

async function getGeoLocation() {
  if (!navigator.geolocation) return { lat: null, lng: null, address: "" };

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let address = "";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          address = data?.display_name || "";
        } catch {
          address = "";
        }
        resolve({ lat, lng, address });
      },
      () => resolve({ lat: null, lng: null, address: "" }),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

const MAX_DIMENSION = 1600;

function stampImage(file, geo, timestamp) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dateStr = timestamp.toLocaleDateString();
        const timeStr = timestamp.toLocaleTimeString();
        const geoStr = geo.lat
          ? geo.address
            ? geo.address
            : `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}`
          : "Location unavailable";
        const label = `${dateStr} • ${timeStr} • ${geoStr}`;

        const fontSize = Math.max(14, Math.round(canvas.width / 45));
        ctx.font = `600 ${fontSize}px Inter, sans-serif`;
        const paddingX = fontSize;
        const textWidth = ctx.measureText(label).width;
        const barHeight = fontSize * 2;

        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, canvas.height - barHeight, Math.min(canvas.width, textWidth + paddingX * 2), barHeight);

        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.fillText(label, paddingX / 2, canvas.height - barHeight / 2);

        canvas.toBlob(
          (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
          "image/jpeg",
          0.9
        );
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CameraCapture({ label, onCapture, disabled, initialCapture }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState(initialCapture ? "done" : "idle"); // idle | processing | done
  const [preview, setPreview] = useState(initialCapture?.preview || null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [zoomed]);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("processing");
    const capturedAt = new Date();
    const geo = await getGeoLocation();

    try {
      const stamped = await stampImage(file, geo, capturedAt);
      setPreview(URL.createObjectURL(stamped));
      setStatus("done");
      onCapture({ file: stamped, capturedAt, geoLocation: geo });
    } catch {
      setStatus("idle");
    }
  };

  const reset = () => {
    setStatus("idle");
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onCapture(null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      {status === "done" ? (
        <div className="relative w-full">
          <button type="button" onClick={() => setZoomed(true)} className="w-full block" title="Tap to zoom">
            <img src={preview} alt={label} className="w-full h-28 object-cover rounded-xl border border-gray-200 cursor-zoom-in" />
          </button>
          <div className="absolute top-1.5 left-1.5 bg-white/90 rounded-full p-1 shadow pointer-events-none">
            <Maximize2 size={12} className="text-gray-600" />
          </div>
          <div className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 shadow">
            <CheckCircle2 size={18} className="text-green-600" />
          </div>
          <button
            type="button"
            onClick={reset}
            className="absolute bottom-1.5 right-1.5 bg-white/90 rounded-lg p-1 shadow hover:bg-white"
            title="Retake"
          >
            <RotateCcw size={14} className="text-gray-600" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || status === "processing"}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-xs font-medium transition-colors ${
            disabled
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-gray-300 text-gray-500 hover:border-primary hover:text-primary"
          }`}
        >
          <Camera size={20} />
          {status === "processing" ? "Processing..." : "Capture photo"}
        </button>
      )}
      <p className="text-xs text-subtext text-center">{label}</p>

      {zoomed && preview && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            title="Close"
          >
            <X size={22} />
          </button>
          <ZoomableImage src={preview} alt={label} />
        </div>
      )}
    </div>
  );
}
