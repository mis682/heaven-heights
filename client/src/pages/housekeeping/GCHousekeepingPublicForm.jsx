import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ClipboardList, CheckCircle2, RefreshCw } from "lucide-react";
import CameraCapture from "../../components/CameraCapture";
import { createGCHousekeepingSubmission } from "../../api/gcHousekeeping";
import { GC_HOUSEKEEPING_FORMS } from "../../layouts/navConfig";
import { saveDraft, loadDraft, clearDraft } from "../../utils/gcHousekeepingDraft";

export default function GCHousekeepingPublicForm() {
  const { formNumber } = useParams();
  const form = GC_HOUSEKEEPING_FORMS.find((f) => f.formNumber === Number(formNumber));

  const [draftChecked, setDraftChecked] = useState(false);
  const [submittedBy, setSubmittedBy] = useState("");
  const [captures, setCaptures] = useState({});
  const [restoredNotice, setRestoredNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!form) return;
    const draft = loadDraft(form.formNumber);
    if (draft && Object.keys(draft.captures).length > 0) {
      setSubmittedBy(draft.submittedBy);
      setCaptures(draft.captures);
      setRestoredNotice(true);
    }
    setDraftChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-save the draft to localStorage after every capture, so a killed
  // browser tab (e.g. the OS reclaiming memory while the native camera app
  // is open) doesn't lose photos already taken earlier in the round.
  useEffect(() => {
    if (!form) return;
    if (Object.keys(captures).length > 0) {
      saveDraft(form.formNumber, submittedBy, captures);
    }
  }, [captures, submittedBy, form]);

  if (!form) {
    return <CenteredMessage title="Form not found" message="This Garden City housekeeping form link is invalid." />;
  }

  if (!draftChecked) {
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

  const missingCount = checkpointIds.filter((id) => !captures[id]).length;
  const allCaptured = missingCount === 0;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const body = new FormData();
    body.append("formNumber", form.formNumber);
    body.append("submittedBy", submittedBy);

    const meta = [];
    Object.entries(captures).forEach(([checkpointId, cap]) => {
      if (!cap) return;
      body.append("photos", cap.file);
      meta.push({ checkpointId: Number(checkpointId), capturedAt: cap.capturedAt, geoLocation: cap.geoLocation });
    });
    body.append("meta", JSON.stringify(meta));

    try {
      await createGCHousekeepingSubmission(body);
      clearDraft(form.formNumber);
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
              Aapke pehle liye gaye photos restore ho gaye hain — bas baaki checkpoints puri karein.
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
              className="input"
              placeholder="Apna naam likhein"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {checkpointIds.map((id) => (
              <CameraCapture
                key={id}
                label={`Checkpoint ${id}`}
                initialCapture={captures[id]}
                onCapture={(cap) => setCaptures((prev) => ({ ...prev, [id]: cap }))}
                allowGallery
              />
            ))}
          </div>

          {!allCaptured && (
            <p className="text-xs text-amber-600 text-center">
              Baaki {missingCount} checkpoint{missingCount > 1 ? "s" : ""} ki photo lena zaroori hai submit karne se pehle.
            </p>
          )}

          <button
            type="submit"
            disabled={!submittedBy || !allCaptured || submitting}
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
