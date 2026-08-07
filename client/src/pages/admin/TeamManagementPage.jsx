import React, { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee } from "../../api/employees";

const DEPARTMENTS = ["Housekeeping", "Guard", "Admin"];

export default function TeamManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await listEmployees(department ? { department } : {});
    setEmployees(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  const filtered = employees.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()));

  const remove = async (id) => {
    await deleteEmployee(id);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Team Management"
        subtitle="Manage housekeeping, guard and admin staff records."
        primaryAction={{ label: "Add Team Member", icon: <Plus size={16} />, onClick: () => { setEditing(null); setShowForm(true); } }}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by name..."
        filters={<Select value={department} onChange={setDepartment} options={DEPARTMENTS} placeholder="All departments" />}
      />

      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "employeeId", header: "Employee ID", render: (r) => r.employeeId || "—" },
          { key: "department", header: "Department" },
          { key: "role", header: "Role", render: (r) => r.role || "—" },
          { key: "phone", header: "Phone", render: (r) => r.phone || "—" },
          { key: "shiftStart", header: "Shift Start" },
          {
            key: "active",
            header: "Active",
            render: (r) => (
              <span className={`text-xs font-semibold ${r.active ? "text-green-600" : "text-gray-400"}`}>
                {r.active ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex gap-3">
                <button onClick={() => { setEditing(r); setShowForm(true); }} className="text-gray-500 hover:text-primary">
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(r._id)} className="text-gray-500 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
        rows={loading ? [] : filtered}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "Add your first team member to get started"}
      />

      {showForm && (
        <EmployeeFormModal
          employee={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function EmployeeFormModal({ employee, onClose, onSaved }) {
  const [form, setForm] = useState(
    employee || { name: "", employeeId: "", department: "Housekeeping", role: "", phone: "", shiftStart: "09:00", active: true }
  );
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (employee) {
      await updateEmployee(employee._id, form);
    } else {
      await createEmployee(form);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={employee ? "Edit Team Member" : "Add Team Member"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </Field>
        <Field label="Employee ID">
          <input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="input" />
        </Field>
        <Field label="Department">
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input">
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Role">
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </Field>
          <Field label="Shift Start">
            <input type="time" value={form.shiftStart} onChange={(e) => setForm({ ...form, shiftStart: e.target.value })} className="input" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Active
        </label>
        <button disabled={saving} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 mt-2">
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
