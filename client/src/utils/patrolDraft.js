// Persists in-progress checkpoint captures to localStorage so a killed
// browser tab (very common on Android when the native camera app takes
// over memory) doesn't wipe out photos already taken earlier in the round.
const PREFIX = "patrol-draft-";

function draftKey(slug) {
  const today = new Date().toISOString().slice(0, 10);
  return `${PREFIX}${slug}-${today}`;
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

export async function saveDraft(slug, guardName, captures) {
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
    localStorage.setItem(draftKey(slug), JSON.stringify({ guardName, captures: serializable }));
  } catch (e) {
    console.warn("Could not save patrol draft", e);
  }
}

export function loadDraft(slug) {
  try {
    const raw = localStorage.getItem(draftKey(slug));
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
    return { guardName: parsed.guardName || "", captures };
  } catch (e) {
    console.warn("Could not load patrol draft", e);
    return null;
  }
}

export function clearDraft(slug) {
  try {
    localStorage.removeItem(draftKey(slug));
  } catch {
    /* noop */
  }
}
