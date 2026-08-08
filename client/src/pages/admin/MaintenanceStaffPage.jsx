import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import {
  getMaintenanceStaffMeta,
  getNextMaintenanceStaffId,
  listMaintenanceStaff,
  createMaintenanceStaff,
  updateMaintenanceStaff,
  deleteMaintenanceStaff,
} from "../../api/maintenanceStaff";

export default function MaintenanceStaffPage() {
  const [staff, setStaff] = useState([]);
  const [meta, setMeta] = useState({ sites: [], designations: [] });
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadMeta = () => getMaintenanceStaffMeta().then(setMeta);

  const load = async () => {
    setLoading(true);
    const data = await listMaintenanceStaff({
      siteName: siteFilter || undefined,
      designation: designationFilter || undefined,
      search: search || undefined,
    });
    setStaff(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteFilter, designationFilter, search]);

  const remove = async (id) => {
    await deleteMaintenanceStaff(id);
    load();
    loadMeta();
  };

  return (
    <div>
      <PageHeader
        title="Maintenance Staff"
        subtitle="Full staff directory across all sites — guards, housekeeping, gardeners, drivers and more."
        primaryAction={{ label: "Add Staff", icon: <Plus size={16} />, onClick: () => { setEditing(null); setShowForm(true); } }}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by name, employee ID, site or designation..."
        filters={
          <>
            <Select value={siteFilter} onChange={setSiteFilter} options={meta.sites} placeholder="All sites" />
            <Select value={designationFilter} onChange={setDesignationFilter} options={meta.designations} placeholder="All designations" />
          </>
        }
      />

      <DataTable
        columns={[
          { key: "employeeId", header: "Employee ID" },
          { key: "siteName", header: "Site Name" },
          { key: "designation", header: "Designation" },
          { key: "name", header: "Name" },
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
        rows={loading ? [] : staff}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "Add a staff member to get started"}
      />

      {showForm && (
        <StaffFormModal
          staff={editing}
          meta={meta}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
            loadMeta();
          }}
        />
      )}
    </div>
  );
}

function StaffFormModal({ staff, meta, onClose, onSaved }) {
  const [form, setForm] = useState(staff || { employeeId: "", siteName: "", designation: "", name: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!staff) {
      getNextMaintenanceStaffId().then((d) => setForm((f) => ({ ...f, employeeId: d.employeeId })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (staff) {
      await updateMaintenanceStaff(staff._id, form);
    } else {
      await createMaintenanceStaff(form);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={staff ? "Edit Staff Member" : "Add Staff Member"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Employee ID">
          <input required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="input" />
        </Field>
        <Field label="Site Name">
          <input
            required
            list="site-options"
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            className="input"
            placeholder="e.g. Garden City"
          />
          <datalist id="site-options">
            {meta.sites.map((s) => <option key={s} value={s} />)}
          </datalist>
        </Field>
        <Field label="Designation">
          <input
            required
            list="designation-options"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            className="input"
            placeholder="e.g. Security Guard"
          />
          <datalist id="designation-options">
            {meta.designations.map((d) => <option key={d} value={d} />)}
          </datalist>
        </Field>
        <Field label="Name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </Field>
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
