import React, { useEffect, useState } from "react";
import { Car, CheckCircle2 } from "lucide-react";
import ThemedSelect from "../../components/ThemedSelect";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import CameraCapture from "../../components/CameraCapture";
import { getVehicleMeta, createVehicleRide } from "../../api/vehicle";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyBasisRidePublicForm() {
  const [vehicles, setVehicles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [vehicleName, setVehicleName] = useState("");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState(today());
  const [startReading, setStartReading] = useState("");
  const [startCapture, setStartCapture] = useState(null);
  const [endReading, setEndReading] = useState("");
  const [endCapture, setEndCapture] = useState(null);
  const [reason, setReason] = useState("");
  const [personName, setPersonName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getVehicleMeta().then((m) => {
      setVehicles(m.vehicles);
      setDepartments(m.departments);
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
          <p className="text-sm text-subtext dark:text-gray-400 mt-1">Ride details have been recorded. Thank you.</p>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (Number(endReading) < Number(startReading)) {
      setError("Ending Meter Reading must be greater than or equal to Start Meter Reading.");
      return;
    }
    setSubmitting(true);
    const form = new FormData();
    form.append("vehicleName", vehicleName);
    form.append("department", department);
    form.append("date", date);
    form.append("startReading", startReading);
    form.append("startReadingPhoto", startCapture.file);
    form.append("endReading", endReading);
    form.append("endReadingPhoto", endCapture.file);
    form.append("reason", reason);
    form.append("personName", personName);

    try {
      await createVehicleRide(form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    vehicleName && department && date && startReading && startCapture && endReading && endCapture && reason && personName && !submitting;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
            <Car size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-heading dark:text-gray-100 text-lg">Daily Basis Ride Form</p>
            <p className="text-sm text-subtext dark:text-gray-400">Log the vehicle's meter readings for this ride.</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Name</label>
            <ThemedSelect required value={vehicleName} onChange={setVehicleName} options={vehicles} placeholder="Select vehicle" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <ThemedSelect required value={department} onChange={setDepartment} options={departments} placeholder="Select department" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <ThemedDatePicker value={date} onChange={setDate} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Meter Reading</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={startReading}
              onChange={(e) => setStartReading(e.target.value.replace(/\D/g, ""))}
              className="input"
              placeholder="0"
            />
          </div>
          <CameraCapture label="Start Meter Reading photo" onCapture={setStartCapture} />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ending Meter Reading</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={endReading}
              onChange={(e) => setEndReading(e.target.value.replace(/\D/g, ""))}
              className="input"
              placeholder="0"
            />
          </div>
          <CameraCapture label="Ending Meter Reading photo" onCapture={setEndCapture} />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input"
              placeholder="Reason for this ride"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Person Name</label>
            <input
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="input"
              placeholder="Your name"
            />
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
