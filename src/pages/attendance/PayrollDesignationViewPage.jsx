import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, FileSpreadsheet } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { getDesignationPayroll, payrollExcelUrl, payrollPdfUrl } from "../../api/payroll";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const COLUMNS = [
  { key: "sNo", label: "S No" },
  { key: "siteName", label: "Site" },
  { key: "employeeName", label: "Name" },
  { key: "employeeId", label: "E.ID" },
  { key: "bankAccountNo", label: "Bank A/C No." },
  { key: "bankName", label: "Bank" },
  { key: "bankIfscCode", label: "IFSC" },
  { key: "salary", label: "Salary" },
  { key: "petrol", label: "Petrol" },
  { key: "daysInMonth", label: "Days" },
  { key: "presentDays", label: "Present" },
  { key: "leaveAllowed", label: "Leave" },
  { key: "overTime", label: "OT" },
  { key: "totalDays", label: "Tot. Days" },
  { key: "rate", label: "Rate" },
  { key: "gross", label: "Gross" },
  { key: "hra", label: "HRA" },
  { key: "basic", label: "Basic" },
  { key: "employeePf", label: "Emp. PF" },
  { key: "employerPf", label: "Er. PF" },
  { key: "employeeEsic", label: "Emp. ESIC" },
  { key: "employerEsic", label: "Er. ESIC" },
  { key: "salaryDeduction", label: "Deduction" },
  { key: "salaryPayable", label: "Payable" },
  { key: "totalCtc", label: "Total CTC" },
  { key: "uanNumber", label: "UAN" },
  { key: "esicNumber", label: "ESIC No." },
  { key: "aadharNumber", label: "Aadhar" },
  { key: "panNumber", label: "PAN" },
];

function SummaryRow({ label, sums, bold }) {
  return (
    <tr className={bold ? "bg-gray-50 dark:bg-gray-900/40 font-semibold" : ""}>
      <td className="px-2 py-2 whitespace-nowrap" colSpan={2}>
        {label}
      </td>
      {COLUMNS.slice(2).map((c) => (
        <td key={c.key} className="px-2 py-2 text-right whitespace-nowrap">
          {typeof sums?.[c.key] === "number" ? sums[c.key] : ""}
        </td>
      ))}
    </tr>
  );
}

export default function PayrollDesignationViewPage() {
  const { designation } = useParams();
  const [searchParams] = useSearchParams();
  const month = Number(searchParams.get("month")) || new Date().getMonth() + 1;
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDesignationPayroll(designation, month, year).then((p) => {
      setPayroll(p);
      setLoading(false);
    });
  }, [designation, month, year]);

  return (
    <div>
      <Link to="/attendance/payroll" className="inline-flex items-center gap-1.5 text-sm text-subtext dark:text-gray-400 hover:text-primary mb-4">
        <ArrowLeft size={15} /> Back to Payroll
      </Link>

      <PageHeader
        title={`${designation} — Payroll`}
        subtitle={`${MONTH_NAMES[month - 1]} ${year}`}
        secondaryActions={[
          { label: "PDF", icon: <FileText size={15} />, onClick: () => window.open(payrollPdfUrl(designation, month, year, false), "_blank") },
        ]}
        primaryAction={{
          label: "Excel Download",
          icon: <FileSpreadsheet size={16} />,
          onClick: () => window.open(payrollExcelUrl(designation, month, year), "_blank"),
        }}
      />

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
        {loading ? (
          <p className="text-center py-10 text-sm text-subtext dark:text-gray-400">Loading...</p>
        ) : !payroll || payroll.siteGroups.length === 0 ? (
          <p className="text-center py-10 text-sm text-subtext dark:text-gray-400">Is designation mein koi staff nahi mila.</p>
        ) : (
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                {COLUMNS.map((c) => (
                  <th key={c.key} className="px-2 py-2 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payroll.siteGroups.map((group) => (
                <React.Fragment key={group.siteName}>
                  {group.rows.map((r) => (
                    <tr key={r.employeeId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                      {COLUMNS.map((c) => (
                        <td key={c.key} className="px-2 py-1.5 whitespace-nowrap text-heading dark:text-gray-100">
                          {r[c.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <SummaryRow label={`Total — ${group.siteName}`} sums={group.subtotal} />
                </React.Fragment>
              ))}
              {payroll.grandTotal && <SummaryRow label={`Total Amount of ${designation} Salary`} sums={payroll.grandTotal} bold />}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
