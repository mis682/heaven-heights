import React, { useEffect, useState } from "react";
import { Download, FileText, Unlock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusPill from "../../components/StatusPill";
import Modal from "../../components/Modal";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import { useAuth } from "../../context/AuthContext";
import {
  getGCHousekeepingReportMeta,
  listSubmittedGCHousekeepingReports,
  getGCHousekeepingReport,
  unlockGCHousekeepingReport,
  gcHousekeepingReportExportUrl,
  gcHousekeepingReportExportPdfUrl,
} from "../../api/gcHousekeepingReport";

export default function GCHousekeepingAdminReportPage() {
  const { user } = useAuth();
  const [statusOptions, setStatusOptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  // Which layout the currently-open report is displayed in — "classic" (the
  // existing flat table) or "card" (a grid of small checkpoint cards).
  // Defaults to classic on every open.
  const [layout, setLayout] = useState("classic");

  useEffect(() => {
    getGCHousekeepingReportMeta().then((m) => setStatusOptions(m.statusOptions));
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await listSubmittedGCHousekeepingReports({ from: dateFrom || undefined, to: dateTo || undefined });
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const view = async (id) => {
    setLayout("classic");
    setViewing(await getGCHousekeepingReport(id));
  };

  const handleUnlock = async (id) => {
    await unlockGCHousekeepingReport(id);
    setViewing(null);
    load();
  };

  return (
    <div>
      <PageHeader title="Garden City Housekeeping — Admin Report View" subtitle="Submitted daily reports, read-only." />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ThemedDatePicker value={dateFrom} onChange={setDateFrom} className="max-w-[160px]" />
        <span className="text-sm text-subtext dark:text-gray-400">to</span>
        <ThemedDatePicker value={dateTo} onChange={setDateTo} className="max-w-[160px]" />
      </div>

      <DataTable
        columns={[
          { key: "reportDate", header: "Date" },
          { key: "preparedBy", header: "Prepared By" },
          ...statusOptions.map((s) => ({ key: s, header: s, render: (r) => r.counts?.[s] ?? 0 })),
          { key: "submittedAt", header: "Submitted At", render: (r) => new Date(r.submittedAt).toLocaleString() },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex items-center gap-3">
                <button onClick={() => view(r._id)} className="text-xs font-semibold text-primary hover:underline">
                  View
                </button>
                <a href={gcHousekeepingReportExportUrl(r._id)} className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-1">
                  <Download size={12} /> Excel
                </a>
                <a href={gcHousekeepingReportExportPdfUrl(r._id)} className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-1">
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
        <Modal title={`Garden City Housekeeping — ${viewing.reportDate}`} onClose={() => setViewing(null)} wide>
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
                    <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 whitespace-nowrap">Checkpoint</th>
                    <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 whitespace-nowrap">{viewing.reportDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {viewing.entries.map((e, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <td className="px-3 py-2 whitespace-nowrap font-medium text-heading dark:text-gray-100">Checkpoint-{e.checkpointId}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {e.status ? <StatusPill status={e.status} /> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pr-1">
              {viewing.entries.map((e, idx) => {
                const isGood = e.status === statusOptions[0];
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
                    <span className="text-xs font-semibold text-heading dark:text-gray-100 truncate">Checkpoint-{e.checkpointId}</span>
                    {e.status ? <StatusPill status={e.status} /> : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2">
            <a
              href={gcHousekeepingReportExportPdfUrl(viewing._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText size={16} /> Download PDF
            </a>
            <a
              href={gcHousekeepingReportExportUrl(viewing._id)}
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
