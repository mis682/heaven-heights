import React, { useEffect, useState } from "react";
import { Save, Send, Lock, FileText, Download } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatusPill from "../../components/StatusPill";
import ThemedSelect from "../../components/ThemedSelect";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import { alertMessage } from "../../utils/confirmDialog";
import { useAuth } from "../../context/AuthContext";
import {
  getGCClubReportMeta,
  getGCClubReportByDate,
  saveGCClubReportDraft,
  submitGCClubReport,
  gcClubReportExportUrl,
  gcClubReportExportPdfUrl,
} from "../../api/gcClubReport";

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Unlike Garden City Housekeeping's single unified checklist, each Club
// form has its own distinct set of checkpoints, so this page needs a form
// picker (6 "report formats") alongside the date picker — picking a
// form+date combination that has no report yet pre-populates that form's
// checkpoints all at once, same as elsewhere.
export default function GCClubDailyReportPage() {
  const { user } = useAuth();
  const [meta, setMeta] = useState({ statusOptions: [], forms: [] });
  const [formNumber, setFormNumber] = useState(null);
  const [date, setDate] = useState(today());
  const [report, setReport] = useState(null);
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGCClubReportMeta().then((m) => {
      setMeta(m);
      if (m.forms.length > 0) setFormNumber(m.forms[0].formNumber);
    });
  }, []);

  const selectedForm = meta.forms.find((f) => f.formNumber === formNumber);

  useEffect(() => {
    if (!selectedForm) return;
    (async () => {
      const r = await getGCClubReportByDate(formNumber, date);
      setReport(r);
      if (r) {
        setEntries(r.entries.map((e) => ({ ...e })));
      } else {
        setEntries(selectedForm.checkpoints.map((checkpointLabel) => ({ checkpointLabel, status: "" })));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formNumber, date, selectedForm]);

  const isLocked = report?.status === "submitted";

  const updateEntry = (idx, patch) => setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));

  const persist = async (targetStatus) => {
    setSaving(true);
    const saved = await saveGCClubReportDraft({
      formNumber,
      reportDate: date,
      entries,
      preparedBy: user?.name || "",
    });
    if (targetStatus === "submitted") {
      try {
        const submitted = await submitGCClubReport(saved._id);
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

  if (!selectedForm) {
    return <p className="text-sm text-subtext dark:text-gray-400">Loading...</p>;
  }

  return (
    <div>
      <PageHeader
        title="Garden City Club — Daily Report"
        subtitle="Report format chunein, phir har checkpoint ke liye status assign karein."
        primaryAction={
          isLocked ? undefined : { label: saving ? "Saving..." : "Submit Report", icon: <Send size={16} />, onClick: () => persist("submitted") }
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <ThemedSelect
          value={formNumber || ""}
          onChange={(v) => setFormNumber(Number(v))}
          options={meta.forms.map((f) => ({ value: f.formNumber, label: f.label }))}
          className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 max-w-[220px] w-full"
        />
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
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">Checkpoint</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">{date}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-heading dark:text-gray-100">{entry.checkpointLabel}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <ThemedSelect
                      disabled={isLocked}
                      value={entry.status}
                      onChange={(v) => updateEntry(idx, { status: v })}
                      options={meta.statusOptions}
                      placeholder="—"
                      className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 min-w-[170px]"
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
              href={gcClubReportExportPdfUrl(report._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText size={16} /> Download PDF
            </a>
            <a
              href={gcClubReportExportUrl(report._id)}
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
