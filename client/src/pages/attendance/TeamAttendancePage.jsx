import React, { useEffect, useMemo, useState } from "react";
import { User, FileText, FileSpreadsheet } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import {
  getTeamAttendanceSummary,
  teamAttendanceExportExcelUrl,
  teamAttendanceExportPdfUrl,
  setAttendanceOverride,
  clearAttendanceOverride,
} from "../../api/attendanceScan";
import { useAuth } from "../../context/AuthContext";

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

const OVERRIDE_STATUS_OPTIONS = ["P", "A", "HD", "SP"];

export default function TeamAttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ daysInMonth: 30, rows: [] });
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(null);

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

  const MENU_WIDTH = 180;
  const MENU_HEIGHT = 260;
  const openMenu = (e, row, d) => {
    if (!isAdmin) return;
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - MENU_WIDTH - 8);
    const y = Math.min(e.clientY, window.innerHeight - MENU_HEIGHT - 8);
    setMenu({ x, y, employeeId: row.employeeId, name: row.name, day: d.day, overridden: d.overridden });
  };

  const dateKeyFor = (day) => `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const applyOverride = async (status) => {
    const { employeeId, day } = menu;
    setMenu(null);
    await setAttendanceOverride({ employeeId, date: dateKeyFor(day), status, setBy: user?.name || "" });
    load();
  };

  const clearOverride = async () => {
    const { employeeId, day } = menu;
    setMenu(null);
    await clearAttendanceOverride(employeeId, dateKeyFor(day));
    load();
  };

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
        subtitle={
          isAdmin
            ? "Pehla scan Punch In, aakhri scan Punch Out — beech ke scans ignore hote hain. Kisi bhi din ke status par right-click karke manually edit kar sakte hain."
            : "Pehla scan Punch In, aakhri scan Punch Out — beech ke scans ignore hote hain."
        }
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
        <a
          href={teamAttendanceExportPdfUrl({ month, year, search: search || undefined })}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <FileText size={15} /> Export PDF
        </a>
        <a
          href={teamAttendanceExportExcelUrl({ month, year, search: search || undefined })}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <FileSpreadsheet size={15} /> Export Excel
        </a>
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
                          onContextMenu={(e) => openMenu(e, row, d)}
                          title={
                            d.overridden
                              ? `${STATUS_META[d.status].label} — manually set${d.setBy ? ` by ${d.setBy}` : ""}`
                              : d.totalHours != null
                              ? `${STATUS_META[d.status].label} — ${d.totalHours}h`
                              : STATUS_META[d.status].label
                          }
                          className={`inline-flex w-6 h-6 rounded-full ${STATUS_META[d.status].className} text-white items-center justify-center text-[10px] font-bold ${
                            isAdmin ? "cursor-context-menu" : ""
                          } ${d.overridden ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}
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

      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} onContextMenu={(e) => e.preventDefault()} />
          <div
            className="fixed z-50 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 min-w-[170px]"
            style={{ top: menu.y, left: menu.x }}
          >
            <p className="px-3 py-1.5 text-xs text-subtext border-b border-gray-100 mb-1 truncate">
              {menu.name} — {menu.day}/{month}/{year}
            </p>
            {OVERRIDE_STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => applyOverride(s)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-gray-50"
              >
                <span className={`inline-flex w-5 h-5 rounded-full ${STATUS_META[s].className} text-white items-center justify-center text-[9px] font-bold`}>
                  {s}
                </span>
                {STATUS_META[s].label}
              </button>
            ))}
            {menu.overridden && (
              <>
                <div className="border-t border-gray-100 mt-1" />
                <button onClick={clearOverride} className="w-full px-3 py-1.5 text-sm text-left text-gray-500 hover:bg-gray-50 mt-1">
                  Clear override (auto se calculate hone dein)
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
