import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import PageHeader from "./PageHeader";
import ThemedDatePicker from "./ThemedDatePicker";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

// >=90% green, 70-90% amber, <70% red — same traffic-light convention as
// Guard KPI's On-Time % and the rest of the app's percent-based indicators.
function percentClasses(pct) {
  if (pct >= 90) return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400";
  if (pct >= 70) return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400";
  return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400";
}

// Shared compliance-KPI page, reused across every checklist module (Garden
// City Housekeeping, GC Club, Reserve Club, Regal Garden Club, One Business
// Center, Nature Park, Maintenance Uniform) — same shape as Guard KPI
// (date-range, per-group OK%, expandable details) but tracking OK vs Not OK
// instead of On Time vs Late, since these modules have no scheduled-time
// concept.
//
// `fetchKpi(from, to)` must resolve to an array of
// { key, label, total, ok, notOk, okPercent, breakdown, notOkDetails }
// (see backend/utils/checklistKpi.js) — the grouping dimension (checkpoint
// vs staff) and any extra filter (form/report-name) are the caller's job,
// passed in via closures and rendered into the toolbar via `extraFilter`.
export default function ChecklistKpiPage({ title, subtitle, groupColumnLabel = "Checkpoint", fetchKpi, pdfUrl, extraFilter }) {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchKpi(from, to).then((r) => {
      setRows(r);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, fetchKpi]);

  const totals = useMemo(
    () => rows.reduce((acc, r) => ({ ok: acc.ok + r.ok, notOk: acc.notOk + r.notOk, total: acc.total + r.total }), { ok: 0, notOk: 0, total: 0 }),
    [rows]
  );
  const overallPercent = totals.total > 0 ? Math.round((totals.ok / totals.total) * 100) : 0;

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        primaryAction={
          rows.length > 0 ? { label: "Download PDF", icon: <FileText size={16} />, onClick: () => window.open(pdfUrl(from, to), "_blank") } : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm text-subtext dark:text-gray-400 flex items-center gap-2">
          From
          <ThemedDatePicker value={from} max={to} onChange={setFrom} />
        </label>
        <label className="text-sm text-subtext dark:text-gray-400 flex items-center gap-2">
          To
          <ThemedDatePicker value={to} max={today()} onChange={setTo} />
        </label>
        {extraFilter}
        {!loading && (
          <span className="text-sm text-subtext dark:text-gray-400">
            Overall: <span className="font-semibold text-heading dark:text-gray-100">{overallPercent}% OK</span> ({totals.ok}/{totals.total})
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                <th className="w-8" />
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{groupColumnLabel}</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">OK</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Not OK</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">OK %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <React.Fragment key={r.key}>
                  <tr
                    className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    onClick={() => setExpanded(expanded === r.key ? null : r.key)}
                  >
                    <td className="px-2 text-gray-400">
                      {r.notOkDetails.length > 0 ? (expanded === r.key ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-heading dark:text-gray-100 whitespace-nowrap">{r.label}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-200">{r.total}</td>
                    <td className="px-4 py-2.5 text-right text-green-700 dark:text-green-400">{r.ok}</td>
                    <td className="px-4 py-2.5 text-right text-red-700 dark:text-red-400">{r.notOk}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${percentClasses(r.okPercent)}`}>{r.okPercent}%</span>
                    </td>
                  </tr>
                  {expanded === r.key && r.notOkDetails.length > 0 && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50 dark:bg-gray-900/40 px-4 py-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Not OK breakdown</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(r.breakdown).map(([status, count]) => (
                            <span key={status} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              {status}: {count}
                            </span>
                          ))}
                        </div>
                        <div className="space-y-1">
                          {r.notOkDetails
                            .slice()
                            .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))
                            .map((d, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                                <span className="w-24 shrink-0">{d.date}</span>
                                <span className="text-red-700 dark:text-red-400 font-medium">{d.status}</span>
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
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-subtext dark:text-gray-400">
                    Is date range mein koi submitted report nahi mila.
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
