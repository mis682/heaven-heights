import React, { useEffect, useState } from "react";
import { Save, Send, Lock, FileText, Download, CheckCircle2, Clock, ImageOff } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import StatusPill from "../../../components/StatusPill";
import ThemedSelect from "../../../components/ThemedSelect";
import ThemedDatePicker from "../../../components/ThemedDatePicker";
import { alertMessage } from "../../../utils/confirmDialog";
import { useAuth } from "../../../context/AuthContext";
import { listMaintenanceStaff } from "../../../api/maintenanceStaff";
import {
  getGardenCityReportMeta,
  getGardenCityReportByDate,
  saveGardenCityReportDraft,
  submitGardenCityReport,
  gardenCityReportExportUrl,
  gardenCityReportExportPdfUrl,
  getGardenCitySla,
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

// Purely informational — reflects the guard's actual photo-capture time vs.
// the scheduled slot, never affects what status the coordinator can pick.
function SlaBadge({ info }) {
  if (!info) return <span className="text-xs text-gray-300 dark:text-gray-600">—</span>;
  if (info.slaStatus === "on_time") {
    return (
      <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 text-xs font-medium">
        <CheckCircle2 size={12} /> On Time
      </span>
    );
  }
  if (info.slaStatus === "late") {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 text-xs font-medium">
        <Clock size={12} /> Late by {info.lateByMinutes} min
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs font-medium">
      <ImageOff size={12} /> No Photo
    </span>
  );
}

export default function GardenCityDailyReportPage() {
  const { user } = useAuth();
  const [meta, setMeta] = useState({ statusOptions: [], schedule: [] });
  const [date, setDate] = useState(today());
  const [report, setReport] = useState(null);
  const [entries, setEntries] = useState([]);
  const [guards, setGuards] = useState([]);
  const [saving, setSaving] = useState(false);
  const [sla, setSla] = useState([]);

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

  useEffect(() => {
    setSla([]);
    getGardenCitySla(date).then((r) => setSla(r.sla));
  }, [date]);

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
        await alertMessage(err.response?.data?.message || "Submit failed — fill at least one row first.");
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
        <ThemedDatePicker value={date} max={today()} onChange={setDate} className="max-w-[180px]" />
        {isLocked && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
            <Lock size={12} /> Submitted — read only (ask Admin to unlock)
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="text-sm border-collapse w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">Checkpoint & Time</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">Guard Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">SLA</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">{date}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-heading" style={{ backgroundColor: bandColors[idx] }}>
                    {entry.checkpointLabel} {entry.time}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <ThemedSelect
                      disabled={isLocked}
                      value={entry.guardName}
                      onChange={(v) => updateEntry(idx, { guardName: v })}
                      options={guards.map((g) => ({ value: g.name, label: g.name }))}
                      placeholder="Select guard"
                      className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[170px]"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <SlaBadge info={sla[idx]} />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <ThemedSelect
                      disabled={isLocked}
                      value={entry.status}
                      onChange={(v) => updateEntry(idx, { status: v })}
                      options={meta.statusOptions}
                      placeholder="—"
                      className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                    />
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save as Draft"}
          </button>
        )}
        {report && (
          <>
            <a
              href={gardenCityReportExportPdfUrl(report._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText size={16} /> Download PDF
            </a>
            <a
              href={gardenCityReportExportUrl(report._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download size={16} /> Download Excel
            </a>
          </>
        )}
      </div>
    </div>
  );
}
