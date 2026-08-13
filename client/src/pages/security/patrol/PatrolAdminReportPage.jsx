import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, FileText, Unlock } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import StatusPill from "../../../components/StatusPill";
import Modal from "../../../components/Modal";
import { getProjectBySlug } from "../../../api/projects";
import {
  listSubmittedPatrolReports,
  getPatrolReport,
  unlockPatrolReport,
  exportPatrolReportUrl,
  exportPatrolReportPdfUrl,
} from "../../../api/patrolReports";
import { useAuth } from "../../../context/AuthContext";
import { apiOrigin as API_BASE } from "../../../api/client";

function dateRangeLabel(report) {
  const dates = report.entries.map((e) => e.date).filter(Boolean).sort();
  if (dates.length === 0) return report.reportDate || "";
  const min = dates[0];
  const max = dates[dates.length - 1];
  return min === max ? min : `${min} to ${max}`;
}

export default function PatrolAdminReportPage() {
  const { project: slug } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    getProjectBySlug(slug).then((d) => setProject(d.project));
  }, [slug]);

  const load = async () => {
    if (!project) return;
    setLoading(true);
    const data = await listSubmittedPatrolReports({
      projectId: project._id,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, dateFrom, dateTo]);

  const view = async (id) => setViewing(await getPatrolReport(id));

  const handleUnlock = async (id) => {
    await unlockPatrolReport(id);
    setViewing(null);
    load();
  };

  if (!project) {
    return <p className="text-sm text-subtext">Loading...</p>;
  }

  return (
    <div>
      <PageHeader title={`${project.name} — Admin Report View`} subtitle="Submitted daily reports for this site, read-only." />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-subtext">Submitted between</span>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input max-w-[160px]" />
        <span className="text-sm text-subtext">and</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input max-w-[160px]" />
      </div>

      <DataTable
        columns={[
          { key: "dateRange", header: "Date" },
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
                <a href={exportPatrolReportUrl(r._id, API_BASE)} className="text-xs font-semibold text-gray-600 hover:underline inline-flex items-center gap-1">
                  <Download size={12} /> Excel
                </a>
                <a href={exportPatrolReportPdfUrl(r._id, API_BASE)} className="text-xs font-semibold text-gray-600 hover:underline inline-flex items-center gap-1">
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
        <Modal title={`${viewing.projectName} — ${dateRangeLabel(viewing)}`} onClose={() => setViewing(null)} wide>
          <div className="overflow-x-auto">
            <table className="text-sm mb-4 border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 sticky left-0 bg-gray-50 whitespace-nowrap">
                    Date
                  </th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 whitespace-nowrap">Guard Name</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 whitespace-nowrap">Time</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 whitespace-nowrap">Checkpoint</th>
                  {Array.from({ length: viewing.checkpointCount }, (_, i) => (
                    <th key={i} className="text-left px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 whitespace-nowrap">
                      Checkpoint-{i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viewing.entries.map((e) => (
                  <tr key={e._id} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-3 py-2 sticky left-0 bg-white whitespace-nowrap">{e.date || viewing.reportDate}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{e.guardName}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{e.timeSlot}</td>
                    <td className="px-3 py-2 whitespace-nowrap">C1 TO C{viewing.checkpointCount}</td>
                    {e.checkpointStatuses.map((status, idx) => (
                      <td key={idx} className="px-3 py-2 whitespace-nowrap">
                        {status ? <StatusPill status={status} /> : <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={exportPatrolReportPdfUrl(viewing._id, API_BASE)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileText size={16} /> Download PDF
            </a>
            <a
              href={exportPatrolReportUrl(viewing._id, API_BASE)}
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
