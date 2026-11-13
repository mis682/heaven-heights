import React, { useEffect, useRef, useState } from "react";
import { User, Check } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import ThemedSelect from "../../components/ThemedSelect";
import { getOvertimeList, setOvertime } from "../../api/attendanceOvertime";
import { useAuth } from "../../context/AuthContext";
import { cloudinaryThumbnailUrl } from "../../utils/cloudinary";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function OvertimePage() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedId, setSavedId] = useState(null);

  const requestIdRef = useRef(0);

  const load = async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    const res = await getOvertimeList({ month, year, search: search || undefined });
    if (requestId !== requestIdRef.current) return;
    setRows(res.rows);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, search]);

  const updateLocalDays = (employeeId, days) =>
    setRows((prev) => prev.map((r) => (r.employeeId === employeeId ? { ...r, days } : r)));

  const saveDays = async (employeeId, days) => {
    const value = Math.max(0, Number(days) || 0);
    await setOvertime({ employeeId, month, year, days: value, setBy: user?.name || "" });
    setSavedId(employeeId);
    setTimeout(() => setSavedId((id) => (id === employeeId ? null : id)), 1500);
  };

  return (
    <div>
      <PageHeader
        title="Overtime"
        subtitle="Har staff member ke liye is month ka overtime (extra din) ka count yahan daalein."
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or employee ID..."
          className="input flex-1 min-w-[220px]"
        />
        <ThemedSelect
          value={month}
          onChange={(v) => setMonth(Number(v))}
          options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
          className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 w-auto"
        />
        <ThemedSelect
          value={year}
          onChange={(v) => setYear(Number(v))}
          options={[year - 1, year, year + 1].map((y) => ({ value: y, label: String(y) }))}
          className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 w-auto"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
              <th className="px-3 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 min-w-[180px]">Name</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 min-w-[120px]">Site</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 min-w-[140px]">Overtime (Days)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-10 text-subtext dark:text-gray-400 text-sm">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-10 text-subtext dark:text-gray-400 text-sm">
                  Koi staff nahi mila
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.employeeId} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {row.photo ? (
                        <img src={cloudinaryThumbnailUrl(row.photo, 100)} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                          <User size={13} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-heading dark:text-gray-100 truncate max-w-[150px]">{row.name}</p>
                        <p className="text-xs text-subtext dark:text-gray-400 truncate max-w-[150px]">{row.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-subtext dark:text-gray-400">{row.siteName}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={row.days}
                        onChange={(e) => updateLocalDays(row.employeeId, e.target.value)}
                        onBlur={(e) => saveDays(row.employeeId, e.target.value)}
                        className="input w-20 py-1.5"
                      />
                      {savedId === row.employeeId && <Check size={15} className="text-green-500" />}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
