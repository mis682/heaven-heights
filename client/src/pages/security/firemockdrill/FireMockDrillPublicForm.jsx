import React, { useEffect, useState } from "react";
import { CheckCircle2, Building2 } from "lucide-react";
import { getFireMockDrillMeta, createFireMockDrill } from "../../../api/fireMockDrill";

export default function FireMockDrillPublicForm() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState("");
  const [panelPhoto, setPanelPhoto] = useState(null);
  const [videos, setVideos] = useState(Array(8).fill(null));
  const [reportAttachment, setReportAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getFireMockDrillMeta().then((m) => setProjects(m.projects));
  }, []);

  const setVideoAt = (idx, file) => {
    setVideos((prev) => {
      const next = [...prev];
      next[idx] = file;
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createFireMockDrill(
        { projectName, date },
        { panelPhoto, videos: videos.filter(Boolean), reportAttachment }
      );
      setDone(true);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
        <div className="text-center">
          <CheckCircle2 size={56} className="text-green-600 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-heading">Submitted</h1>
          <p className="text-subtext text-sm mt-1">Fire mock drill record saved successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
            <Building2 size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-heading">Fire Mock Drill</h1>
          <p className="text-sm text-subtext text-center">Submit drill details, panel photo, videos and report.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Project">
            <select required value={projectName} onChange={(e) => setProjectName(e.target.value)} className="input">
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>

          <Field label="Date">
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </Field>

          <Field label="Panel Photo">
            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) => setPanelPhoto(e.target.files?.[0] || null)}
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            {videos.map((v, idx) => (
              <Field key={idx} label={`Video ${idx + 1}`}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoAt(idx, e.target.files?.[0] || null)}
                  className="input text-xs"
                />
              </Field>
            ))}
          </div>

          <Field label="Report Attachment">
            <input type="file" onChange={(e) => setReportAttachment(e.target.files?.[0] || null)} className="input" />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            disabled={submitting || !projectName || !date || !panelPhoto}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
