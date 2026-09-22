import React, { useEffect, useState } from "react";
import { Download, FileText, Unlock } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import StatusPill from "../../../components/StatusPill";
import Modal from "../../../components/Modal";
import ThemedDatePicker from "../../../components/ThemedDatePicker";
import { useAuth } from "../../../context/AuthContext";
import {
  listSubmittedGardenCityReports,
  getGardenCityReport,
  unlockGardenCityReport,
  gardenCityReportExportUrl,
  gardenCityReportExportPdfUrl,
} from "../../../api/gardenCityPatrolReport";

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

// Same flat entries, grouped guard -> checkpoint -> [visits] so each
// checkpoint's scan times collapse onto one row instead of repeating the
// checkpoint label across a separate row per scan.
function groupByGuardThenCheckpoint(entries) {
  const guardOrder = [];
  const byGuard = new Map();
  entries.forEach((e) => {
    const name = e.guardName || "Unassigned";
    if (!byGuard.has(name)) {
      byGuard.set(name, []);
      guardOrder.push(name);
    }
    byGuard.get(name).push(e);
  });

  return guardOrder.map((guardName) => {
    const guardEntries = byGuard.get(guardName);
    const cpOrder = [];
    const byCheckpoint = new Map();
    guardEntries.forEach((e) => {
      if (!byCheckpoint.has(e.checkpointLabel)) {
        byCheckpoint.set(e.checkpointLabel, []);
        cpOrder.push(e.checkpointLabel);
      }
      byCheckpoint.get(e.checkpointLabel).push(e);
    });
    const presentCount = guardEntries.filter((e) => e.status === "Present").length;
    return {
      guardName,
      total: guardEntries.length,
      presentCount,
      checkpoints: cpOrder.map((label) => ({ label, visits: byCheckpoint.get(label) })),
    };
  });
}

export default function GardenCityAdminReportPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  // Which layout the currently-open report is displayed in — "classic"
  // (the existing flat repeating-row table) or "card" (grouped by guard).
  // Defaults to classic on every open so a plain "Download PDF" click keeps
  // behaving exactly as it does today unless someone explicitly switches.
  const [layout, setLayout] = useState("classic");
  const viewingBandColors = viewing ? getBandColors(viewing.entries) : [];
  const viewingGuards = viewing ? groupByGuardThenCheckpoint(viewing.entries) : [];

  const load = async () => {
    setLoading(true);
    const data = await listSubmittedGardenCityReports({ from: dateFrom || undefined, to: dateTo || undefined });
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const view = async (id) => {
    setLayout("classic");
    setViewing(await getGardenCityReport(id));
  };

  const handleUnlock = async (id) => {
    await unlockGardenCityReport(id);
    setViewing(null);
    load();
  };

  return (
    <div>
      <PageHeader title="Garden City — Admin Report View" subtitle="Submitted daily reports for this site, read-only." />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ThemedDatePicker value={dateFrom} onChange={setDateFrom} className="max-w-[160px]" />
        <span className="text-sm text-subtext dark:text-gray-400">to</span>
        <ThemedDatePicker value={dateTo} onChange={setDateTo} className="max-w-[160px]" />
      </div>

      <DataTable
        columns={[
          { key: "reportDate", header: "Date" },
          { key: "preparedBy", header: "Prepared By" },
          { key: "guards", header: "Guards Covered", render: (r) => r.guards.join(", ") },
          { key: "present", header: "Present" },
          { key: "absent", header: "Absent" },
          { key: "submittedAt", header: "Submitted At", render: (r) => new Date(r.submittedAt).toLocaleString() },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex items-center gap-3">
                <button onClick={() => view(r._id)} className="text-xs font-semibold text-primary hover:underline">
                  View
                </button>
                <a href={gardenCityReportExportUrl(r._id)} className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-1">
                  <Download size={12} /> Excel
                </a>
                <a href={gardenCityReportExportPdfUrl(r._id)} className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-1">
                  <FileText size={12} /> PDF
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
        <Modal title={`Garden City — ${viewing.reportDate}`} onClose={() => setViewing(null)} wide>
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
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="text-sm mb-4 border-collapse w-full">
                <thead className="sticky top-0">
                  <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 whitespace-nowrap">Checkpoint & Time</th>
                    <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 whitespace-nowrap">Guard Name</th>
                    <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 whitespace-nowrap">{viewing.reportDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {viewing.entries.map((e, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <td className="px-3 py-2 whitespace-nowrap font-medium text-heading" style={{ backgroundColor: viewingBandColors[idx] }}>
                        {e.checkpointLabel} {e.time}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-gray-200">{e.guardName || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {e.status ? <StatusPill status={e.status} /> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto mb-4 space-y-3 pr-1">
              {viewingGuards.map((guard) => {
                const flagged = guard.total - guard.presentCount;
                return (
                  <div
                    key={guard.guardName}
                    className={`rounded-lg border overflow-hidden ${
                      flagged > 0 ? "border-red-200 dark:border-red-900/50" : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between px-3 py-2 ${
                        flagged > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-50 dark:bg-gray-900/40"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${flagged > 0 ? "text-red-700 dark:text-red-400" : "text-heading dark:text-gray-100"}`}>
                        {guard.guardName}
                      </span>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {guard.presentCount} / {guard.total} Present
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {guard.checkpoints.map((cp) => (
                        <div key={cp.label} className="flex items-center gap-3 px-3 py-2 flex-wrap">
                          <span className="text-sm font-semibold text-heading dark:text-gray-100 w-14 flex-shrink-0">{cp.label}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {cp.visits.map((v, i) => (
                              <span
                                key={i}
                                className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                                  v.status === "Present"
                                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {v.status === "Present" ? v.time : `${v.time} — ${v.status}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2">
            <a
              href={gardenCityReportExportPdfUrl(viewing._id, layout)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText size={16} /> Download PDF
            </a>
            <a
              href={gardenCityReportExportUrl(viewing._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download size={16} /> Download Excel
            </a>
            {user?.role === "Admin" && (
              <button
                onClick={() => handleUnlock(viewing._id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
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
