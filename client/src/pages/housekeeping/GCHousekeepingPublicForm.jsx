import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ClipboardList, CheckCircle2, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import CameraCapture from "../../components/CameraCapture";
import {
  startGCHousekeepingSubmission,
  addGCHousekeepingPhoto,
  finalizeGCHousekeepingSubmission,
  getGCHousekeepingSubmission,
} from "../../api/gcHousekeeping";
import { GC_HOUSEKEEPING_FORMS } from "../../layouts/navConfig";
import { saveSession, loadSession, clearSession } from "../../utils/gcHousekeepingDraft";

// Each checkpoint photo uploads to the server the moment it's captured
// (instead of holding all ~40 in browser memory/localStorage until a final
// bulk submit) — a call interrupting the round, or the OS killing the tab,
// only ever costs whichever single checkpoint was mid-upload, not the
// whole form. Resuming re-fetches the in-progress submission from the
// server rather than replaying anything out of localStorage.
export default function GCHousekeepingPublicForm() {
  const { formNumber } = useParams();
  const form = GC_HOUSEKEEPING_FORMS.find((f) => f.formNumber === Number(formNumber));

  const [sessionChecked, setSessionChecked] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [submittedBy, setSubmittedBy] = useState("");
  const [captures, setCaptures] = useState({}); // checkpointId -> CameraCapture initialCapture shape
  const [captureStatus, setCaptureStatus] = useState({}); // checkpointId -> 'uploading' | 'done' | 'error'
  const [restoredNotice, setRestoredNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!form) return;
    (async () => {
      const session = loadSession(form.formNumber);
      if (session?.submissionId) {
        try {
          const existing = await getGCHousekeepingSubmission(session.submissionId);
          if (existing && existing.status !== "submitted") {
            const restoredCaptures = {};
            const restoredStatus = {};
            existing.photos.forEach((p) => {
              restoredCaptures[p.checkpointId] = { preview: p.photoUrl, capturedAt: p.capturedAt, geoLocation: p.geoLocation };
              restoredStatus[p.checkpointId] = "done";
            });
            setSubmissionId(existing._id);
            setSubmittedBy(existing.submittedBy);
            setCaptures(restoredCaptures);
            setCaptureStatus(restoredStatus);
            if (existing.photos.length > 0) setRestoredNotice(true);
          } else {
            clearSession(form.formNumber);
          }
        } catch {
          clearSession(form.formNumber);
        }
      }
      setSessionChecked(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!form) {
    return <CenteredMessage title="Form not found" message="This Garden City housekeeping form link is invalid." />;
  }

  if (!sessionChecked) {
    return <CenteredMessage title="Loading..." message="Preparing checklist" />;
  }

  if (done) {
    return (
      <CenteredMessage
        title="Submitted"
        message="Checkpoint photos have been recorded. Thank you."
        icon={<CheckCircle2 size={28} className="text-green-600" />}
      />
    );
  }

  const checkpointIds = [];
  for (let id = form.checkpointStart; id <= form.checkpointEnd; id += 1) checkpointIds.push(id);

  const missingCount = checkpointIds.filter((id) => captureStatus[id] !== "done").length;
  const allCaptured = missingCount === 0;
  const anyUploading = Object.values(captureStatus).some((s) => s === "uploading");

  const handleCapture = async (checkpointId, cap) => {
    if (!cap) {
      setCaptures((prev) => ({ ...prev, [checkpointId]: null }));
      setCaptureStatus((prev) => ({ ...prev, [checkpointId]: undefined }));
      return;
    }

    setCaptures((prev) => ({ ...prev, [checkpointId]: cap }));
    setCaptureStatus((prev) => ({ ...prev, [checkpointId]: "uploading" }));

    try {
      let sid = submissionId;
      if (!sid) {
        const created = await startGCHousekeepingSubmission(form.formNumber, submittedBy);
        sid = created._id;
        setSubmissionId(sid);
        saveSession(form.formNumber, sid, submittedBy);
      }
      await addGCHousekeepingPhoto(sid, {
        checkpointId,
        file: cap.file,
        capturedAt: cap.capturedAt,
        geoLocation: cap.geoLocation,
      });
      setCaptureStatus((prev) => ({ ...prev, [checkpointId]: "done" }));
    } catch {
      setCaptureStatus((prev) => ({ ...prev, [checkpointId]: "error" }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await finalizeGCHousekeepingSubmission(submissionId);
      clearSession(form.formNumber);
      setDone(true);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-heading text-lg">Garden City Housekeeping — {form.label}</p>
            <p className="text-sm text-subtext">
              Capture a photo for checkpoints {form.checkpointStart}–{form.checkpointEnd}.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
          {restoredNotice && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <RefreshCw size={13} />
              Aapke pehle upload kiye gaye photos safe hain — bas baaki checkpoints puri karein.
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aapka Naam</label>
            <input
              required
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              disabled={Boolean(submissionId)}
              className="input disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Apna naam likhein"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {checkpointIds.map((id) => (
              <div key={id} className="space-y-1">
                <CameraCapture
                  label={`Checkpoint ${id}`}
                  initialCapture={captures[id]}
                  onCapture={(cap) => handleCapture(id, cap)}
                  disabled={!submittedBy}
                  allowGallery
                />
                {captureStatus[id] === "uploading" && (
                  <p className="text-[11px] text-amber-600 flex items-center gap-1 justify-center">
                    <Loader2 size={11} className="animate-spin" /> Saving...
                  </p>
                )}
                {captureStatus[id] === "done" && <p className="text-[11px] text-green-600 text-center">Saved</p>}
                {captureStatus[id] === "error" && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1 justify-center">
                    <AlertTriangle size={11} /> Failed — retake
                  </p>
                )}
              </div>
            ))}
          </div>

          {!allCaptured && (
            <p className="text-xs text-amber-600 text-center">
              Baaki {missingCount} checkpoint{missingCount > 1 ? "s" : ""} ki photo lena zaroori hai submit karne se pehle.
            </p>
          )}

          <button
            type="submit"
            disabled={!submittedBy || !allCaptured || anyUploading || submitting}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CenteredMessage({ title, message, icon }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {icon && <div className="flex justify-center mb-3">{icon}</div>}
        <p className="font-semibold text-heading text-lg">{title}</p>
        <p className="text-sm text-subtext mt-1">{message}</p>
      </div>
    </div>
  );
}
