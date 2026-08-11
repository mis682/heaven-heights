import { apiOrigin } from "./client";

async function getVideoUploadSignature() {
  const res = await fetch(`${apiOrigin}/api/fire-mock-drill/upload-signature`);
  if (!res.ok) throw new Error("Could not prepare video upload");
  return res.json();
}

// Uploads a video straight from the browser to Cloudinary using a
// server-issued signature, instead of relaying the file through our own
// server first — halves the transfer time and avoids tying up server
// bandwidth for large files.
export async function uploadVideoDirect(file, onProgress) {
  const { signature, timestamp, apiKey, cloudName, folder } = await getVideoUploadSignature();

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);
  form.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText).secure_url);
      } else {
        reject(new Error("Video upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Video upload failed"));
    xhr.send(form);
  });
}
