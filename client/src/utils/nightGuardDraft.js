// Same purpose as patrolDraft.js — persists in-progress form state to
// localStorage so a killed browser tab (e.g. the OS reclaiming memory while
// the native camera app is open) doesn't wipe out the guard's selections
// and photo before they get a chance to submit.
const PREFIX = "nightguard-draft-";

function draftKey() {
  const today = new Date().toISOString().slice(0, 10);
  return `${PREFIX}${today}`;
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

export async function saveDraft(projectName, guardName, capture) {
  try {
    let capturePayload = null;
    if (capture) {
      const dataUrl = await fileToDataUrl(capture.file);
      capturePayload = {
        dataUrl,
        fileName: capture.file.name,
        capturedAt: capture.capturedAt,
        geoLocation: capture.geoLocation,
      };
    }
    localStorage.setItem(draftKey(), JSON.stringify({ projectName, guardName, capture: capturePayload }));
  } catch (e) {
    console.warn("Could not save night guard draft", e);
  }
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(draftKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    let capture = null;
    if (parsed.capture) {
      capture = {
        file: dataUrlToFile(parsed.capture.dataUrl, parsed.capture.fileName),
        capturedAt: parsed.capture.capturedAt,
        geoLocation: parsed.capture.geoLocation,
        preview: parsed.capture.dataUrl,
      };
    }
    return { projectName: parsed.projectName || "", guardName: parsed.guardName || "", capture };
  } catch (e) {
    console.warn("Could not load night guard draft", e);
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(draftKey());
  } catch {
    /* noop */
  }
}
