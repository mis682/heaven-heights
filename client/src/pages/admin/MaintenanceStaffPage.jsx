import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users, Shield, Sparkles, Leaf, Car, Zap, Droplet, IdCard, User, Camera } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import {
  getMaintenanceStaffMeta,
  getMaintenanceStaffStats,
  getNextMaintenanceStaffId,
  listMaintenanceStaff,
  createMaintenanceStaff,
  updateMaintenanceStaff,
  deleteMaintenanceStaff,
  idCardUrl,
} from "../../api/maintenanceStaff";

const DESIGNATION_ICONS = {
  "Security Guard": Shield,
  "House Keeping": Sparkles,
  Gardener: Leaf,
  Driver: Car,
  Electrician: Zap,
  "Tanki Guard": Droplet,
};

const DESIGNATION_COLORS = ["blue", "orange", "green", "amber", "gray", "red"];

export default function MaintenanceStaffPage() {
  const [staff, setStaff] = useState([]);
  const [meta, setMeta] = useState({ sites: [], designations: [], companies: [] });
  const [stats, setStats] = useState({ total: 0, byDesignation: [] });
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  const loadMeta = () => getMaintenanceStaffMeta().then(setMeta);
  const loadStats = () =>
    getMaintenanceStaffStats({
      siteName: siteFilter || undefined,
      companyName: companyFilter || undefined,
      search: search || undefined,
    }).then(setStats);

  const load = async () => {
    setLoading(true);
    const data = await listMaintenanceStaff({
      siteName: siteFilter || undefined,
      designation: designationFilter || undefined,
      companyName: companyFilter || undefined,
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
  }, [siteFilter, designationFilter, companyFilter, search]);

  // Stat cards reflect the site/company/search filters but stay independent
  // of the designation filter, so all designation counts remain visible to switch between.
  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteFilter, companyFilter, search]);

  const remove = async (id) => {
    await deleteMaintenanceStaff(id);
    load();
    loadMeta();
    loadStats();
  };

  const quickUploadPhoto = async (id, file) => {
    setUploadingId(id);
    await updateMaintenanceStaff(id, {}, file);
    setUploadingId(null);
    load();
  };

  // Updates in place instead of reloading the whole list, so HR can quickly
  // go row by row filling in Company for many staff without the table
  // jumping/re-fetching after every single selection.
  const quickSetCompany = async (id, companyName) => {
    setStaff((prev) => prev.map((s) => (s._id === id ? { ...s, companyName } : s)));
    await updateMaintenanceStaff(id, { companyName });
  };

  return (
    <div>
      <PageHeader
        title="Maintenance Staff"
        subtitle="Full staff directory across all sites — guards, housekeeping, gardeners, drivers and more."
        primaryAction={{ label: "Add Staff", icon: <Plus size={16} />, onClick: () => { setEditing(null); setShowForm(true); } }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Total Staff"
          value={stats.total}
          icon={<Users size={16} />}
          color="orange"
          active={!designationFilter}
          onClick={() => setDesignationFilter("")}
        />
        {stats.byDesignation.map((d, idx) => {
          const Icon = DESIGNATION_ICONS[d.designation] || Users;
          return (
            <StatCard
              key={d.designation}
              label={d.designation}
              value={d.count}
              icon={<Icon size={16} />}
              color={DESIGNATION_COLORS[idx % DESIGNATION_COLORS.length]}
              active={designationFilter === d.designation}
              onClick={() => setDesignationFilter(d.designation)}
            />
          );
        })}
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by name, employee ID, site or designation..."
        filters={
          <>
            <Select value={siteFilter} onChange={setSiteFilter} options={meta.sites} placeholder="All sites" />
            <Select value={designationFilter} onChange={setDesignationFilter} options={meta.designations} placeholder="All designations" />
            <Select value={companyFilter} onChange={setCompanyFilter} options={meta.companies} placeholder="All companies" />
          </>
        }
      />

      <DataTable
        columns={[
          {
            key: "photo",
            header: "Photo",
            render: (r) =>
              r.photo ? (
                <img src={r.photo} alt={r.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <User size={16} className="text-gray-400" />
                </div>
              ),
          },
          { key: "employeeId", header: "Employee ID" },
          { key: "siteName", header: "Site Name" },
          { key: "designation", header: "Designation" },
          { key: "name", header: "Name" },
          {
            key: "companyName",
            header: "Company",
            render: (r) => (
              <Select
                value={r.companyName || ""}
                onChange={(v) => quickSetCompany(r._id, v)}
                options={meta.companies}
                placeholder="Select company"
                className="input text-xs py-1.5 min-w-[220px]"
              />
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex gap-3 items-center">
                {!r.photo && (
                  <label
                    className={`cursor-pointer ${uploadingId === r._id ? "text-gray-300" : "text-gray-500 hover:text-primary"}`}
                    title="Upload photo for ID card"
                  >
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingId === r._id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) quickUploadPhoto(r._id, file);
                      }}
                    />
                  </label>
                )}
                <a href={idCardUrl(r._id)} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary" title="Download ID Card">
                  <IdCard size={16} />
                </a>
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
            loadStats();
          }}
        />
      )}
    </div>
  );
}

function StaffFormModal({ staff, meta, onClose, onSaved }) {
  const [form, setForm] = useState(staff || { employeeId: "", siteName: "", designation: "", name: "", companyName: "" });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(staff?.photo || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!staff) {
      getNextMaintenanceStaffId().then((d) => setForm((f) => ({ ...f, employeeId: d.employeeId })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (staff) {
      await updateMaintenanceStaff(staff._id, form, photo);
    } else {
      await createMaintenanceStaff(form, photo);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={staff ? "Edit Staff Member" : "Add Staff Member"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Photo">
          <div className="flex items-center gap-3">
            {preview ? (
              <img src={preview} alt="" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <User size={22} className="text-gray-400" />
              </div>
            )}
            <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
              Upload photo
              <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
            </label>
          </div>
        </Field>
        <Field label="Employee ID">
          <input required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="input" />
        </Field>
        <Field label="Site Name">
          <Select
            required
            value={form.siteName}
            onChange={(v) => setForm({ ...form, siteName: v })}
            options={meta.sites}
            placeholder="Select site"
            className="input"
          />
        </Field>
        <Field label="Designation">
          <Select
            required
            value={form.designation}
            onChange={(v) => setForm({ ...form, designation: v })}
            options={meta.designations}
            placeholder="Select designation"
            className="input"
          />
        </Field>
        <Field label="Name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </Field>
        <Field label="Company">
          <Select
            value={form.companyName || ""}
            onChange={(v) => setForm({ ...form, companyName: v })}
            options={meta.companies}
            placeholder="Select company"
            className="input"
          />
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
