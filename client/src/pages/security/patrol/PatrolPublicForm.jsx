import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Building2, CheckCircle2, RefreshCw } from "lucide-react";
import { getProjectBySlug } from "../../../api/projects";
import { listGuards } from "../../../api/guards";
import { createPatrolSubmission } from "../../../api/patrol";
import CameraCapture from "../../../components/CameraCapture";
import { saveDraft, loadDraft, clearDraft } from "../../../utils/patrolDraft";

export default function PatrolPublicForm() {
  const { project: slug } = useParams();
  const [data, setData] = useState(null);
  const [draftChecked, setDraftChecked] = useState(false);
  const [guards, setGuards] = useState([]);
  const [guardName, setGuardName] = useState("");
  const [captures, setCaptures] = useState({});
  const [restoredNotice, setRestoredNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const d = await getProjectBySlug(slug);
        setData(d);
        const g = await listGuards({ siteName: d.project.name, module: "patrol_checkpoint" });
        setGuards(g);

        const draft = loadDraft(slug);
        if (draft && Object.keys(draft.captures).length > 0) {
          setGuardName(draft.guardName);
          setCaptures(draft.captures);
          setRestoredNotice(true);
        }
      } catch {
        setError("This patrol form could not be loaded.");
      } finally {
        setDraftChecked(true);
      }
    })();
  }, [slug]);

  // Re-save the draft to localStorage after every capture, so a killed
  // browser tab (e.g. the OS reclaiming memory while the native camera app
  // is open) doesn't lose photos already taken earlier in the round.
  useEffect(() => {
    if (Object.keys(captures).length > 0) {
      saveDraft(slug, guardName, captures);
    }
  }, [captures, guardName, slug]);

  if (error) {
    return <CenteredMessage title="Form unavailable" message={error} />;
  }

  if (!data || !draftChecked) {
    return <CenteredMessage title="Loading..." message="Fetching checkpoint details" />;
  }

  if (done) {
    return (
      <CenteredMessage
        title="Submitted"
        message="Your patrol checkpoint photos have been recorded. Thank you."
        icon={<CheckCircle2 size={28} className="text-green-600" />}
      />
    );
  }

  const { project, checkpoints } = data;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData();
    form.append("guardName", guardName);
    form.append("projectId", project._id);
    form.append("projectName", project.name);

    const meta = [];
    Object.entries(captures).forEach(([checkpointId, cap]) => {
      if (!cap) return;
      form.append("photos", cap.file);
      meta.push({ checkpointId: Number(checkpointId), capturedAt: cap.capturedAt, geoLocation: cap.geoLocation });
    });
    form.append("meta", JSON.stringify(meta));

    try {
      await createPatrolSubmission(form);
      clearDraft(slug);
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
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-heading text-lg">{project.name} — Patrol Checkpoints</p>
            <p className="text-sm text-subtext">Capture proof photos for each checkpoint you covered.</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
          {restoredNotice && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <RefreshCw size={13} />
              Aapke pehle liye gaye photos restore ho gaye hain — bas baaki checkpoints puri karein.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guard Name</label>
            <select
              required
              value={guardName}
              onChange={(e) => setGuardName(e.target.value)}
              className="input"
            >
              <option value="">Select your name</option>
              {guards.map((g) => (
                <option key={g._id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
            {guards.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No guards found for this site yet — contact your coordinator.</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {checkpoints.map((cp) => (
              <CameraCapture
                key={cp.checkpointId}
                label={cp.name}
                initialCapture={captures[cp.checkpointId]}
                onCapture={(cap) => setCaptures((prev) => ({ ...prev, [cp.checkpointId]: cap }))}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!guardName || submitting}
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
