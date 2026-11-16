import React, { useEffect, useState } from "react";
import { Building2, CheckCircle2 } from "lucide-react";
import ThemedSelect from "../../components/ThemedSelect";
import { getMaintenanceStaffInOutMeta, createMaintenanceStaffInOut } from "../../api/maintenanceStaffInOut";

const STATUS_OPTIONS = ["In", "Out"];

export default function MaintenanceStaffInOutPublicForm() {
  const [staff, setStaff] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMaintenanceStaffInOutMeta().then((m) => setStaff(m.staff));
  }, []);

  if (done) {
    return (
      <CenteredMessage
        title="Submitted"
        message="Entry record ho gayi hai. Dhanyavaad."
        icon={<CheckCircle2 size={28} className="text-green-600" />}
      />
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createMaintenanceStaffInOut({ employeeId, status, reason });
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
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-heading dark:text-gray-100 text-lg">Maintenance Staff In/Out</p>
            <p className="text-sm text-subtext dark:text-gray-400">Main office entry/exit ke liye apna naam aur status select karein.</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Staff Name</label>
            <ThemedSelect
              required
              value={employeeId}
              onChange={setEmployeeId}
              options={staff.map((s) => ({ value: s.employeeId, label: `${s.nameHindi} (${s.name})` }))}
              placeholder="Select staff"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <ThemedSelect required value={status} onChange={setStatus} options={STATUS_OPTIONS} placeholder="Select In or Out" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input"
              placeholder="Reason likhein (optional)"
            />
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={!employeeId || !status || submitting}
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
