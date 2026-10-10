import React, { useState } from "react";
import { Shirt, CheckCircle2 } from "lucide-react";
import CameraCapture from "../../components/CameraCapture";
import ThemedSelect from "../../components/ThemedSelect";
import { createMaintenanceUniformSubmission } from "../../api/maintenanceUniform";
import { uploadFileDirect } from "../../api/cloudinaryDirectUpload";
import { MAINTENANCE_UNIFORM_SITES, MAINTENANCE_UNIFORM_DESIGNATIONS } from "../../constants/maintenanceUniform";

export default function MaintenanceUniformPublicForm() {
  const [siteName, setSiteName] = useState("");
  const [designation, setDesignation] = useState("");
  const [staffName, setStaffName] = useState("");
  const [shift, setShift] = useState("");
  const [capture, setCapture] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (done) {
    return (
      <CenteredMessage
        title="Submitted"
        message="Uniform photo has been recorded. Thank you."
        icon={<CheckCircle2 size={28} className="text-green-600 dark:text-green-400" />}
      />
    );
  }

  const allDone = siteName && designation && staffName.trim() && shift && capture;

  const submit = async (e) => {
    e.preventDefault();
    if (!allDone) return;
    setSubmitting(true);
    try {
      const photoUrl = await uploadFileDirect(capture.file, { account: "main", resourceType: "image" });
      await createMaintenanceUniformSubmission({ siteName, designation, staffName: staffName.trim(), shift, photoUrl });
      setDone(true);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
            <Shirt size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-heading dark:text-gray-100 text-lg">Maintenance Uniform</p>
            <p className="text-sm text-subtext dark:text-gray-400">Submit today's uniform photo.</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
            <ThemedSelect
              value={siteName}
              onChange={setSiteName}
              options={MAINTENANCE_UNIFORM_SITES}
              placeholder="Select site"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
            <ThemedSelect
              value={designation}
              onChange={setDesignation}
              options={MAINTENANCE_UNIFORM_DESIGNATIONS}
              placeholder="Select designation"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Staff Name</label>
            <input
              required
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="input"
              placeholder="Staff ka naam likhein"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift</label>
            <ThemedSelect value={shift} onChange={setShift} options={["Day", "Night"]} placeholder="Select shift" className="input" />
          </div>

          <CameraCapture label="Uniform Pic" initialCapture={capture} onCapture={setCapture} allowGallery />

          <button
            type="submit"
            disabled={!allDone || submitting}
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
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {icon && <div className="flex justify-center mb-3">{icon}</div>}
        <p className="font-semibold text-heading dark:text-gray-100 text-lg">{title}</p>
        <p className="text-sm text-subtext dark:text-gray-400 mt-1">{message}</p>
      </div>
    </div>
  );
}
