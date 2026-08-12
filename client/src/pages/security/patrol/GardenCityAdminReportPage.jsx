import React, { useEffect, useState } from "react";
import { Download, FileText, Unlock } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import StatusPill from "../../../components/StatusPill";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../context/AuthContext";
import {
  listSubmittedGardenCityReports,
  getGardenCityReport,
  unlockGardenCityReport,
  gardenCityReportExportUrl,
  gardenCityReportExportPdfUrl,
} from "../../../api/gardenCityPatrolReport";

export default function GardenCityAdminReportPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

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

  const view = async (id) => setViewing(await getGardenCityReport(id));

  const handleUnlock = async (id) => {
    await unlockGardenCityReport(id);
    setViewing(null);
    load();
  };

  return (
    <div>
      <PageHeader title="Garden City — Admin Report View" subtitle="Submitted daily reports for this site, read-only." />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input max-w-[160px]" />
        <span className="text-sm text-subtext">to</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input max-w-[160px]" />
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
                <a href={gardenCityReportExportUrl(r._id)} className="text-xs font-semibold text-gray-600 hover:underline inline-flex items-center gap-1">
                  <Download size={12} /> Excel
                </a>
                <a href={gardenCityReportExportPdfUrl(r._id)} className="text-xs font-semibold text-gray-600 hover:underline inline-flex items-center gap-1">
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
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="text-sm mb-4 border-collapse w-full">
              <thead className="sticky top-0">
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 whitespace-nowrap">Checkpoint</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 whitespace-nowrap">Time</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 whitespace-nowrap">Guard Name</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 whitespace-nowrap">{viewing.reportDate}</th>
                </tr>
              </thead>
              <tbody>
                {viewing.entries.map((e, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-heading">{e.checkpointLabel}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">{e.time}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{e.guardName || <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {e.status ? <StatusPill status={e.status} /> : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={gardenCityReportExportPdfUrl(viewing._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileText size={16} /> Download PDF
            </a>
            <a
              href={gardenCityReportExportUrl(viewing._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={16} /> Download Excel
            </a>
            {user?.role === "Admin" && (
              <button
                onClick={() => handleUnlock(viewing._id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
