import { apiOrigin } from "./client";

async function getVideoUploadSignature() {
  const res = await fetch(`${apiOrigin}/api/fire-mock-drill/upload-signature`);
  if (!res.ok) throw new Error("Could not prepare video upload");
  return res.json();
}

async function getUploadSignature(account, resourceType) {
  const res = await fetch(`${apiOrigin}/api/media/upload-signature`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account, resourceType }),
  });
  if (!res.ok) throw new Error("Could not prepare upload");
  return res.json();
}

// General-purpose version of uploadVideoDirect below — straight to
// Cloudinary from the browser, so a multi-photo submission (patrol
// checkpoints, club checklists) never has to relay large payloads through a
// serverless function's execution-time limit. `account` picks which
// Cloudinary credentials/folder to use ("main" or "housekeeping");
// `resourceType` is "image" (default), "video", or "raw".
export async function uploadFileDirect(file, { account = "main", resourceType = "image" } = {}) {
  const { signature, timestamp, apiKey, cloudName, folder, transformation } = await getUploadSignature(
    account,
    resourceType
  );

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);
  form.append("folder", folder);
  if (transformation) form.append("transformation", transformation);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url;
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
