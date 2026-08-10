import React, { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { getTeamAttendanceSummary } from "../../api/attendanceScan";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_META = {
  P: { label: "Present", className: "bg-green-500" },
  A: { label: "Absent", className: "bg-red-500" },
  HD: { label: "Half Day", className: "bg-blue-500" },
  SP: { label: "Single Punch", className: "bg-amber-500" },
};

function presentPercent(days) {
  const relevant = days.filter((d) => d.status);
  if (!relevant.length) return 0;
  const presentCount = relevant.filter((d) => d.status === "P").length;
  return Math.round((presentCount / relevant.length) * 100);
}

export default function TeamAttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ daysInMonth: 30, rows: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await getTeamAttendanceSummary({ month, year, search: search || undefined });
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, search]);

  const dayHeaders = useMemo(
    () =>
      Array.from({ length: data.daysInMonth }, (_, i) => {
        const d = new Date(year, month - 1, i + 1);
        return { day: i + 1, weekday: d.toLocaleDateString("en-US", { weekday: "short" }) };
      }),
    [data.daysInMonth, year, month]
  );

  const colSpan = 2 + data.daysInMonth;

  return (
    <div>
      <PageHeader
        title="Team Attendance"
        subtitle="Pehla scan Punch In, aakhri scan Punch Out — beech ke scans ignore hote hain."
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or employee ID..."
          className="input flex-1 min-w-[220px]"
        />
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input w-auto">
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input w-auto">
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <span key={key} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`w-5 h-5 rounded-full ${meta.className} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
              {key}
            </span>
            {meta.label}
          </span>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 bg-gray-50 px-3 py-2.5 text-left font-medium text-gray-500 z-10 min-w-[180px]">
                Name
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-500 min-w-[80px]">Present %</th>
              {dayHeaders.map((d) => (
                <th key={d.day} className="px-1 py-2.5 text-center font-medium text-gray-500 min-w-[38px]">
                  <div>{d.day}</div>
                  <div className="text-[10px] text-gray-400 uppercase">{d.weekday}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-10 text-subtext text-sm">
                  Loading...
                </td>
              </tr>
            ) : data.rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-10 text-subtext text-sm">
                  Koi staff nahi mila
                </td>
              </tr>
            ) : (
              data.rows.map((row) => (
                <tr key={row.employeeId} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-3 py-2 z-10">
                    <div className="flex items-center gap-2">
                      {row.photo ? (
                        <img src={row.photo} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <User size={13} className="text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-heading truncate max-w-[130px]">{row.name}</p>
                        <p className="text-xs text-subtext truncate max-w-[130px]">{row.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-medium text-heading">{presentPercent(row.days)}%</td>
                  {row.days.map((d) => (
                    <td key={d.day} className="px-1 py-2 text-center">
                      {d.status ? (
                        <span
                          title={
                            d.totalHours != null
                              ? `${STATUS_META[d.status].label} — ${d.totalHours}h`
                              : STATUS_META[d.status].label
                          }
                          className={`inline-flex w-6 h-6 rounded-full ${STATUS_META[d.status].className} text-white items-center justify-center text-[10px] font-bold`}
                        >
                          {d.status}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
