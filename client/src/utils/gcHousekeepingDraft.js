// Persists in-progress checkpoint captures to localStorage so a killed
// browser tab (very common on Android when the native camera app takes
// over memory) doesn't wipe out photos already taken earlier in the round —
// same approach as utils/patrolDraft.js, keyed by form number instead of site.
const PREFIX = "gc-housekeeping-draft-";

function draftKey(formNumber) {
  const today = new Date().toISOString().slice(0, 10);
  return `${PREFIX}${formNumber}-${today}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
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

export async function saveDraft(formNumber, submittedBy, captures) {
  try {
    const serializable = {};
    for (const [checkpointId, cap] of Object.entries(captures)) {
      if (!cap) continue;
      const dataUrl = await fileToDataUrl(cap.file);
      serializable[checkpointId] = {
        dataUrl,
        fileName: cap.file.name,
        capturedAt: cap.capturedAt,
        geoLocation: cap.geoLocation,
      };
    }
    localStorage.setItem(draftKey(formNumber), JSON.stringify({ submittedBy, captures: serializable }));
  } catch (e) {
    console.warn("Could not save GC housekeeping draft", e);
  }
}

export function loadDraft(formNumber) {
  try {
    const raw = localStorage.getItem(draftKey(formNumber));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const captures = {};
    Object.entries(parsed.captures || {}).forEach(([checkpointId, saved]) => {
      captures[checkpointId] = {
        file: dataUrlToFile(saved.dataUrl, saved.fileName),
        capturedAt: saved.capturedAt,
        geoLocation: saved.geoLocation,
        preview: saved.dataUrl,
      };
    });
    return { submittedBy: parsed.submittedBy || "", captures };
  } catch (e) {
    console.warn("Could not load GC housekeeping draft", e);
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
