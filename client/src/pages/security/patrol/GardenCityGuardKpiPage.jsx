import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import { getGardenCityGuardKpi } from "../../../api/gardenCityPatrolReport";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

// >=90% green, 70-90% amber, <70% red — same traffic-light convention as
// the rest of the app's percent-based indicators.
function percentClasses(pct) {
  if (pct >= 90) return "bg-green-100 text-green-800";
  if (pct >= 70) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

function downloadCsv(rows, from, to) {
  const header = ["Guard Name", "Total Checkpoints", "On Time", "Late", "No Photo", "On-Time %"];
  const lines = rows.map((r) => [r.guardName, r.total, r.onTime, r.late, r.noPhoto, r.onTimePercent].join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `garden-city-guard-kpi-${from}-to-${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function GardenCityGuardKpiPage() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [rows, setRows] = useState([]);
  const [lateThreshold, setLateThreshold] = useState(15);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    getGardenCityGuardKpi(from, to).then((r) => {
      setRows(r.rows);
      setLateThreshold(r.lateThresholdMinutes);
      setLoading(false);
    });
  }, [from, to]);

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
        title="Garden City — Guard KPI"
        subtitle={`Checkpoint punctuality per guard — actual photo time vs. scheduled time (>${lateThreshold} min counts as Late).`}
        primaryAction={
          rows.length > 0 ? { label: "Export CSV", icon: <Download size={16} />, onClick: () => downloadCsv(rows, from, to) } : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm text-subtext flex items-center gap-2">
          From
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="input" />
        </label>
        <label className="text-sm text-subtext flex items-center gap-2">
          To
          <input type="date" value={to} max={today()} onChange={(e) => setTo(e.target.value)} className="input" />
        </label>
        {!loading && (
          <span className="text-sm text-subtext">
            Overall: <span className="font-semibold text-heading">{overallPercent}% on time</span> ({totals.onTime}/{totals.total})
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-8" />
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Guard Name</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Total</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">On Time</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Late</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">No Photo</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">On-Time %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <React.Fragment key={r.guardName}>
                  <tr
                    className="border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpanded(expanded === r.guardName ? null : r.guardName)}
                  >
                    <td className="px-2 text-gray-400">
                      {r.lateDetails.length > 0 ? (expanded === r.guardName ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-heading whitespace-nowrap">{r.guardName}</td>
                    <td className="px-4 py-2.5 text-right">{r.total}</td>
                    <td className="px-4 py-2.5 text-right text-green-700">{r.onTime}</td>
                    <td className="px-4 py-2.5 text-right text-amber-700">{r.late}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500">{r.noPhoto}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${percentClasses(r.onTimePercent)}`}>
                        {r.onTimePercent}%
                      </span>
                    </td>
                  </tr>
                  {expanded === r.guardName && r.lateDetails.length > 0 && (
                    <tr>
                      <td colSpan={7} className="bg-gray-50 px-4 py-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Late checkpoints</p>
                        <div className="space-y-1">
                          {r.lateDetails
                            .slice()
                            .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))
                            .map((d, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs text-gray-600">
                                <span className="w-24 shrink-0">{d.date}</span>
                                <span className="w-16 shrink-0 font-medium text-heading">{d.checkpointLabel}</span>
                                <span className="w-24 shrink-0">{d.scheduledTime}</span>
                                <span className="text-amber-700 font-medium">Late by {d.lateByMinutes} min</span>
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
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-subtext">
                    Is date range mein koi checkpoint data nahi mila.
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
