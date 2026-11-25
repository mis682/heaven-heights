import React, { useEffect, useState } from "react";
import { Link as LinkIcon, ExternalLink, Save, Eye, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ThemedSelect from "../../components/ThemedSelect";
import Time12hInput from "../../components/Time12hInput";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import { alertMessage, confirmAction } from "../../utils/confirmDialog";
import { useAuth } from "../../context/AuthContext";
import {
  getKeyHandoverMeta,
  listKeyHandover,
  setKeyHandoverOutTime,
  updateKeyHandover,
  deleteKeyHandover,
} from "../../api/keyHandover";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ViewModal({ entry, onClose }) {
  return (
    <Modal title="Key Handover Details" onClose={onClose}>
      <div className="space-y-3">
        {[
          ["Vehicle", entry.vehicle],
          ["Date", entry.date],
          ["Driver Name", entry.driverName],
          ["In-Time", entry.inTime],
          ["Out-Time", entry.outTime || "—"],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm text-heading dark:text-gray-100">{value}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function EditModal({ entry, vehicles, drivers, onClose, onSaved }) {
  const [vehicle, setVehicle] = useState(entry.vehicle);
  const [date, setDate] = useState(entry.date);
  const [driverName, setDriverName] = useState(entry.driverName);
  const [inTime, setInTime] = useState(entry.inTime);
  const [outTime, setOutTime] = useState(entry.outTime);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateKeyHandover(entry._id, { vehicle, date, driverName, inTime, outTime });
      onSaved(updated);
      await alertMessage("Entry updated.", { title: "Saved", icon: "success" });
      onClose();
    } catch {
      await alertMessage("Update failed — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit Key Handover" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Vehicle">
          <ThemedSelect value={vehicle} onChange={setVehicle} options={vehicles} placeholder="Select vehicle" />
        </Field>
        <Field label="Date">
          <ThemedDatePicker value={date} onChange={setDate} />
        </Field>
        <Field label="Driver Name">
          <ThemedSelect value={driverName} onChange={setDriverName} options={drivers} placeholder="Select driver" />
        </Field>
        <Field label="In-Time">
          <Time12hInput value={inTime} onChange={setInTime} />
        </Field>
        <Field label="Out-Time">
          <Time12hInput value={outTime} onChange={setOutTime} />
        </Field>
        <button
          onClick={save}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </Modal>
  );
}

export default function KeyHandoverSubmissionsPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("keyHandover", "edit");
  const canDelete = hasPermission("keyHandover", "delete");
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  // Draft Out-Time per entry, kept separate from the saved `entries` state
  // so adjusting the hour/minute/AM-PM dropdowns doesn't save anything
  // until the coordinator explicitly clicks Save.
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    getKeyHandoverMeta().then((m) => {
      setVehicles(m.vehicles);
      setDrivers(m.drivers);
    });
    listKeyHandover().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const formUrl = `${window.location.origin}/key-handover-form`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const draftOutTime = (entry) => (entry._id in drafts ? drafts[entry._id] : entry.outTime);
  const isDirty = (entry) => entry._id in drafts && drafts[entry._id] !== entry.outTime;

  const saveOutTime = async (entry) => {
    const outTime = draftOutTime(entry);
    setSavingId(entry._id);
    try {
      await setKeyHandoverOutTime(entry._id, outTime);
      setEntries((prev) => prev.map((e) => (e._id === entry._id ? { ...e, outTime } : e)));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[entry._id];
        return next;
      });
      await alertMessage("Out Time saved.", { title: "Saved", icon: "success" });
    } catch {
      await alertMessage("Saving Out Time failed — please try again.");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id) => {
    const proceed = await confirmAction({ title: "Delete entry?", text: "Delete this key handover record?", confirmText: "Delete", danger: true });
    if (!proceed) return;
    await deleteKeyHandover(id);
    setEntries((prev) => prev.filter((e) => e._id !== id));
  };

  return (
    <div>
      <PageHeader
        title="Key Handover"
        subtitle="Vehicle key handover entry/exit record."
        secondaryActions={[{ label: copied ? "Link Copied!" : "Copy Form Link", icon: <LinkIcon size={16} />, onClick: copyLink }]}
        primaryAction={{ label: "Open Form", icon: <ExternalLink size={16} />, onClick: () => window.open(formUrl, "_blank") }}
      />

      <DataTable
        columns={[
          { key: "vehicle", header: "Vehicle" },
          { key: "date", header: "Date" },
          { key: "driverName", header: "Driver Name" },
          { key: "inTime", header: "In-Time" },
          {
            key: "outTime",
            header: "Out-Time",
            render: (r) => (
              <div className="flex items-center gap-2">
                <Time12hInput
                  value={draftOutTime(r)}
                  onChange={(outTime) => setDrafts((prev) => ({ ...prev, [r._id]: outTime }))}
                  disabled={!canEdit}
                />
                {canEdit && isDirty(r) && (
                  <button
                    onClick={() => saveOutTime(r)}
                    disabled={savingId === r._id}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    <Save size={13} /> {savingId === r._id ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex gap-3">
                <button onClick={() => setViewing(r)} className="text-gray-500 dark:text-gray-400 hover:text-primary" title="View">
                  <Eye size={16} />
                </button>
                {canEdit && (
                  <button onClick={() => setEditing(r)} className="text-gray-500 dark:text-gray-400 hover:text-primary" title="Edit">
                    <Pencil size={16} />
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => remove(r._id)} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" title="Delete">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        rows={loading ? [] : entries}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "Koi key handover record nahi mila"}
      />

      {viewing && <ViewModal entry={viewing} onClose={() => setViewing(null)} />}
      {editing && (
        <EditModal
          entry={editing}
          vehicles={vehicles}
          drivers={drivers}
          onClose={() => setEditing(null)}
          onSaved={(updated) => setEntries((prev) => prev.map((e) => (e._id === updated._id ? updated : e)))}
        />
      )}
    </div>
  );
}
