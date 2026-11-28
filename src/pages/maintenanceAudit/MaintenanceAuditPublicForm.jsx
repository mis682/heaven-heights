import React, { useEffect, useState } from "react";
import { ClipboardCheck, CheckCircle2 } from "lucide-react";
import ThemedSelect from "../../components/ThemedSelect";
import CameraCapture from "../../components/CameraCapture";
import { getMaintenanceAuditMeta, createMaintenanceAuditSubmission } from "../../api/maintenanceAudit";

export default function MaintenanceAuditPublicForm() {
  const [projects, setProjects] = useState([]);
  const [clientName, setClientName] = useState("");
  const [unitNo, setUnitNo] = useState("");
  const [project, setProject] = useState("");
  const [remarks, setRemarks] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMaintenanceAuditMeta().then((m) => setProjects(m.projects));
  }, []);

  if (done) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-3">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <p className="font-semibold text-heading dark:text-gray-100 text-lg">Submitted</p>
          <p className="text-sm text-subtext dark:text-gray-400 mt-1">Audit details have been recorded. Thank you.</p>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData();
    form.append("clientName", clientName);
    form.append("unitNo", unitNo);
    form.append("project", project);
    form.append("remarks", remarks);
    if (image1) form.append("image1", image1.file);
    if (image2) form.append("image2", image2.file);

    try {
      await createMaintenanceAuditSubmission(form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = clientName.trim() && unitNo.trim() && project && remarks.trim() && !submitting;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
            <ClipboardCheck size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-heading dark:text-gray-100 text-lg">Maintenance Audit Form</p>
            <p className="text-sm text-subtext dark:text-gray-400">Fill in the audit details below.</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name</label>
            <input
              required
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="input"
              placeholder="Write something"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit No.</label>
            <input
              required
              type="text"
              value={unitNo}
              onChange={(e) => setUnitNo(e.target.value)}
              className="input"
              placeholder="Write something"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
            <ThemedSelect required value={project} onChange={setProject} options={projects} placeholder="Select an option" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="input"
              rows={4}
              placeholder="Write something"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image-1 (optional)</label>
            <CameraCapture label="Image-1" onCapture={setImage1} allowGallery />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image-2 (optional)</label>
            <CameraCapture label="Image-2" onCapture={setImage2} allowGallery />
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
