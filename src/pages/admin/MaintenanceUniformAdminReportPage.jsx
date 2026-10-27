import React, { useEffect, useState } from "react";
import { Download, FileText, Unlock, Shield, Sparkles, Leaf, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusPill from "../../components/StatusPill";
import Modal from "../../components/Modal";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import ThemedSelect from "../../components/ThemedSelect";
import { useAuth } from "../../context/AuthContext";
import { MAINTENANCE_UNIFORM_REPORT_FORMATS } from "../../constants/maintenanceUniform";
import {
  getMaintenanceUniformReportMeta,
  listSubmittedMaintenanceUniformReports,
  getMaintenanceUniformReport,
  unlockMaintenanceUniformReport,
  maintenanceUniformReportExportUrl,
  maintenanceUniformReportExportPdfUrl,
} from "../../api/maintenanceUniformReport";

const REPORT_NAMES = Object.keys(MAINTENANCE_UNIFORM_REPORT_FORMATS);

export default function MaintenanceUniformAdminReportPage() {
  const { user } = useAuth();
  const [meta, setMeta] = useState({ statusOptions: [] });
  const [reports, setReports] = useState([]);
  const [reportName, setReportName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  // Which layout the currently-open report is displayed in — "classic" (the
  // existing grouped-by-designation list) or "card" (a flat grid of
  // per-staff cards, matching the pattern used in other checklist modules).
  // Defaults to classic on every open.
  const [layout, setLayout] = useState("classic");

  useEffect(() => {
    getMaintenanceUniformReportMeta().then(setMeta);
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await listSubmittedMaintenanceUniformReports({
      from: dateFrom || undefined,
      to: dateTo || undefined,
      reportName: reportName || undefined,
    });
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, reportName]);

  const view = async (id) => {
    setLayout("classic");
    setViewing(await getMaintenanceUniformReport(id));
  };

  const handleUnlock = async (id) => {
    await unlockMaintenanceUniformReport(id);
    setViewing(null);
    load();
  };

  const DESIGNATION_META = {
    "Security Guard": { icon: Shield, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    "House Keeping": { icon: Sparkles, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    Gardener: { icon: Leaf, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
  };

  const groupedEntries = (entries) => {
    const groups = [];
    for (const e of entries) {
      const last = groups[groups.length - 1];
      if (last && last.designation === e.designation) last.rows.push(e);
      else groups.push({ designation: e.designation, rows: [e] });
    }
    return groups;
  };

  return (
    <div>
      <PageHeader title="Maintenance Uniform — Admin Report View" subtitle="Submitted daily reports, read-only." />

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <ThemedSelect value={reportName} onChange={setReportName} options={REPORT_NAMES} placeholder="All reports" className="max-w-[200px]" />
        <ThemedDatePicker value={dateFrom} onChange={setDateFrom} className="max-w-[160px]" />
        <span className="text-sm text-subtext dark:text-gray-400">to</span>
        <ThemedDatePicker value={dateTo} onChange={setDateTo} className="max-w-[160px]" />
      </div>
      <p className="text-xs text-subtext dark:text-gray-400 mb-4">
        Priyanka/Niketa Reports purane split-era reports hain (ab wapas combined ho chuka hai) — blank chhod ke sab reports (purane + naye combined) dekh sakte hain.
      </p>

      <DataTable
        columns={[
          { key: "reportDate", header: "Date" },
          { key: "reportName", header: "Report", render: (r) => r.reportName || "Combined" },
          { key: "preparedBy", header: "Prepared By" },
          ...meta.statusOptions.map((s) => ({ key: s, header: s, render: (r) => r.counts?.[s] ?? 0 })),
          { key: "submittedAt", header: "Submitted At", render: (r) => new Date(r.submittedAt).toLocaleString() },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex items-center gap-3">
                <button onClick={() => view(r._id)} className="text-xs font-semibold text-primary hover:underline">
                  View
                </button>
                <a href={maintenanceUniformReportExportUrl(r._id)} className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:underline inline-flex items-center gap-1">
                  <Download size={12} /> Excel
                </a>
                <a href={maintenanceUniformReportExportPdfUrl(r._id, "classic")} className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:underline inline-flex items-center gap-1">
                  <FileText size={12} /> PDF (Classic)
                </a>

                <a href={maintenanceUniformReportExportPdfUrl(r._id, "card")} className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:underline inline-flex items-center gap-1">
                  <FileText size={12} /> PDF (Card)
                </a>
              </div>
            ),
          },
        ]}
        rows={loading ? [] : reports}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No submitted reports match these filters"}
      />

      {viewing && (
        <Modal title={`Maintenance Uniform — ${viewing.reportName || "Combined"} — ${viewing.reportDate}`} onClose={() => setViewing(null)} wide>
          <div className="flex justify-end mb-3">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-900/40">
              <button
                onClick={() => setLayout("classic")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                  layout === "classic" ? "bg-white dark:bg-gray-800 text-heading dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Classic
              </button>
              <button
                onClick={() => setLayout("card")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                  layout === "card" ? "bg-white dark:bg-gray-800 text-heading dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Card view
              </button>
            </div>
          </div>

          {layout === "classic" ? (
            <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              {groupedEntries(viewing.entries).map((group) => {
                const meta = DESIGNATION_META[group.designation] || { icon: Users, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-900/30" };
                const Icon = meta.icon;
                const okCount = group.rows.filter((r) => r.status === "OK").length;
                return (
                  <div key={group.designation} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className={`flex items-center justify-between px-4 py-2.5 ${meta.bg}`}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={meta.color} />
                        <span className="text-sm font-semibold text-heading dark:text-gray-100">{group.designation}</span>
                      </div>
                      <span className="text-xs text-subtext dark:text-gray-400">
                        {okCount}/{group.rows.length} OK
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {group.rows.map((e, idx) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800">
                          <div>
                            <p className="text-sm font-medium text-heading dark:text-gray-100">{e.staffName}</p>
                            <p className="text-xs text-subtext dark:text-gray-400">{e.siteName}</p>
                          </div>
                          {e.status ? <StatusPill status={e.status} /> : <span className="text-sm text-gray-300 dark:text-gray-600">—</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              {groupedEntries(viewing.entries).map((group) => {
                const meta2 = DESIGNATION_META[group.designation] || { icon: Users, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-900/30" };
                const Icon = meta2.icon;
                const okCount = group.rows.filter((r) => r.status === "OK").length;
                return (
                  <div key={group.designation} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className={`flex items-center justify-between px-4 py-2.5 ${meta2.bg}`}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={meta2.color} />
                        <span className="text-sm font-semibold text-heading dark:text-gray-100">{group.designation}</span>
                      </div>
                      <span className="text-xs text-subtext dark:text-gray-400">
                        {okCount}/{group.rows.length} OK
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 bg-white dark:bg-gray-800">
                      {group.rows.map((e, idx) => {
                        const isGood = e.status === meta.statusOptions[0];
                        const flagged = e.status && !isGood;
                        return (
                          <div
                            key={idx}
                            className={`rounded-lg border p-3 flex flex-col gap-1.5 ${
                              flagged
                                ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <span className="text-xs font-semibold text-heading dark:text-gray-100 truncate">{e.staffName}</span>
                            <span className="text-[11px] text-subtext dark:text-gray-400 truncate">{e.siteName}</span>
                            {e.status ? <StatusPill status={e.status} /> : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2">
            <a
              href={maintenanceUniformReportExportPdfUrl(viewing._id, "classic")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText size={16} /> PDF (Classic)
            </a>

            <a
              href={maintenanceUniformReportExportPdfUrl(viewing._id, "card")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText size={16} /> PDF (Card)
            </a>
            <a
              href={maintenanceUniformReportExportUrl(viewing._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download size={16} /> Download Excel
            </a>
            {user?.role === "Admin" && (
              <button
                onClick={() => handleUnlock(viewing._id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Unlock size={16} /> Unlock for correction
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
