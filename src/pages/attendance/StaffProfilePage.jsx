import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Save, BadgeCheck, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import ThemedSelect from "../../components/ThemedSelect";
import Time12hInput from "../../components/Time12hInput";
import { getStaffProfile, updateStaffProfile, lookupPincode } from "../../api/staffProfile";
import { getTeamAttendanceSummary } from "../../api/attendanceScan";
import { useAuth } from "../../context/AuthContext";
import { cloudinaryThumbnailUrl } from "../../utils/cloudinary";
import { alertMessage } from "../../utils/confirmDialog";

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Parses a "hh:mm AM/PM" string (same format Time12hInput produces) into
// minutes since midnight, for computing shift duration.
function parseTime12h(value) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value || "");
  if (!m) return null;
  let hour = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") hour += 12;
  return hour * 60 + Number(m[2]);
}

// Shift Duration, auto-derived from Punch In/Out Time — not stored, so it
// can never go stale relative to the two times it's computed from. Wraps
// past midnight (e.g. 10 PM - 6 AM is an 8-hour night shift, not negative).
function shiftDurationLabel(punchInTime, punchOutTime) {
  const inMinutes = parseTime12h(punchInTime);
  const outMinutes = parseTime12h(punchOutTime);
  if (inMinutes === null || outMinutes === null) return "—";
  let diff = outMinutes - inMinutes;
  if (diff <= 0) diff += 24 * 60;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return minutes === 0 ? `${hours} hour${hours === 1 ? "" : "s"}` : `${hours} hr ${minutes} min`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const LEDGER_STATUS_META = {
  P: { label: "Present", dot: "bg-green-500", text: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/10" },
  A: { label: "Absent", dot: "bg-red-500", text: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/10" },
  HD: { label: "Half Day", dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/10" },
  SP: { label: "Single Punch", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/10" },
  ML: { label: "Monthly Leave", dot: "bg-teal-500", text: "text-teal-700 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-900/10" },
  H: { label: "Holiday", dot: "bg-purple-500", text: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/10" },
  L: { label: "Late", dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/10" },
  EC: { label: "Early Checkout", dot: "bg-orange-500", text: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/10" },
};

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso)
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    .toLowerCase();
}

function AttendanceLedger({ employeeId }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTeamAttendanceSummary({ month, year, search: employeeId }).then((res) => {
      const row = res.rows.find((r) => r.employeeId === employeeId);
      setDays(row?.days || []);
      setLoading(false);
    });
  }, [employeeId, month, year]);

  const changeMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  };

  const leadingBlanks = new Date(year, month - 1, 1).getDay();
  const cells = [...Array(leadingBlanks).fill(null), ...days];
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-primary" />
          <p className="text-sm font-semibold text-heading dark:text-gray-100">
            Attendance Ledger — {MONTH_NAMES[month - 1]} {year}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-subtext dark:text-gray-400 text-center py-6">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>
                {WEEKDAY_LABELS.map((w) => (
                  <th key={w} className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide pb-2 text-left">
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi}>
                  {week.map((d, di) => {
                    if (!d) return <td key={di} className="border border-gray-100 dark:border-gray-700/50 p-2 align-top h-20" />;
                    const meta = d.status ? LEDGER_STATUS_META[d.status] : null;
                    return (
                      <td
                        key={di}
                        className={`border border-gray-100 dark:border-gray-700/50 p-2 align-top h-20 ${meta ? meta.bg : ""}`}
                      >
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{d.day}</p>
                        {meta && (
                          <>
                            <p className={`text-xs font-medium flex items-center gap-1 ${meta.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                            </p>
                            {(d.status === "P" || d.status === "HD" || d.status === "SP") && d.punchIn && (
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                {formatTime(d.punchIn)}
                                {d.punchOut && d.punchOut !== d.punchIn ? ` - ${formatTime(d.punchOut)}` : ""}
                              </p>
                            )}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MARITAL_STATUS_OPTIONS = ["Married", "Unmarried"];

const BANK_NAME_OPTIONS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank",
  "Bank of Baroda", "Canara Bank", "Union Bank of India", "Bank of India", "Central Bank of India",
  "Indian Bank", "Indian Overseas Bank", "UCO Bank", "Bank of Maharashtra", "Punjab & Sind Bank",
  "IDBI Bank", "Yes Bank", "Kotak Mahindra Bank", "IndusInd Bank", "Federal Bank",
  "South Indian Bank", "Karnataka Bank", "RBL Bank", "Bandhan Bank", "City Union Bank",
  "DCB Bank", "Jammu & Kashmir Bank", "Karur Vysya Bank", "Tamilnad Mercantile Bank", "CSB Bank",
  "AU Small Finance Bank", "Equitas Small Finance Bank", "Ujjivan Small Finance Bank",
  "Paytm Payments Bank", "India Post Payments Bank", "Airtel Payments Bank",
];

const EMPTY_DETAILS = {
  dateOfBirth: "",
  joiningDate: "",
  contactNumber: "",
  bloodGroup: "",
  maritalStatus: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  scheduledPunchInTime: "",
  scheduledPunchOutTime: "",
  currentPinCode: "",
  currentAddressLine: "",
  currentCity: "",
  currentState: "",
  permanentSameAsCurrent: true,
  permanentPinCode: "",
  permanentAddressLine: "",
  permanentCity: "",
  permanentState: "",
  aadharNumber: "",
  panNumber: "",
  uanNumber: "",
  esicNumber: "",
  bankHolderName: "",
  bankName: "",
  branchName: "",
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
  const [showLedger, setShowLedger] = useState(false);

  useEffect(() => {
    setLoading(true);
    getStaffProfile(employeeId).then((p) => {
      setStaff(p);
      setForm({
        dateOfBirth: p.dateOfBirth || "",
        joiningDate: p.joiningDate || "",
        contactNumber: p.contactNumber || "",
        bloodGroup: p.bloodGroup || "",
        maritalStatus: p.maritalStatus || "",
        emergencyContactName: p.emergencyContactName || "",
        emergencyContactPhone: p.emergencyContactPhone || "",
        scheduledPunchInTime: p.scheduledPunchInTime || "",
        scheduledPunchOutTime: p.scheduledPunchOutTime || "",
        currentPinCode: p.currentPinCode || "",
        currentAddressLine: p.currentAddressLine || "",
        currentCity: p.currentCity || "",
        currentState: p.currentState || "",
        permanentSameAsCurrent: p.permanentSameAsCurrent !== false,
        permanentPinCode: p.permanentPinCode || "",
        permanentAddressLine: p.permanentAddressLine || "",
        permanentCity: p.permanentCity || "",
        permanentState: p.permanentState || "",
        aadharNumber: p.aadharNumber || "",
        panNumber: p.panNumber || "",
        uanNumber: p.uanNumber || "",
        esicNumber: p.esicNumber || "",
        bankHolderName: p.bankHolderName || "",
        bankName: p.bankName || "",
        branchName: p.branchName || "",
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

  // "current" or "permanent" — auto-fills City/State once a full 6-digit
  // PIN code is typed; the user can still edit either field afterwards.
  const handlePinCodeChange = async (which, code) => {
    updateField(`${which}PinCode`, code);
    if (!/^\d{6}$/.test(code)) return;
    try {
      const { city, state } = await lookupPincode(code);
      setForm((prev) => ({ ...prev, [`${which}City`]: city, [`${which}State`]: state }));
    } catch {
      // Unknown/invalid PIN code — leave City/State as-is for manual entry.
    }
  };

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
        secondaryActions={[{ label: showLedger ? "Hide Attendance Ledger" : "Attendance Ledger", icon: <CalendarDays size={16} />, onClick: () => setShowLedger((v) => !v) }]}
        primaryAction={{ label: saving ? "Saving..." : "Save", icon: <Save size={16} />, onClick: handleSave }}
      />

      {showLedger && <AttendanceLedger employeeId={employeeId} />}

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
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
            {[
              { label: "Present %", value: `${monthStats.presentPercent}%`, color: "text-heading dark:text-gray-100" },
              { label: "Present", value: monthStats.totalPresent, color: "text-green-600 dark:text-green-400" },
              { label: "Absent", value: monthStats.totalAbsent, color: "text-red-600 dark:text-red-400" },
              { label: "Half Day", value: monthStats.totalHalfDay, color: "text-blue-600 dark:text-blue-400" },
              { label: "Single Punch", value: monthStats.totalSinglePunch, color: "text-amber-600 dark:text-amber-400" },
              { label: "Holiday", value: monthStats.totalHoliday, color: "text-purple-600 dark:text-purple-400" },
              { label: "Monthly Leave", value: monthStats.totalMonthlyLeave, color: "text-teal-600 dark:text-teal-400" },
              { label: "Late", value: monthStats.totalLate, color: "text-yellow-600 dark:text-yellow-400" },
              { label: "Early Checkout", value: monthStats.totalEarlyCheckout, color: "text-orange-600 dark:text-orange-400" },
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
          <Field label="Contact Number">
            <input value={form.contactNumber} onChange={(e) => updateField("contactNumber", e.target.value)} className="input" placeholder="+91 XXXXX XXXXX" />
          </Field>
          <Field label="Blood Group">
            <ThemedSelect
              value={form.bloodGroup}
              onChange={(v) => updateField("bloodGroup", v)}
              options={BLOOD_GROUP_OPTIONS}
              placeholder="Select blood group"
            />
          </Field>
          <Field label="Marital Status">
            <ThemedSelect
              value={form.maritalStatus}
              onChange={(v) => updateField("maritalStatus", v)}
              options={MARITAL_STATUS_OPTIONS}
              placeholder="Select marital status"
            />
          </Field>
          <Field label="Emergency Contact Name">
            <input
              value={form.emergencyContactName}
              onChange={(e) => updateField("emergencyContactName", e.target.value)}
              className="input"
              placeholder="Contact person name"
            />
          </Field>
          <Field label="Emergency Contact Phone">
            <input
              value={form.emergencyContactPhone}
              onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
              className="input"
              placeholder="+91 XXXXX XXXXX"
            />
          </Field>
        </Section>

        <Section title="Shift Timing">
          <Field label="Punch In Time">
            <Time12hInput value={form.scheduledPunchInTime} onChange={(v) => updateField("scheduledPunchInTime", v)} />
          </Field>
          <Field label="Punch Out Time">
            <Time12hInput value={form.scheduledPunchOutTime} onChange={(v) => updateField("scheduledPunchOutTime", v)} />
          </Field>
          <Field label="Duration">
            <p className="input flex items-center text-gray-500 dark:text-gray-400">
              {shiftDurationLabel(form.scheduledPunchInTime, form.scheduledPunchOutTime)}
            </p>
          </Field>
        </Section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-heading dark:text-gray-100">Current Address</h3>
            <p className="text-xs text-subtext dark:text-gray-400 mb-4">City &amp; state fill in from the PIN code — you can also edit them</p>
            <div className="space-y-4">
              <Field label="PIN Code">
                <input
                  value={form.currentPinCode}
                  onChange={(e) => handlePinCodeChange("current", e.target.value)}
                  maxLength={6}
                  className="input"
                  placeholder="6-digit PIN code"
                />
              </Field>
              <Field label="Address Line">
                <input value={form.currentAddressLine} onChange={(e) => updateField("currentAddressLine", e.target.value)} className="input" />
              </Field>
              <Field label="City">
                <input value={form.currentCity} onChange={(e) => updateField("currentCity", e.target.value)} className="input" placeholder="City" />
              </Field>
              <Field label="State">
                <input value={form.currentState} onChange={(e) => updateField("currentState", e.target.value)} className="input" placeholder="State" />
              </Field>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-heading dark:text-gray-100">Permanent Address</h3>
            <p className="text-xs text-subtext dark:text-gray-400 mb-4">Same as current, or enter separately</p>
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-primary bg-primary/5 text-primary text-sm font-medium mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.permanentSameAsCurrent}
                onChange={(e) => updateField("permanentSameAsCurrent", e.target.checked)}
                className="accent-primary"
              />
              Same as current address
            </label>
            <div className="space-y-4">
              <Field label="PIN Code">
                <input
                  value={form.permanentSameAsCurrent ? form.currentPinCode : form.permanentPinCode}
                  onChange={(e) => handlePinCodeChange("permanent", e.target.value)}
                  disabled={form.permanentSameAsCurrent}
                  maxLength={6}
                  className="input disabled:opacity-60"
                  placeholder="6-digit PIN code"
                />
              </Field>
              <Field label="Address Line">
                <input
                  value={form.permanentSameAsCurrent ? form.currentAddressLine : form.permanentAddressLine}
                  onChange={(e) => updateField("permanentAddressLine", e.target.value)}
                  disabled={form.permanentSameAsCurrent}
                  className="input disabled:opacity-60"
                />
              </Field>
              <Field label="City">
                <input
                  value={form.permanentSameAsCurrent ? form.currentCity : form.permanentCity}
                  onChange={(e) => updateField("permanentCity", e.target.value)}
                  disabled={form.permanentSameAsCurrent}
                  className="input disabled:opacity-60"
                  placeholder="City"
                />
              </Field>
              <Field label="State">
                <input
                  value={form.permanentSameAsCurrent ? form.currentState : form.permanentState}
                  onChange={(e) => updateField("permanentState", e.target.value)}
                  disabled={form.permanentSameAsCurrent}
                  className="input disabled:opacity-60"
                  placeholder="State"
                />
              </Field>
            </div>
          </div>
        </div>

        <Section title="Bank Details">
          <Field label="Bank Holder Name">
            <input value={form.bankHolderName} onChange={(e) => updateField("bankHolderName", e.target.value)} className="input" />
          </Field>
          <Field label="Bank Name">
            <ThemedSelect
              creatable
              value={form.bankName}
              onChange={(v) => updateField("bankName", v)}
              options={BANK_NAME_OPTIONS}
              placeholder="Select bank"
            />
          </Field>
          <Field label="Branch Name (Address)">
            <input value={form.branchName} onChange={(e) => updateField("branchName", e.target.value)} className="input" />
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
          <Field label="Rate">
            {/* Auto-calculated once the formula is finalized — placeholder for now. */}
            <p className="input flex items-center text-gray-500 dark:text-gray-400">—</p>
          </Field>
          <Field label="HRA">
            <p className="input flex items-center text-gray-500 dark:text-gray-400">—</p>
          </Field>
          <Field label="Salary Payable">
            <p className="input flex items-center text-gray-500 dark:text-gray-400">—</p>
          </Field>
          <Field label="Total CTC">
            <p className="input flex items-center text-gray-500 dark:text-gray-400">—</p>
          </Field>
        </Section>
      </div>
    </div>
  );
}
