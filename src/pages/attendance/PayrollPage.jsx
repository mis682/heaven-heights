import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, Eye, FileSpreadsheet } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import ThemedSelect from "../../components/ThemedSelect";
import { getPayrollMeta, payrollExcelUrl, payrollPdfUrl } from "../../api/payroll";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PayrollPage() {
  const navigate = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayrollMeta().then((m) => {
      setDesignations(m.designations);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Payroll"
        subtitle="Designation-wise salary sheet — Team Attendance (present/half day/monthly leave), Overtime aur Staff Profile (bank/salary/PF/ESIC) ke data se automatically banta hai."
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
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

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <p className="text-center py-10 text-sm text-subtext dark:text-gray-400">Loading...</p>
        ) : designations.length === 0 ? (
          <p className="text-center py-10 text-sm text-subtext dark:text-gray-400">Koi designation nahi mila.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {designations.map((d) => (
              <div key={d} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <p className="font-semibold text-heading dark:text-gray-100">{d}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => window.open(payrollPdfUrl(d, month, year, false), "_blank")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Eye size={13} /> PDF View
                  </button>
                  <button
                    onClick={() => window.open(payrollPdfUrl(d, month, year, true), "_blank")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <FileText size={13} /> PDF Download
                  </button>
                  <button
                    onClick={() => navigate(`/attendance/payroll/${encodeURIComponent(d)}?month=${month}&year=${year}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Eye size={13} /> Excel View
                  </button>
                  <button
                    onClick={() => window.open(payrollExcelUrl(d, month, year), "_blank")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90"
                  >
                    <FileSpreadsheet size={13} /> Excel Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
