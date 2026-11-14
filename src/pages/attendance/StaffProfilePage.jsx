import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Save, BadgeCheck } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { getStaffProfile, updateStaffProfile } from "../../api/staffProfile";
import { getTeamAttendanceSummary } from "../../api/attendanceScan";
import { useAuth } from "../../context/AuthContext";
import { cloudinaryThumbnailUrl } from "../../utils/cloudinary";
import { alertMessage } from "../../utils/confirmDialog";

function today() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_DETAILS = {
  dateOfBirth: "",
  joiningDate: "",
  aadharNumber: "",
  panNumber: "",
  uanNumber: "",
  esicNumber: "",
  bankName: "",
  bankAccountNo: "",
  bankIfscCode: "",
  salary: 0,
  basicSalary: 0,
  grossSalary: 0,
  petrolAmount: 0,
  employeePf: 0,
  employerPf: 0,
  employeeEsic: 0,
  employerEsic: 0,
  salaryDeduction: 0,
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-heading dark:text-gray-100 mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

export default function StaffProfilePage() {
  const { employeeId } = useParams();
  const { user } = useAuth();
  const [staff, setStaff] = useState(null);
  const [form, setForm] = useState(EMPTY_DETAILS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [monthStats, setMonthStats] = useState(null);

  useEffect(() => {
    setLoading(true);
    getStaffProfile(employeeId).then((p) => {
      setStaff(p);
      setForm({
        dateOfBirth: p.dateOfBirth || "",
        joiningDate: p.joiningDate || "",
        aadharNumber: p.aadharNumber || "",
        panNumber: p.panNumber || "",
        uanNumber: p.uanNumber || "",
        esicNumber: p.esicNumber || "",
        bankName: p.bankName || "",
        bankAccountNo: p.bankAccountNo || "",
        bankIfscCode: p.bankIfscCode || "",
        salary: p.salary || 0,
        basicSalary: p.basicSalary || 0,
        grossSalary: p.grossSalary || 0,
        petrolAmount: p.petrolAmount || 0,
        employeePf: p.employeePf || 0,
        employerPf: p.employerPf || 0,
        employeeEsic: p.employeeEsic || 0,
        employerEsic: p.employerEsic || 0,
        salaryDeduction: p.salaryDeduction || 0,
      });
      setLoading(false);
    });
  }, [employeeId]);

  useEffect(() => {
    const now = new Date();
    getTeamAttendanceSummary({ month: now.getMonth() + 1, year: now.getFullYear(), search: employeeId }).then((res) => {
      const row = res.rows.find((r) => r.employeeId === employeeId);
      setMonthStats(row || null);
    });
  }, [employeeId]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStaffProfile(employeeId, { ...form, setBy: user?.name || "" });
      await alertMessage("Profile saved.", { title: "Saved", icon: "success" });
    } catch (err) {
      await alertMessage(err.response?.data?.message || "Saving failed — please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-subtext dark:text-gray-400">Loading...</p>;
  }

  if (!staff) {
    return <p className="text-sm text-subtext dark:text-gray-400">Staff not found.</p>;
  }

  return (
    <div>
      <Link to="/attendance/team" className="inline-flex items-center gap-1.5 text-sm text-subtext dark:text-gray-400 hover:text-primary mb-4">
        <ArrowLeft size={15} /> Back to Team Attendance
      </Link>

      <PageHeader
        title="Staff Profile"
        subtitle="Personal, bank aur salary details — HR yahan se fill/edit kar sakte hain."
        primaryAction={{ label: saving ? "Saving..." : "Save", icon: <Save size={16} />, onClick: handleSave }}
      />

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-center gap-5">
          {staff.photo ? (
            <img
              src={cloudinaryThumbnailUrl(staff.photo, 200)}
              alt=""
              className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
              <User size={28} className="text-gray-400 dark:text-gray-500" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xl font-bold text-heading dark:text-gray-100 truncate">{staff.name}</p>
            <p className="text-sm text-subtext dark:text-gray-400">{staff.designation}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <BadgeCheck size={13} /> {staff.employeeId}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">{staff.siteName}</span>
              {staff.companyName && (
                <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">{staff.companyName}</span>
              )}
            </div>
          </div>
        </div>

        {monthStats && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
            {[
              { label: "Present %", value: `${monthStats.presentPercent}%`, color: "text-heading dark:text-gray-100" },
              { label: "Present", value: monthStats.totalPresent, color: "text-green-600 dark:text-green-400" },
              { label: "Absent", value: monthStats.totalAbsent, color: "text-red-600 dark:text-red-400" },
              { label: "Half Day", value: monthStats.totalHalfDay, color: "text-blue-600 dark:text-blue-400" },
              { label: "Single Punch", value: monthStats.totalSinglePunch, color: "text-amber-600 dark:text-amber-400" },
              { label: "Payable Days", value: monthStats.payableDays, color: "text-heading dark:text-gray-100" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-subtext dark:text-gray-400 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5">
        <Section title="Personal Details">
          <Field label="Date of Birth">
            <input type="date" max={today()} value={form.dateOfBirth} onChange={(e) => updateField("dateOfBirth", e.target.value)} className="input" />
          </Field>
          <Field label="Joining Date">
            <input type="date" max={today()} value={form.joiningDate} onChange={(e) => updateField("joiningDate", e.target.value)} className="input" />
          </Field>
          <Field label="Aadhar Number">
            <input value={form.aadharNumber} onChange={(e) => updateField("aadharNumber", e.target.value)} className="input" placeholder="XXXX XXXX XXXX" />
          </Field>
          <Field label="PAN Number">
            <input value={form.panNumber} onChange={(e) => updateField("panNumber", e.target.value)} className="input" placeholder="ABCDE1234F" />
          </Field>
        </Section>

        <Section title="Bank Details">
          <Field label="Bank Name">
            <input value={form.bankName} onChange={(e) => updateField("bankName", e.target.value)} className="input" />
          </Field>
          <Field label="Bank Account No.">
            <input value={form.bankAccountNo} onChange={(e) => updateField("bankAccountNo", e.target.value)} className="input" />
          </Field>
          <Field label="Bank IFSC Code">
            <input value={form.bankIfscCode} onChange={(e) => updateField("bankIfscCode", e.target.value)} className="input" placeholder="ABCD0123456" />
          </Field>
        </Section>

        <Section title="Salary & Statutory Details">
          <Field label="Salary">
            <input type="number" min={0} value={form.salary} onChange={(e) => updateField("salary", e.target.value)} className="input" />
          </Field>
          <Field label="Basic Salary">
            <input type="number" min={0} value={form.basicSalary} onChange={(e) => updateField("basicSalary", e.target.value)} className="input" />
          </Field>
          <Field label="Gross Salary">
            <input type="number" min={0} value={form.grossSalary} onChange={(e) => updateField("grossSalary", e.target.value)} className="input" />
          </Field>
          <Field label="Petrol Amount">
            <input type="number" min={0} value={form.petrolAmount} onChange={(e) => updateField("petrolAmount", e.target.value)} className="input" />
          </Field>
          <Field label="UAN Number">
            <input value={form.uanNumber} onChange={(e) => updateField("uanNumber", e.target.value)} className="input" />
          </Field>
          <Field label="ESIC Number">
            <input value={form.esicNumber} onChange={(e) => updateField("esicNumber", e.target.value)} className="input" />
          </Field>
          <Field label="Employee PF">
            <input type="number" min={0} value={form.employeePf} onChange={(e) => updateField("employeePf", e.target.value)} className="input" />
          </Field>
          <Field label="Employer PF">
            <input type="number" min={0} value={form.employerPf} onChange={(e) => updateField("employerPf", e.target.value)} className="input" />
          </Field>
          <Field label="Employee ESIC">
            <input type="number" min={0} value={form.employeeEsic} onChange={(e) => updateField("employeeEsic", e.target.value)} className="input" />
          </Field>
          <Field label="Employer ESIC">
            <input type="number" min={0} value={form.employerEsic} onChange={(e) => updateField("employerEsic", e.target.value)} className="input" />
          </Field>
          <Field label="Salary Deduction">
            <input type="number" min={0} value={form.salaryDeduction} onChange={(e) => updateField("salaryDeduction", e.target.value)} className="input" placeholder="0" />
          </Field>
        </Section>
      </div>
    </div>
  );
}
