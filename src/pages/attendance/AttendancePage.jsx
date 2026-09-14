import React, { useEffect, useMemo, useState } from "react";
import { Plus, Users, Clock, AlertCircle, CheckCircle2, XCircle, CalendarDays, List as ListIcon } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import StatusPill from "../../components/StatusPill";
import Modal from "../../components/Modal";
import ThemedSelect from "../../components/ThemedSelect";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import { listEmployees } from "../../api/employees";
import { getAttendanceStats, listAttendance, markAttendance, updateAttendance } from "../../api/attendance";

const DEPARTMENTS = ["Housekeeping", "Guard", "Admin"];
const STATUSES = ["Present", "Absent", "Half-day", "Leave"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const [date, setDate] = useState(today());
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | calendar
  const [showMark, setShowMark] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, r, e] = await Promise.all([
      getAttendanceStats({ date }),
      listAttendance({ date, department: department || undefined, status: status || undefined }),
      listEmployees(),
    ]);
    setStats(s);
    setRecords(r);
    setEmployees(e);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, department, status]);

  const approveLeave = async (record, approvalStatus) => {
    await updateAttendance(record._id, { approvalStatus });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Track daily check-ins, leave requests and late arrivals."
        primaryAction={{ label: "Mark Attendance", icon: <Plus size={16} />, onClick: () => setShowMark(true) }}
        secondaryActions={[
          {
            label: view === "list" ? "Calendar View" : "List View",
            icon: view === "list" ? <CalendarDays size={16} /> : <ListIcon size={16} />,
            onClick: () => setView(view === "list" ? "calendar" : "list"),
          },
        ]}
      />

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          <StatCard label="Total Staff" value={stats.totalStaff} icon={<Users size={16} />} color="gray" />
          <StatCard label="Present Today" value={stats.present} icon={<CheckCircle2 size={16} />} color="green" active={status === "Present"} onClick={() => setStatus("Present")} />
          <StatCard label="Absent" value={stats.absent} icon={<XCircle size={16} />} color="red" active={status === "Absent"} onClick={() => setStatus("Absent")} />
          <StatCard label="On Leave" value={stats.onLeave} icon={<AlertCircle size={16} />} color="amber" active={status === "Leave"} onClick={() => setStatus("Leave")} />
          <StatCard label="Late Check-in" value={stats.lateCheckIn} icon={<Clock size={16} />} color="orange" />
          <StatCard label="Pending Approval" value={stats.pendingApproval} icon={<AlertCircle size={16} />} color="amber" />
        </div>
      )}

      <FilterBar
        search=""
        onSearchChange={() => {}}
        filters={
          <>
            <ThemedDatePicker value={date} onChange={setDate} className="max-w-[160px]" />
            <Select value={department} onChange={setDepartment} options={DEPARTMENTS} placeholder="All departments" />
            <Select value={status} onChange={setStatus} options={STATUSES} placeholder="All statuses" />
          </>
        }
      />

      {view === "list" ? (
        <DataTable
          columns={[
            { key: "date", header: "Date" },
            { key: "name", header: "Staff Name", render: (r) => r.staff?.name || "—" },
            { key: "employeeId", header: "Employee ID", render: (r) => r.staff?.employeeId || "—" },
            { key: "department", header: "Department", render: (r) => r.staff?.department || "—" },
            { key: "checkInTime", header: "Check-in Time", render: (r) => r.checkInTime || "—" },
            { key: "checkOutTime", header: "Check-out Time", render: (r) => r.checkOutTime || "—" },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <div className="flex items-center gap-1.5">
                  <StatusPill status={r.status} />
                  {r.isLate && <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">LATE</span>}
                </div>
              ),
            },
            { key: "markedBy", header: "Marked By", render: (r) => r.markedBy || "—" },
            {
              key: "actions",
              header: "Actions",
              render: (r) =>
                r.status === "Leave" && r.approvalStatus === "Pending" ? (
                  <div className="flex gap-2">
                    <button onClick={() => approveLeave(r, "Approved")} className="text-xs font-semibold text-green-600 dark:text-green-400 hover:underline">
                      Approve
                    </button>
                    <button onClick={() => approveLeave(r, "Rejected")} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">{r.approvalStatus !== "N/A" ? r.approvalStatus : "—"}</span>
                ),
            },
          ]}
          rows={loading ? [] : records}
          emptyMessage={loading ? "Loading..." : "No records found"}
          emptyHint={loading ? "" : "No attendance marked for this filter yet"}
        />
      ) : (
        <MonthlyCalendar employees={employees} baseDate={date} />
      )}

      {showMark && (
        <MarkAttendanceModal
          employees={employees}
          defaultDate={date}
          onClose={() => setShowMark(false)}
          onSaved={() => {
            setShowMark(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function MarkAttendanceModal({ employees, defaultDate, onClose, onSaved }) {
  const [form, setForm] = useState({
    staff: employees[0]?._id || "",
    date: defaultDate,
    checkInTime: "",
    checkOutTime: "",
    status: "Present",
    markedBy: "",
    leaveReason: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await markAttendance(form);
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title="Mark Attendance" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Staff">
          <ThemedSelect
            required
            value={form.staff}
            onChange={(v) => setForm({ ...form, staff: v })}
            options={employees.map((e) => ({ value: e._id, label: `${e.name} (${e.department})` }))}
            placeholder="Select staff"
          />
        </Field>
        <Field label="Date">
          <ThemedDatePicker required value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
        </Field>
        <Field label="Status">
          <ThemedSelect value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={STATUSES} />
        </Field>
        {form.status !== "Absent" && form.status !== "Leave" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-in Time">
              <input type="time" value={form.checkInTime} onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} className="input" />
            </Field>
            <Field label="Check-out Time">
              <input type="time" value={form.checkOutTime} onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })} className="input" />
            </Field>
          </div>
        )}
        {form.status === "Leave" && (
          <Field label="Leave Reason">
            <input value={form.leaveReason} onChange={(e) => setForm({ ...form, leaveReason: e.target.value })} className="input" />
          </Field>
        )}
        <Field label="Marked By">
          <input value={form.markedBy} onChange={(e) => setForm({ ...form, markedBy: e.target.value })} className="input" placeholder="Your name" />
        </Field>
        <button disabled={saving} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 mt-2">
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </Modal>
  );
}

function MonthlyCalendar({ employees, baseDate }) {
  const [monthRecords, setMonthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const year = Number(baseDate.slice(0, 4));
  const month = Number(baseDate.slice(5, 7));
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    setLoading(true);
    Promise.all(days.map((d) => listAttendance({ date: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}` })))
      .then((results) => setMonthRecords(results.flat()))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseDate]);

  const cellStatus = (staffId, day) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const rec = monthRecords.find((r) => r.staff?._id === staffId && r.date === dateStr);
    return rec?.status;
  };

  const dotColor = {
    Present: "bg-green-500",
    Absent: "bg-red-500",
    "Half-day": "bg-amber-500",
    Leave: "bg-gray-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
      <table className="text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
            <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 sticky left-0 bg-gray-50 dark:bg-gray-900/40">Staff</th>
            {days.map((d) => (
              <th key={d} className="px-2 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 text-center">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e._id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <td className="px-4 py-2 whitespace-nowrap font-medium text-heading dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-800">{e.name}</td>
              {days.map((d) => {
                const s = cellStatus(e._id, d);
                return (
                  <td key={d} className="px-2 py-2 text-center">
                    {s ? <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor[s] || "bg-gray-300 dark:bg-gray-600"}`} title={s} /> : <span className="text-gray-300 dark:text-gray-600">·</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && employees.length === 0 && <p className="text-sm text-subtext dark:text-gray-400 text-center py-10">No employees found</p>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
    </div>
  );
}
