import api from "./client";

export const startGCHousekeepingSubmission = (formNumber, submittedBy) =>
  api.post("/gc-housekeeping/submissions/start", { formNumber, submittedBy }).then((r) => r.data);

// Uploads a single checkpoint's photo immediately — the caller doesn't wait
// for all checkpoints to be done before saving, so an interrupted session
// only ever loses whatever checkpoint was still being uploaded.
export const addGCHousekeepingPhoto = (submissionId, { checkpointId, file, capturedAt, geoLocation }) => {
  const form = new FormData();
  form.append("checkpointId", checkpointId);
  form.append("photo", file);
  if (capturedAt) form.append("capturedAt", capturedAt);
  if (geoLocation) form.append("geoLocation", JSON.stringify(geoLocation));
  return api
    .post(`/gc-housekeeping/submissions/${submissionId}/photo`, form, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};

export const finalizeGCHousekeepingSubmission = (submissionId) =>
  api.post(`/gc-housekeeping/submissions/${submissionId}/finalize`).then((r) => r.data);

export const listGCHousekeepingSubmissions = (params = {}) =>
  api.get("/gc-housekeeping/submissions", { params }).then((r) => r.data);

export const getGCHousekeepingSubmission = (id) => api.get(`/gc-housekeeping/submissions/${id}`).then((r) => r.data);
