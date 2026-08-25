// Photos now upload to the server as soon as they're captured (see
// GCHousekeepingPublicForm.jsx), so there's nothing heavy to persist here
// any more — just the in-progress submission's id and who's filling it in,
// so a killed tab can resume by re-fetching the submission from the server
// instead of replaying base64 photos out of localStorage (which used to
// risk silently hitting the quota on a ~40-photo form and losing
// everything past that point).
const PREFIX = "gc-housekeeping-session-";

function draftKey(formNumber) {
  const today = new Date().toISOString().slice(0, 10);
  return `${PREFIX}${formNumber}-${today}`;
}

export function saveSession(formNumber, submissionId, submittedBy) {
  try {
    localStorage.setItem(draftKey(formNumber), JSON.stringify({ submissionId, submittedBy }));
  } catch (e) {
    console.warn("Could not save GC housekeeping session", e);
  }
}

export function loadSession(formNumber) {
  try {
    const raw = localStorage.getItem(draftKey(formNumber));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Could not load GC housekeeping session", e);
    return null;
  }
}

export function clearSession(formNumber) {
  try {
    localStorage.removeItem(draftKey(formNumber));
  } catch {
    /* noop */
  }
}
