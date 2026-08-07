import React, { useEffect, useState } from "react";
import { Building2, CheckCircle2 } from "lucide-react";
import { getNightGuardMeta, createNightGuardSubmission } from "../../../api/nightguard";
import { listGuards } from "../../../api/guards";
import CameraCapture from "../../../components/CameraCapture";

export default function NightGuardPublicForm() {
  const [sites, setSites] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [guards, setGuards] = useState([]);
  const [guardName, setGuardName] = useState("");
  const [capture, setCapture] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getNightGuardMeta().then((m) => setSites(m.sites));
  }, []);

  useEffect(() => {
    setGuardName("");
    if (!projectName) {
      setGuards([]);
      return;
    }
    listGuards({ siteName: projectName, module: "night_guard" }).then(setGuards);
  }, [projectName]);

  if (done) {
    return (
      <CenteredMessage
        title="Submitted"
        message="Your proof-of-presence photo has been recorded. Thank you."
        icon={<CheckCircle2 size={28} className="text-green-600" />}
      />
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!capture) return;
    setSubmitting(true);
    const form = new FormData();
    form.append("guardName", guardName);
    form.append("projectName", projectName);
    form.append("guardPhoto", capture.file);
    form.append("capturedAt", capture.capturedAt.toISOString());
    form.append("geoLocation", JSON.stringify(capture.geoLocation));

    try {
      await createNightGuardSubmission(form);
      setDone(true);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-heading text-lg">Night Guard Check-in</p>
            <p className="text-sm text-subtext">Submit your proof-of-presence photo for this shift.</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <select required value={projectName} onChange={(e) => setProjectName(e.target.value)} className="input">
              <option value="">Select project</option>
              {sites.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guard Name</label>
            <select required disabled={!projectName} value={guardName} onChange={(e) => setGuardName(e.target.value)} className="input">
              <option value="">Select your name</option>
              {guards.map((g) => <option key={g._id} value={g.name}>{g.name}</option>)}
            </select>
            {projectName && guards.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No guards found for this site — contact your coordinator.</p>
            )}
          </div>

          <CameraCapture label="Your proof-of-presence photo" onCapture={setCapture} disabled={!guardName} />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!guardName || !capture || submitting}
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
