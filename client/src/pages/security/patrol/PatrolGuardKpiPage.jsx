import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import ThemedDatePicker from "../../../components/ThemedDatePicker";
import { getProjectBySlug } from "../../../api/projects";
import { getPatrolGuardKpi } from "../../../api/patrolReports";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function percentClasses(pct) {
  if (pct >= 90) return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400";
  if (pct >= 70) return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400";
  return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400";
}

function downloadCsv(rows, projectName, from, to) {
  const header = ["Guard Name", "Total Checkpoints", "On Time", "Late", "Missed", "On-Time %"];
  const lines = rows.map((r) => [r.guardName, r.total, r.onTime, r.late, r.noPhoto, r.onTimePercent].join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-guard-kpi-${from}-to-${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PatrolGuardKpiPage() {
  const { project: slug } = useParams();
  const [project, setProject] = useState(null);
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getProjectBySlug(slug).then((d) => setProject(d.project));
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    getPatrolGuardKpi(slug, from, to).then((r) => {
      setRows(r.rows);
      setLoading(false);
    });
  }, [slug, from, to]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          onTime: acc.onTime + r.onTime,
          late: acc.late + r.late,
          noPhoto: acc.noPhoto + r.noPhoto,
          total: acc.total + r.total,
        }),
        { onTime: 0, late: 0, noPhoto: 0, total: 0 }
      ),
    [rows]
  );
  const overallPercent = totals.total > 0 ? Math.round((totals.onTime / totals.total) * 100) : 0;

  return (
    <div>
      <PageHeader
        title={`${project?.name || "Patrol"} — Guard KPI`}
        subtitle="Har round guard ke pehle checkpoint se shuru hota hai — agle 60 minute ke andar baaki saare checkpoints cover hone chahiye. Miss ya late hone par us guard ka KPI kam hota hai."
        primaryAction={
          rows.length > 0
            ? { label: "Export CSV", icon: <Download size={16} />, onClick: () => downloadCsv(rows, project?.name || "patrol", from, to) }
            : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm text-subtext dark:text-gray-400 flex items-center gap-2">
          From
          <ThemedDatePicker value={from} max={to} onChange={setFrom} className="w-40" />
        </label>
        <label className="text-sm text-subtext dark:text-gray-400 flex items-center gap-2">
          To
          <ThemedDatePicker value={to} max={today()} onChange={setTo} className="w-40" />
        </label>
        {!loading && (
          <span className="text-sm text-subtext dark:text-gray-400">
            Overall: <span className="font-semibold text-heading dark:text-gray-100">{overallPercent}% on time</span> ({totals.onTime}/{totals.total})
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                <th className="w-8" />
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Guard Name</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">On Time</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Late</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Missed</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">On-Time %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <React.Fragment key={r.guardName}>
                  <tr
                    className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    onClick={() => setExpanded(expanded === r.guardName ? null : r.guardName)}
                  >
                    <td className="px-2 text-gray-400">
                      {r.lateDetails.length > 0 ? (expanded === r.guardName ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-heading dark:text-gray-100 whitespace-nowrap">{r.guardName}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-200">{r.total}</td>
                    <td className="px-4 py-2.5 text-right text-green-700 dark:text-green-400">{r.onTime}</td>
                    <td className="px-4 py-2.5 text-right text-amber-700 dark:text-amber-400">{r.late}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-400">{r.noPhoto}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${percentClasses(r.onTimePercent)}`}>
                        {r.onTimePercent}%
                      </span>
                    </td>
                  </tr>
                  {expanded === r.guardName && r.lateDetails.length > 0 && (
                    <tr>
                      <td colSpan={7} className="bg-gray-50 dark:bg-gray-900/40 px-4 py-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Late / missed checkpoints</p>
                        <div className="space-y-1">
                          {r.lateDetails
                            .slice()
                            .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))
                            .map((d, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                                <span className="w-24 shrink-0">{d.date}</span>
                                <span className="w-40 shrink-0 font-medium text-heading dark:text-gray-100">{d.checkpointLabel}</span>
                                <span className="w-44 shrink-0">{d.scheduledTime}</span>
                                {d.lateByMinutes == null ? (
                                  <span className="text-gray-500 dark:text-gray-400 font-medium">Missed — no photo</span>
                                ) : (
                                  <span className="text-amber-700 dark:text-amber-400 font-medium">Late by {d.lateByMinutes} min</span>
                                )}
                              </div>
                            ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-subtext dark:text-gray-400">
                    Is date range mein koi submitted round nahi mila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
