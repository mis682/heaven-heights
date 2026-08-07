import React, { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, UploadCloud } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { listGuards, createGuard, updateGuard, deleteGuard, bulkImportGuards } from "../../api/guards";

const MODULES = [
  { value: "patrol_checkpoint", label: "Patrol Checkpoint" },
  { value: "night_guard", label: "Night Guard" },
  { value: "pending", label: "Pending (no active form)" },
];

export default function GuardMasterDataPage() {
  const [guards, setGuards] = useState([]);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const data = await listGuards(moduleFilter ? { module: moduleFilter } : {});
    setGuards(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleFilter]);

  const filtered = guards.filter(
    (g) => !search || `${g.name} ${g.siteName} ${g.employeeId}`.toLowerCase().includes(search.toLowerCase())
  );

  const remove = async (id) => {
    await deleteGuard(id);
    load();
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMessage("Importing...");
    try {
      const result = await bulkImportGuards(file);
      setImportMessage(`Imported: ${result.created} created, ${result.updated} updated, ${result.total} total rows.`);
      load();
    } catch {
      setImportMessage("Import failed. Check the CSV format and try again.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <PageHeader
        title="Guard Master Data"
        subtitle="Every guard belongs to exactly one fixed site. Re-import the CSV or edit guards individually."
        primaryAction={{ label: "Add Guard", icon: <Plus size={16} />, onClick: () => { setEditing(null); setShowForm(true); } }}
        secondaryActions={[
          {
            label: "Bulk Re-import CSV",
            icon: <UploadCloud size={16} />,
            onClick: () => fileRef.current?.click(),
          },
        ]}
      />

      <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
      {importMessage && <p className="text-sm text-subtext mb-3">{importMessage}</p>}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by name, site or employee ID..."
        filters={<Select value={moduleFilter} onChange={setModuleFilter} options={MODULES} placeholder="All modules" />}
      />

      <DataTable
        columns={[
          { key: "employeeId", header: "Employee ID" },
          { key: "name", header: "Name" },
          { key: "siteName", header: "Site Name" },
          {
            key: "module",
            header: "Module",
            render: (r) => MODULES.find((m) => m.value === r.module)?.label || r.module,
          },
          {
            key: "formActive",
            header: "Form Active",
            render: (r) => (
              <span className={`text-xs font-semibold ${r.formActive ? "text-green-600" : "text-gray-400"}`}>
                {r.formActive ? "Yes" : "No"}
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
        emptyHint={loading ? "" : "Import the guard_master_seed.csv or add a guard manually"}
      />

      {showForm && (
        <GuardFormModal
          guard={editing}
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

function GuardFormModal({ guard, onClose, onSaved }) {
  const [form, setForm] = useState(
    guard || { employeeId: "", name: "", siteName: "", module: "patrol_checkpoint", formActive: true }
  );
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (guard) {
      await updateGuard(guard._id, form);
    } else {
      await createGuard(form);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={guard ? "Edit Guard" : "Add Guard"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Employee ID">
          <input required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="input" />
        </Field>
        <Field label="Name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </Field>
        <Field label="Site Name">
          <input required value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} className="input" />
        </Field>
        <Field label="Module">
          <select value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} className="input">
            {MODULES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.formActive} onChange={(e) => setForm({ ...form, formActive: e.target.checked })} />
          Form Active
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
