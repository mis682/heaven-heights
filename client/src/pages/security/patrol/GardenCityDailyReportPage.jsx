import React, { useEffect, useState } from "react";
import { Save, Send, Lock, FileText, Download } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import StatusPill from "../../../components/StatusPill";
import { useAuth } from "../../../context/AuthContext";
import { listMaintenanceStaff } from "../../../api/maintenanceStaff";
import {
  getGardenCityReportMeta,
  getGardenCityReportByDate,
  saveGardenCityReportDraft,
  submitGardenCityReport,
  gardenCityReportExportUrl,
  gardenCityReportExportPdfUrl,
} from "../../../api/gardenCityPatrolReport";

function today() {
  return new Date().toISOString().slice(0, 10);
}

const BAND_COLORS = ["#F4B6AA", "#C7A6DD"];

function getBandColors(entries) {
  const colors = [];
  let blockIndex = 0;
  entries.forEach((e, idx) => {
    if (idx > 0 && e.time === "07:00:00 PM") blockIndex += 1;
    colors.push(BAND_COLORS[blockIndex % 2]);
  });
  return colors;
}

export default function GardenCityDailyReportPage() {
  const { user } = useAuth();
  const [meta, setMeta] = useState({ statusOptions: [], schedule: [] });
  const [date, setDate] = useState(today());
  const [report, setReport] = useState(null);
  const [entries, setEntries] = useState([]);
  const [guards, setGuards] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGardenCityReportMeta().then(setMeta);
    // Sourced from Maintenance Staff (Security Guard designation), not
    // filtered by site — guards rotate between sites daily.
    listMaintenanceStaff({ designation: "Security Guard" }).then(setGuards);
  }, []);

  useEffect(() => {
    if (!meta.schedule.length) return;
    (async () => {
      const r = await getGardenCityReportByDate(date);
      setReport(r);
      if (r) {
        setEntries(r.entries.map((e) => ({ ...e })));
      } else {
        setEntries(meta.schedule.map((slot) => ({ ...slot, guardName: "", status: "" })));
      }
    })();
  }, [date, meta.schedule]);

  const isLocked = report?.status === "submitted";
  const bandColors = getBandColors(entries);

  const updateEntry = (idx, patch) => setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));

  const persist = async (targetStatus) => {
    setSaving(true);
    const saved = await saveGardenCityReportDraft({
      reportDate: date,
      entries,
      preparedBy: user?.name || "",
    });
    if (targetStatus === "submitted") {
      try {
        const submitted = await submitGardenCityReport(saved._id);
        setReport(submitted);
        setEntries(submitted.entries.map((e) => ({ ...e })));
      } catch (err) {
        alert(err.response?.data?.message || "Submit failed — fill at least one row first.");
        setReport(saved);
      }
    } else {
      setReport(saved);
    }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader
        title="Garden City — Daily Report"
        subtitle="Har checkpoint aur time slot ke liye guard aur status assign karein."
        primaryAction={
          isLocked ? undefined : { label: saving ? "Saving..." : "Submit Report", icon: <Send size={16} />, onClick: () => persist("submitted") }
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className="input max-w-[180px]" />
        {isLocked && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
            <Lock size={12} /> Submitted — read only (ask Admin to unlock)
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="text-sm border-collapse w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">Checkpoint & Time</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">Guard Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">{date}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-heading" style={{ backgroundColor: bandColors[idx] }}>
                    {entry.checkpointLabel} {entry.time}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <select
                      disabled={isLocked}
                      value={entry.guardName}
                      onChange={(e) => updateEntry(idx, { guardName: e.target.value })}
                      className="input min-w-[170px]"
                    >
                      <option value="">Select guard</option>
                      {guards.map((g) => (
                        <option key={g._id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <select
                      disabled={isLocked}
                      value={entry.status}
                      onChange={(e) => updateEntry(idx, { status: e.target.value })}
                      className="input min-w-[150px]"
                    >
                      <option value="">—</option>
                      {meta.statusOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    {entry.status && (
                      <div className="mt-1">
                        <StatusPill status={entry.status} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        {!isLocked && (
          <button
            onClick={() => persist("draft")}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save as Draft"}
          </button>
        )}
        {report && (
          <>
            <a
              href={gardenCityReportExportPdfUrl(report._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileText size={16} /> Download PDF
            </a>
            <a
              href={gardenCityReportExportUrl(report._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={16} /> Download Excel
            </a>
          </>
        )}
      </div>
    </div>
  );
}
