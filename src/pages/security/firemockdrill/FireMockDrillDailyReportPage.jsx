import React, { useEffect, useState } from "react";
import { Save, Send, Lock, FileText, Download, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import StatusPill from "../../../components/StatusPill";
import ThemedSelect from "../../../components/ThemedSelect";
import ThemedDatePicker from "../../../components/ThemedDatePicker";
import { alertMessage } from "../../../utils/confirmDialog";
import { useAuth } from "../../../context/AuthContext";
import {
  getFireMockDrillReportMeta,
  getFireMockDrillSubmissionFor,
  getFireMockDrillReportByDate,
  saveFireMockDrillReportDraft,
  submitFireMockDrillReport,
  fireMockDrillReportExportUrl,
  fireMockDrillReportExportPdfUrl,
} from "../../../api/fireMockDrillReport";

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Unlike every other module's Daily Report, the checkpoints here ("entries")
// aren't a fixed form — they're built from whatever the matching Fire Mock
// Drill submission for this project+date actually has attached (Panel
// Photo, Video 1..N, Checklist Page 1..3). The coordinator just assigns an
// OK/Not OK status to each; the Maintenance Supervisor/issue Q&A are
// read-only, carried straight over from the submission.
export default function FireMockDrillDailyReportPage() {
  const { user } = useAuth();
  const [meta, setMeta] = useState({ statusOptions: [], projects: [] });
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState(today());
  const [loadingData, setLoadingData] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [report, setReport] = useState(null);
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFireMockDrillReportMeta().then((m) => {
      setMeta(m);
      if (m.projects.length > 0) setProjectName(m.projects[0]);
      setMetaLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!projectName || !date) return;
    (async () => {
      setLoadingData(true);
      const [sub, existingReport] = await Promise.all([
        getFireMockDrillSubmissionFor(projectName, date),
        getFireMockDrillReportByDate(projectName, date),
      ]);
      setSubmission(sub);
      setReport(existingReport);
      if (existingReport) {
        setEntries(existingReport.entries.map((e) => ({ ...e })));
      } else if (sub) {
        setEntries(sub.attachments.map((a) => ({ attachmentLabel: a.label, attachmentUrl: a.url, status: "" })));
      } else {
        setEntries([]);
      }
      setLoadingData(false);
    })();
  }, [projectName, date]);

  const isLocked = report?.status === "submitted";
  // Read-only snapshot fields — from the saved report once one exists
  // (so they stay accurate even if the submission is later edited), else
  // straight from the live submission lookup.
  const snapshot = report || submission;

  const updateEntry = (idx, patch) => setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));

  const persist = async (targetStatus) => {
    setSaving(true);
    try {
      const saved = await saveFireMockDrillReportDraft({
        projectName,
        reportDate: date,
        submissionId: submission?.submissionId || report?.submissionId || null,
        maintenanceSupervisor: snapshot?.maintenanceSupervisor || "",
        issueIdentified: snapshot?.issueIdentified || "",
        issueDescription: snapshot?.issueDescription || "",
        actionTaken: snapshot?.actionTaken || "",
        entries,
        preparedBy: user?.name || "",
      });
      if (targetStatus === "submitted") {
        try {
          const submitted = await submitFireMockDrillReport(saved._id);
          setReport(submitted);
          setEntries(submitted.entries.map((e) => ({ ...e })));
        } catch (err) {
          await alertMessage(err.response?.data?.message || "Submit failed — fill at least one row first.");
          setReport(saved);
        }
      } else {
        setReport(saved);
      }
    } catch (err) {
      await alertMessage(err.response?.data?.message || "Saving failed — please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!metaLoaded) {
    return <p className="text-sm text-subtext dark:text-gray-400">Loading...</p>;
  }

  return (
    <div>
      <PageHeader
        title="Fire Mock Drill — Daily Report"
        subtitle="Pick the project and date the drill was submitted for, then mark each attachment OK or Not OK."
        primaryAction={
          isLocked ? undefined : { label: saving ? "Saving..." : "Submit Report", icon: <Send size={16} />, onClick: () => persist("submitted") }
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <ThemedSelect
          value={projectName}
          onChange={setProjectName}
          options={meta.projects}
          placeholder="Select project"
          className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 max-w-[220px] w-full"
        />
        <ThemedDatePicker value={date} max={today()} onChange={setDate} className="max-w-[180px]" />
        {isLocked && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
            <Lock size={12} /> Submitted — read only (ask Admin to unlock)
          </span>
        )}
      </div>

      {loadingData ? (
        <p className="text-sm text-subtext dark:text-gray-400">Loading...</p>
      ) : !submission && !report ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 text-center">
          <p className="text-sm text-subtext dark:text-gray-400">
            No Fire Mock Drill submission found for <b>{projectName}</b> on <b>{date}</b> yet.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-4 space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Maintenance Supervisor:</span> {snapshot?.maintenanceSupervisor || "—"}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Issue identified:</span>{" "}
              {snapshot?.issueIdentified ? (
                <span className={snapshot.issueIdentified === "Yes" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                  {snapshot.issueIdentified}
                </span>
              ) : (
                "—"
              )}
            </p>
            {snapshot?.issueDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Description:</span> {snapshot.issueDescription}
              </p>
            )}
            {snapshot?.actionTaken && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Action taken:</span> {snapshot.actionTaken}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[70vh]">
              <table className="text-sm border-collapse w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">Attachment</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">Preview</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">{date}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <td className="px-4 py-2 whitespace-nowrap font-medium text-heading dark:text-gray-100">{entry.attachmentLabel}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {entry.attachmentUrl ? (
                          <a href={entry.attachmentUrl} target="_blank" rel="noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-primary">
                            {entry.attachmentLabel.startsWith("Video") ? <VideoIcon size={16} /> : <ImageIcon size={16} />}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <ThemedSelect
                          disabled={isLocked}
                          value={entry.status}
                          onChange={(v) => updateEntry(idx, { status: v })}
                          options={meta.statusOptions}
                          placeholder="—"
                          className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Save size={16} /> {saving ? "Saving..." : "Save as Draft"}
              </button>
            )}
            {report && (
              <>
                <a
                  href={fireMockDrillReportExportPdfUrl(report._id, "classic")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FileText size={16} /> PDF (Classic)
                </a>
                <a
                  href={fireMockDrillReportExportPdfUrl(report._id, "card")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FileText size={16} /> PDF (Card)
                </a>
                <a
                  href={fireMockDrillReportExportUrl(report._id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Download size={16} /> Download Excel
                </a>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
