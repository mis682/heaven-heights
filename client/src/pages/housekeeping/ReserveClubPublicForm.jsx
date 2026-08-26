import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ClipboardList, CheckCircle2, RefreshCw } from "lucide-react";
import CameraCapture from "../../components/CameraCapture";
import { createReserveClubSubmission } from "../../api/reserveClub";
import { RESERVE_CLUB_FORMS } from "../../layouts/navConfig";
import { saveDraft, loadDraft, clearDraft } from "../../utils/reserveClubDraft";

export default function ReserveClubPublicForm() {
  const { formNumber } = useParams();
  const form = RESERVE_CLUB_FORMS.find((f) => f.formNumber === Number(formNumber));

  const [draftChecked, setDraftChecked] = useState(false);
  const [submittedBy, setSubmittedBy] = useState("");
  const [captures, setCaptures] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [restoredNotice, setRestoredNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!form) return;
    const draft = loadDraft(form.formNumber);
    if (draft && (Object.keys(draft.captures).length > 0 || Object.keys(draft.textAnswers || {}).length > 0)) {
      setSubmittedBy(draft.submittedBy);
      setCaptures(draft.captures);
      setTextAnswers(draft.textAnswers || {});
      setRestoredNotice(true);
    }
    setDraftChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!form) return;
    if (Object.keys(captures).length > 0 || Object.keys(textAnswers).length > 0) {
      saveDraft(form.formNumber, submittedBy, captures, textAnswers);
    }
  }, [captures, textAnswers, submittedBy, form]);

  if (!form) {
    return <CenteredMessage title="Form not found" message="This Neoteric Reserve Club form link is invalid." />;
  }

  if (!draftChecked) {
    return <CenteredMessage title="Loading..." message="Preparing checklist" />;
  }

  if (done) {
    return (
      <CenteredMessage
        title="Submitted"
        message="Checklist has been recorded. Thank you."
        icon={<CheckCircle2 size={28} className="text-green-600" />}
      />
    );
  }

  const photoCheckpoints = form.checkpoints.filter((c) => c.type !== "text");
  const textCheckpoints = form.checkpoints.filter((c) => c.type === "text");

  const missingPhotos = photoCheckpoints.filter((c) => c.required !== false && !captures[c.label]).length;
  const missingText = textCheckpoints.filter((c) => c.required !== false && !(textAnswers[c.label] || "").trim()).length;
  const missingCount = missingPhotos + missingText;
  const allDone = missingCount === 0;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const body = new FormData();
    body.append("formNumber", form.formNumber);
    body.append("submittedBy", submittedBy);

    const meta = [];
    Object.entries(captures).forEach(([checkpointLabel, cap]) => {
      if (!cap) return;
      body.append("photos", cap.file);
      meta.push({ checkpointLabel, capturedAt: cap.capturedAt, geoLocation: cap.geoLocation });
    });
    body.append("meta", JSON.stringify(meta));
    body.append(
      "textAnswers",
      JSON.stringify(textCheckpoints.map((c) => ({ label: c.label, value: textAnswers[c.label] || "" })))
    );

    try {
      await createReserveClubSubmission(body);
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
            <p className="font-bold text-heading text-lg">Neoteric Reserve Club — {form.label}</p>
            <p className="text-sm text-subtext">Capture a photo (or fill the answer) for each checkpoint below.</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
          {restoredNotice && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <RefreshCw size={13} />
              Aapka pehle bhara hua data restore ho gaya hai — bas baaki checkpoints puri karein.
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

          {textCheckpoints.length > 0 && (
            <div className="space-y-3">
              {textCheckpoints.map((c) => (
                <div key={c.label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{c.label}</label>
                  <input
                    type="text"
                    value={textAnswers[c.label] || ""}
                    onChange={(e) => setTextAnswers((prev) => ({ ...prev, [c.label]: e.target.value }))}
                    className="input"
                    placeholder="Apna jawab likhein"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photoCheckpoints.map((c) => (
              <CameraCapture
                key={c.label}
                label={c.label}
                initialCapture={captures[c.label]}
                onCapture={(cap) => setCaptures((prev) => ({ ...prev, [c.label]: cap }))}
                allowGallery
              />
            ))}
          </div>

          {!allDone && (
            <p className="text-xs text-amber-600 text-center">
              Baaki {missingCount} checkpoint{missingCount > 1 ? "s" : ""} complete karna zaroori hai submit karne se pehle.
            </p>
          )}

          <button
            type="submit"
            disabled={!submittedBy || !allDone || submitting}
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
