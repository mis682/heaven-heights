import { apiOrigin } from "./client";

export const MAX_VIDEO_SECONDS = 20;

// Reads a video file's duration without uploading it, by loading it into an
// offscreen <video> element — lets the form reject an over-length video the
// moment it's picked, before any network call.
export function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Could not read video"));
    };
    video.src = URL.createObjectURL(file);
  });
}

// Fire Mock Drill's own upload path — relays the file through our server
// (which compresses videos, then pushes everything to Google Drive) instead
// of the direct-to-Cloudinary flow every other module's forms use (see
// api/cloudinaryDirectUpload.js). Videos can take a few seconds to compress
// server-side on top of the upload itself, so this reports upload progress
// the same way uploadVideoDirect did, even though the full round-trip now
// includes that extra compression step after the progress bar reaches 100%.
export function uploadFireMockDrillFile(file, onProgress) {
  const form = new FormData();
  form.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiOrigin}/api/fire-mock-drill/upload`);
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText).url);
      } else {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(form);
  });
}
