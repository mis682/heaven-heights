import React, { useEffect, useState } from "react";
import { Download, FileText, Unlock, Shield, Sparkles, Leaf, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusPill from "../../components/StatusPill";
import Modal from "../../components/Modal";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import { useAuth } from "../../context/AuthContext";
import {
  getMaintenanceUniformReportMeta,
  listSubmittedMaintenanceUniformReports,
  getMaintenanceUniformReport,
  unlockMaintenanceUniformReport,
  maintenanceUniformReportExportUrl,
  maintenanceUniformReportExportPdfUrl,
} from "../../api/maintenanceUniformReport";

export default function MaintenanceUniformAdminReportPage() {
  const { user } = useAuth();
  const [meta, setMeta] = useState({ statusOptions: [] });
  const [reports, setReports] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    getMaintenanceUniformReportMeta().then(setMeta);
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await listSubmittedMaintenanceUniformReports({ from: dateFrom || undefined, to: dateTo || undefined });
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const view = async (id) => setViewing(await getMaintenanceUniformReport(id));

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

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ThemedDatePicker value={dateFrom} onChange={setDateFrom} className="max-w-[160px]" />
        <span className="text-sm text-subtext dark:text-gray-400">to</span>
        <ThemedDatePicker value={dateTo} onChange={setDateTo} className="max-w-[160px]" />
      </div>

      <DataTable
        columns={[
          { key: "reportDate", header: "Date" },
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
                <a href={maintenanceUniformReportExportPdfUrl(r._id)} className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:underline inline-flex items-center gap-1">
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
        <Modal title={`Maintenance Uniform — ${viewing.reportDate}`} onClose={() => setViewing(null)} wide>
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
          <div className="flex items-center gap-2">
            <a
              href={maintenanceUniformReportExportPdfUrl(viewing._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText size={16} /> Download PDF
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
