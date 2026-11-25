import React, { useEffect, useState } from "react";
import { KeyRound, CheckCircle2 } from "lucide-react";
import ThemedSelect from "../../components/ThemedSelect";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import Time12hInput from "../../components/Time12hInput";
import { getKeyHandoverMeta, createKeyHandover } from "../../api/keyHandover";

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

export default function KeyHandoverPublicForm() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicle, setVehicle] = useState("");
  const [date, setDate] = useState(today());
  const [driverName, setDriverName] = useState("");
  const [inTime, setInTime] = useState(nowTime());
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getKeyHandoverMeta().then((m) => {
      setVehicles(m.vehicles);
      setDrivers(m.drivers);
    });
  }, []);

  if (done) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-3">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <p className="font-semibold text-heading dark:text-gray-100 text-lg">Submitted</p>
          <p className="text-sm text-subtext dark:text-gray-400 mt-1">Key handover record ho gaya hai. Dhanyavaad.</p>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createKeyHandover({ vehicle, date, driverName, inTime });
      setDone(true);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = vehicle && date && driverName && inTime && !submitting;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
            <KeyRound size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-heading dark:text-gray-100 text-lg">Key Handover Form</p>
            <p className="text-sm text-subtext dark:text-gray-400">Vehicle key handover ke details bharein.</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle</label>
            <ThemedSelect required value={vehicle} onChange={setVehicle} options={vehicles} placeholder="Select vehicle" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <ThemedDatePicker value={date} max={today()} onChange={setDate} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driver Name</label>
            <ThemedSelect required value={driverName} onChange={setDriverName} options={drivers} placeholder="Select driver" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">In-Time</label>
            <Time12hInput value={inTime} onChange={setInTime} />
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
