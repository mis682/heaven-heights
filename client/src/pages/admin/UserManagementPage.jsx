import React, { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, ShieldCheck } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import PermissionGrid from "../../components/PermissionGrid";
import { listUsers, createUser, updateUser, deleteUser } from "../../api/users";
import { listRoles, createRole, updateRole, deleteRole } from "../../api/roles";
import { emptyPermissions } from "../../constants/permissionModules";
import { useAuth } from "../../context/AuthContext";

const DEPARTMENTS = ["Management", "Housekeeping", "Security", "Maintenance", "Accounts"];

const TABS = [
  { key: "users", label: "Users" },
  { key: "roles", label: "Roles" },
];

export default function UserManagementPage() {
  const [tab, setTab] = useState("users");

  return (
    <div>
      <PageHeader title="User Management" subtitle="Create accounts, define roles, and manage granular permissions." />

      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" ? <UsersTab /> : <RolesTab />}
    </div>
  );
}

function AddButton({ label, onClick }) {
  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-orange-600"
      >
        <Plus size={16} /> {label}
      </button>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const { user: currentUser } = useAuth();

  const load = async () => {
    setLoading(true);
    const [usersData, rolesData] = await Promise.all([listUsers(role ? { role } : {}), listRoles()]);
    setUsers(usersData);
    setRoles(rolesData);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const remove = async (id) => {
    setError("");
    try {
      await deleteUser(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete user");
    }
  };

  return (
    <div>
      <AddButton
        label="Register User"
        onClick={() => {
          setEditing(null);
          setShowForm(true);
        }}
      />

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by name or email..."
        filters={<Select value={role} onChange={setRole} options={roles.map((r) => r.name)} placeholder="All roles" />}
      />

      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "email", header: "Email" },
          { key: "role", header: "Role" },
          { key: "department", header: "Department", render: (r) => r.department || "—" },
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
                <button
                  onClick={() => {
                    setEditing(r);
                    setShowForm(true);
                  }}
                  className="text-gray-500 hover:text-primary"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remove(r._id)}
                  disabled={r._id === currentUser?.id}
                  className="text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title={r._id === currentUser?.id ? "You cannot delete your own account" : "Delete"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
        rows={loading ? [] : filtered}
        emptyMessage={loading ? "Loading..." : "No users found"}
        emptyHint={loading ? "" : "Register your first user to get started"}
      />

      {showForm && (
        <UserFormModal
          user={editing}
          roles={roles}
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

function UserFormModal({ user, roles, onClose, onSaved }) {
  const [form, setForm] = useState(
    user
      ? { ...user, password: "" }
      : {
          name: "",
          email: "",
          password: "",
          phone: "",
          employeeId: "",
          designation: "",
          department: "",
          role: roles[0]?.name || "",
          active: true,
        }
  );
  const [permissions, setPermissions] = useState(user?.permissions || emptyPermissions());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const togglePermission = (moduleKey, action) => {
    setPermissions((p) => ({
      ...p,
      [moduleKey]: { ...p[moduleKey], [action]: !p[moduleKey]?.[action] },
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (user) payload.permissions = permissions;

      if (user) {
        await updateUser(user._id, payload);
      } else {
        await createUser(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save user");
    } finally {
      setSaving(false);
    }
  };

  const selectedRole = roles.find((r) => r.name === form.role);

  return (
    <Modal title={user ? "Edit User" : "Register New User"} onClose={onClose} wide={!!user}>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name">
            <input required value={form.name} onChange={(e) => setField("name", e.target.value)} className="input" />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={user ? "Password (leave blank to keep unchanged)" : "Password"}>
            <input
              required={!user}
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Phone Number">
            <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Employee ID">
            <input value={form.employeeId} onChange={(e) => setField("employeeId", e.target.value)} className="input" />
          </Field>
          <Field label="Designation">
            <input value={form.designation} onChange={(e) => setField("designation", e.target.value)} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Department">
            <select value={form.department} onChange={(e) => setField("department", e.target.value)} className="input">
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={(e) => setField("role", e.target.value)} className="input">
              {roles.map((r) => (
                <option key={r._id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {user && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.active} onChange={(e) => setField("active", e.target.checked)} />
            Active
          </label>
        )}

        {user && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Permissions
            </p>
            {selectedRole?.isSystem ? (
              <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                The Admin role automatically has full access to every module.
              </p>
            ) : (
              <PermissionGrid permissions={permissions} onToggle={togglePermission} />
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 mt-2"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </Modal>
  );
}

function RolesTab() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setRoles(await listRoles());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    setError("");
    try {
      await deleteRole(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete role");
    }
  };

  return (
    <div>
      <AddButton
        label="Create Role"
        onClick={() => {
          setEditing(null);
          setShowForm(true);
        }}
      />

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <DataTable
        columns={[
          { key: "name", header: "Name" },
          {
            key: "isSystem",
            header: "Type",
            render: (r) => (
              <span className={`text-xs font-semibold ${r.isSystem ? "text-gray-500" : "text-green-600"}`}>
                {r.isSystem ? "System" : "Custom"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditing(r);
                    setShowForm(true);
                  }}
                  disabled={r.isSystem}
                  className="text-gray-500 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  title={r.isSystem ? "The Admin role cannot be edited" : "Edit"}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remove(r._id)}
                  disabled={r.isSystem}
                  className="text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title={r.isSystem ? "The Admin role cannot be deleted" : "Delete"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
        rows={loading ? [] : roles}
        emptyMessage={loading ? "Loading..." : "No roles found"}
      />

      {showForm && (
        <RoleFormModal
          role={editing}
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

function RoleFormModal({ role, onClose, onSaved }) {
  const [name, setName] = useState(role?.name || "");
  const [permissions, setPermissions] = useState(role?.permissions || emptyPermissions());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const togglePermission = (moduleKey, action) => {
    setPermissions((p) => ({
      ...p,
      [moduleKey]: { ...p[moduleKey], [action]: !p[moduleKey]?.[action] },
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (role) {
        await updateRole(role._id, { name, permissions });
      } else {
        await createRole({ name, permissions });
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={role ? "Edit Role" : "Create Role"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Role Name">
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </Field>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
            <ShieldCheck size={14} /> Default Permissions
          </p>
          <p className="text-xs text-gray-400 mb-2">
            Applied to new users when they're assigned this role — each user can still be fine-tuned afterward.
          </p>
          <PermissionGrid permissions={permissions} onToggle={togglePermission} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 mt-2"
        >
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
