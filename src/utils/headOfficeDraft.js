// Same as utils/regalGardenDraft.js — keyed by checkpoint label, since
// Head Office's forms use named checklists too.
const PREFIX = "head-office-draft-";

function draftKey(formNumber) {
  const today = new Date().toISOString().slice(0, 10);
  return `${PREFIX}${formNumber}-${today}`;
}

// Downscales to a JPEG before persisting — the full-resolution file is what
// actually gets uploaded (this is only for local draft recovery). Head
// Office's forms run up to 25 photo checkpoints, and localStorage's
// per-origin quota (~5-10MB) is shared across every form's draft, not
// per-form — storing full-resolution captures here was blowing through that
// shared budget and (on some browsers) wiping out other forms' already-saved
// drafts, not just failing to save the new one.
const DRAFT_MAX_DIMENSION = 1000;
const DRAFT_JPEG_QUALITY = 0.6;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, DRAFT_MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", DRAFT_JPEG_QUALITY));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToFile(dataUrl, filename) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

export async function saveDraft(formNumber, submittedBy, captures, textAnswers) {
  try {
    const serializable = {};
    for (const [checkpointLabel, cap] of Object.entries(captures)) {
      if (!cap) continue;
      const dataUrl = await fileToDataUrl(cap.file);
      serializable[checkpointLabel] = {
        dataUrl,
        fileName: cap.file.name,
        capturedAt: cap.capturedAt,
        geoLocation: cap.geoLocation,
      };
    }
    localStorage.setItem(draftKey(formNumber), JSON.stringify({ submittedBy, captures: serializable, textAnswers }));
  } catch (e) {
    console.warn("Could not save Head Office draft", e);
  }
}

export function loadDraft(formNumber) {
  try {
    const raw = localStorage.getItem(draftKey(formNumber));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const captures = {};
    Object.entries(parsed.captures || {}).forEach(([checkpointLabel, saved]) => {
      captures[checkpointLabel] = {
        file: dataUrlToFile(saved.dataUrl, saved.fileName),
        capturedAt: saved.capturedAt,
        geoLocation: saved.geoLocation,
        preview: saved.dataUrl,
      };
    });
    return { submittedBy: parsed.submittedBy || "", captures, textAnswers: parsed.textAnswers || {} };
  } catch (e) {
    console.warn("Could not load Head Office draft", e);
    return null;
  }
}

export function clearDraft(formNumber) {
  try {
    localStorage.removeItem(draftKey(formNumber));
  } catch {
    /* noop */
  }
}
