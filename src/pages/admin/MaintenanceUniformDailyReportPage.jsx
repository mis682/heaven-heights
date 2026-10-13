import React, { useEffect, useState } from "react";
import { Save, Send, Lock, FileText, Download, Search } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatusPill from "../../components/StatusPill";
import ThemedSelect from "../../components/ThemedSelect";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import { alertMessage } from "../../utils/confirmDialog";
import { useAuth } from "../../context/AuthContext";
import { MAINTENANCE_UNIFORM_REPORT_FORMATS } from "../../constants/maintenanceUniform";
import {
  getMaintenanceUniformReportMeta,
  getMaintenanceUniformStaffList,
  getMaintenanceUniformReportByDate,
  saveMaintenanceUniformReportDraft,
  submitMaintenanceUniformReport,
  maintenanceUniformReportExportUrl,
  maintenanceUniformReportExportPdfUrl,
} from "../../api/maintenanceUniformReport";

const REPORT_NAMES = Object.keys(MAINTENANCE_UNIFORM_REPORT_FORMATS);

function today() {
  return new Date().toISOString().slice(0, 10);
}

// The checklist is split across two coordinators, each with their own fixed
// set of sites — a coordinator picks their own report name first, then a
// date, and only sees their sites' staff (pre-populated from Maintenance
// Staff), grouped by designation.
export default function MaintenanceUniformDailyReportPage() {
  const { user } = useAuth();
  const [meta, setMeta] = useState({ statusOptions: [] });
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [reportName, setReportName] = useState("");
  const [date, setDate] = useState(today());
  const [staffList, setStaffList] = useState([]);
  const [report, setReport] = useState(null);
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMaintenanceUniformReportMeta().then((m) => {
      setMeta(m);
      setMetaLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!reportName) {
      setStaffList([]);
      return;
    }
    getMaintenanceUniformStaffList({ reportName }).then(setStaffList);
  }, [reportName]);

  useEffect(() => {
    if (!metaLoaded || !reportName) return;
    (async () => {
      const r = await getMaintenanceUniformReportByDate(date, reportName);
      setReport(r);
      if (r) {
        setEntries(r.entries.map((e) => ({ ...e })));
      } else {
        setEntries(staffList.map((s) => ({ ...s, status: "" })));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, reportName, metaLoaded, staffList]);

  const isLocked = report?.status === "submitted";

  const updateEntry = (idx, patch) => setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));

  const persist = async (targetStatus) => {
    setSaving(true);
    try {
      const saved = await saveMaintenanceUniformReportDraft({
        reportDate: date,
        reportName,
        entries,
        preparedBy: user?.name || "",
      });
      if (targetStatus === "submitted") {
        try {
          const submitted = await submitMaintenanceUniformReport(saved._id);
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

  const filteredEntries = entries
    .map((entry, idx) => ({ entry, idx }))
    .filter(({ entry }) => entry.staffName.toLowerCase().includes(search.trim().toLowerCase()));

  let lastDesignation = null;

  return (
    <div>
      <PageHeader
        title="Maintenance Uniform — Daily Report"
        subtitle="Pehle apna report name chunein, phir date, phir har staff member ke liye status assign karein."
        primaryAction={
          !reportName || isLocked
            ? undefined
            : { label: saving ? "Saving..." : "Submit Report", icon: <Send size={16} />, onClick: () => persist("submitted") }
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <ThemedSelect
          value={reportName}
          onChange={setReportName}
          options={REPORT_NAMES}
          placeholder="Select report"
          className="max-w-[200px]"
        />
        <ThemedDatePicker value={date} max={today()} onChange={setDate} className="max-w-[180px]" disabled={!reportName} />
        <div className="relative max-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff name..."
            disabled={!reportName}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        {isLocked && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
            <Lock size={12} /> Submitted — read only (ask Admin to unlock)
          </span>
        )}
      </div>

      {!reportName ? (
        <p className="text-sm text-subtext dark:text-gray-400">Pehle upar se apna report name select karein.</p>
      ) : staffList.length === 0 ? (
        <p className="text-sm text-subtext dark:text-gray-400">Is report ke sites ke liye koi staff nahi mila.</p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[70vh]">
              <table className="text-sm border-collapse w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">Staff Name</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">Site Name</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">{date}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-sm text-subtext dark:text-gray-400">
                        Is naam se koi staff nahi mila.
                      </td>
                    </tr>
                  )}
                  {filteredEntries.map(({ entry, idx }) => {
                    const showHeader = entry.designation !== lastDesignation;
                    lastDesignation = entry.designation;
                    return (
                      <React.Fragment key={idx}>
                        {showHeader && (
                          <tr className="bg-gray-100 dark:bg-gray-900/60">
                            <td colSpan={3} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                              {entry.designation}
                            </td>
                          </tr>
                        )}
                        <tr className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <td className="px-4 py-2 whitespace-nowrap font-medium text-heading dark:text-gray-100">{entry.staffName}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-600 dark:text-gray-400">{entry.siteName}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <ThemedSelect
                              disabled={isLocked}
                              value={entry.status}
                              onChange={(v) => updateEntry(idx, { status: v })}
                              options={meta.statusOptions}
                              placeholder="—"
                              className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 min-w-[170px] disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {entry.status && (
                              <div className="mt-1">
                                <StatusPill status={entry.status} />
                              </div>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
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
                  href={maintenanceUniformReportExportPdfUrl(report._id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FileText size={16} /> Download PDF
                </a>
                <a
                  href={maintenanceUniformReportExportUrl(report._id)}
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
