import React, { useEffect, useState } from "react";
import { Download, FileText, Unlock } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import StatusPill from "../../../components/StatusPill";
import Modal from "../../../components/Modal";
import { Select } from "../../../components/FilterBar";
import { listSubmittedReports, getReport, unlockReport, exportReportUrl, exportReportPdfUrl } from "../../../api/nightguard";
import { getNightGuardMeta } from "../../../api/nightguard";
import { apiOrigin as API_BASE } from "../../../api/client";
import { useAuth } from "../../../context/AuthContext";

function dateRangeLabel(report) {
  const dates = report.entries.map((e) => e.date).filter(Boolean).sort();
  if (dates.length === 0) return report.reportDate || "";
  const min = dates[0];
  const max = dates[dates.length - 1];
  return min === max ? min : `${min} to ${max}`;
}

export default function NightGuardAdminReportPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [sites, setSites] = useState([]);
  const [site, setSite] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    getNightGuardMeta().then((m) => setSites(m.sites));
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await listSubmittedReports({ site: site || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [site, dateFrom, dateTo]);

  const view = async (id) => setViewing(await getReport(id));

  const handleUnlock = async (id) => {
    await unlockReport(id);
    setViewing(null);
    load();
  };

  return (
    <div>
      <PageHeader title="Night Guard — Admin Report View" subtitle="Submitted daily reports, read-only." />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select value={site} onChange={setSite} options={sites} placeholder="All sites" />
        <span className="text-sm text-subtext">Submitted between</span>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input max-w-[160px]" />
        <span className="text-sm text-subtext">and</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input max-w-[160px]" />
      </div>

      <DataTable
        columns={[
          { key: "dateRange", header: "Date" },
          { key: "preparedBy", header: "Prepared By" },
          { key: "sites", header: "Sites Covered", render: (r) => r.sites.join(", ") },
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
                <a href={exportReportUrl(r._id, API_BASE)} className="text-xs font-semibold text-gray-600 hover:underline inline-flex items-center gap-1">
                  <Download size={12} /> Excel
                </a>
                <a href={exportReportPdfUrl(r._id, API_BASE)} className="text-xs font-semibold text-gray-600 hover:underline inline-flex items-center gap-1">
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
        <Modal title={`Report — ${dateRangeLabel(viewing)}`} onClose={() => setViewing(null)} wide>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Date", "Site", "Time", "Status", "Guard Name"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viewing.entries.map((e) => (
                  <tr key={e._id} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-3 py-2">{e.date || viewing.reportDate}</td>
                    <td className="px-3 py-2">{e.site}</td>
                    <td className="px-3 py-2">{e.timeSlot}</td>
                    <td className="px-3 py-2"><StatusPill status={e.status} /></td>
                    <td className="px-3 py-2">{e.guardName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={exportReportPdfUrl(viewing._id, API_BASE)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileText size={16} /> Download PDF
            </a>
            <a
              href={exportReportUrl(viewing._id, API_BASE)}
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
