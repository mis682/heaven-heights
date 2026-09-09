// Persists a report-builder's in-progress rows to localStorage so a
// coordinator who fills in some fields and navigates to another page before
// clicking Save doesn't lose that work — it's restored next time this page
// loads. Unlike the server draft, this captures every edit as it happens,
// not just the last successful save.
export function saveDraft(storageKey, rows) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(rows));
  } catch (e) {
    console.warn("Could not save report draft", e);
  }
}

export function loadDraft(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (e) {
    console.warn("Could not load report draft", e);
    return null;
  }
}

export function clearDraft(storageKey) {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    /* noop */
  }
}
