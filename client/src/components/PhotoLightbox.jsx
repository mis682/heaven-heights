import React, { useEffect } from "react";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cloudinaryDownloadUrl } from "../utils/cloudinary";
import ZoomableImage from "./ZoomableImage";

export default function PhotoLightbox({ photos, index, onClose, onNavigate, caption, downloadName }) {
  const photo = photos[index];

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && photos.length > 1) onNavigate((index - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight" && photos.length > 1) onNavigate((index + 1) % photos.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, photos.length, onClose, onNavigate]);

  if (!photo) return null;

  const url = photo.photoUrl || photo.guardPhotoUrl;
  const fileName = downloadName ? downloadName(photo, index) : `photo-${index + 1}`;

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
        <p className="text-sm">{caption ? caption(photo, index) : null}</p>
        <div className="flex items-center gap-2">
          <a
            href={cloudinaryDownloadUrl(url, fileName)}
            className="p-2 rounded-lg hover:bg-white/10"
            title="Download photo"
          >
            <Download size={20} />
          </a>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10" title="Close">
            <X size={20} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center relative px-4 pb-4 min-h-0"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {photos.length > 1 && (
          <button
            onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
            className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            title="Previous"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <ZoomableImage src={url} alt="" />
        {photos.length > 1 && (
          <button
            onClick={() => onNavigate((index + 1) % photos.length)}
            className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            title="Next"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
