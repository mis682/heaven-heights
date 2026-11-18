import React, { useState } from "react";
import { Building2, CheckCircle2 } from "lucide-react";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import Time12hInput from "../../components/Time12hInput";
import { createMaintenanceStaffInOut } from "../../api/maintenanceStaffInOut";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  const d = new Date();
  const hour24 = d.getHours();
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = String(hour24 % 12 || 12).padStart(2, "0");
  return `${hour12}:${String(d.getMinutes()).padStart(2, "0")} ${period}`;
}

export default function MaintenanceStaffInOutPublicForm() {
  const [date, setDate] = useState(today());
  const [contractorName, setContractorName] = useState("");
  const [staffName, setStaffName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [work, setWork] = useState("");
  const [inTime, setInTime] = useState(nowTime());
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

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
      await createMaintenanceStaffInOut({ date, contractorName, staffName, mobileNumber, work, inTime });
      setDone(true);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = date && contractorName.trim() && staffName.trim() && mobileNumber.trim() && work.trim() && inTime;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-heading dark:text-gray-100 text-lg">Maintenance Staff In/Out</p>
            <p className="text-sm text-subtext dark:text-gray-400">Main office entry ke liye details bharein.</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <ThemedDatePicker value={date} max={today()} onChange={setDate} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contractor Name/Supervisor Name</label>
            <input
              required
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              className="input"
              placeholder="Contractor/Supervisor ka naam likhein"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Labour Name/Staff Name</label>
            <input
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="input"
              placeholder="Naam likhein"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
            <input
              required
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="input"
              placeholder="10-digit mobile number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work</label>
            <input
              required
              value={work}
              onChange={(e) => setWork(e.target.value)}
              className="input"
              placeholder="Kis kaam ke liye aaye hain"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">In-Time</label>
            <Time12hInput value={inTime} onChange={setInTime} />
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
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
