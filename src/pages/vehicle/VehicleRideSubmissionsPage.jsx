import React, { useEffect, useState } from "react";
import { Link as LinkIcon, ExternalLink, Eye, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ThemedSelect from "../../components/ThemedSelect";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import { getVehicleMeta, listVehicleSubmissions, updateVehicleRide, deleteVehicleRide } from "../../api/vehicle";
import { confirmAction } from "../../utils/confirmDialog";
import { useAuth } from "../../context/AuthContext";

export default function VehicleRideSubmissionsPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("vehicleManagement", "edit");
  const canDelete = hasPermission("vehicleManagement", "delete");
  const [vehicles, setVehicles] = useState([]);
  const [vehicleName, setVehicleName] = useState("");
  const [date, setDate] = useState("");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

  const formUrl = `${window.location.origin}/daily-basis-ride-form`;
  const copyLink = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    getVehicleMeta().then((m) => setVehicles(m.vehicles));
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await listVehicleSubmissions({ vehicleName: vehicleName || undefined, date: date || undefined });
    setRides(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleName, date]);

  const remove = async (ride) => {
    const confirmed = await confirmAction({
      title: "Delete this ride?",
      text: `${ride.vehicleName} — ${ride.date} (${ride.distance} km) will be permanently deleted.`,
      confirmText: "Delete",
      danger: true,
    });
    if (!confirmed) return;
    await deleteVehicleRide(ride._id);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Daily Basis Ride — Submissions"
        subtitle="Every logged ride, with the distance covered each time."
        secondaryActions={[{ label: copied ? "Link Copied!" : "Copy Form Link", icon: <LinkIcon size={16} />, onClick: copyLink }]}
        primaryAction={{ label: "Open Form", icon: <ExternalLink size={16} />, onClick: () => window.open("/daily-basis-ride-form", "_blank") }}
      />

      <FilterBar
        search=""
        onSearchChange={() => {}}
        placeholder="Search..."
        filters={
          <>
            <Select value={vehicleName} onChange={setVehicleName} options={vehicles} placeholder="All vehicles" />
            <ThemedDatePicker value={date} onChange={setDate} className="max-w-[160px]" />
          </>
        }
      />

      <DataTable
        columns={[
          { key: "createdAt", header: "Timestamp", render: (r) => new Date(r.createdAt).toLocaleString() },
          { key: "vehicleName", header: "Vehicle Name" },
          { key: "date", header: "Date" },
          { key: "startReading", header: "Start Meter Reading" },
          { key: "endReading", header: "Ending Meter Reading" },
          { key: "distance", header: "Distance (km)" },
          { key: "personName", header: "Person Name" },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex gap-3">
                <button onClick={() => setViewing(r)} className="text-gray-500 dark:text-gray-400 hover:text-primary">
                  <Eye size={16} />
                </button>
                {canEdit && (
                  <button onClick={() => setEditing(r)} className="text-gray-500 dark:text-gray-400 hover:text-primary">
                    <Pencil size={16} />
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => remove(r)} className="text-gray-500 dark:text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        rows={loading ? [] : rides}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No rides match these filters"}
      />

      {viewing && (
        <Modal title={`${viewing.vehicleName} — ${viewing.date}`} onClose={() => setViewing(null)}>
          <div className="space-y-2 text-sm">
            <ViewRow label="Timestamp" value={new Date(viewing.createdAt).toLocaleString()} />
            <ViewRow label="Vehicle Name" value={viewing.vehicleName} />
            <ViewRow label="Date" value={viewing.date} />
            <ViewRow label="Start Meter Reading" value={viewing.startReading} />
            <ViewRow label="Ending Meter Reading" value={viewing.endReading} />
            <ViewRow label="Distance" value={`${viewing.distance} km`} />
            <ViewRow label="Person Name" value={viewing.personName} />
          </div>
        </Modal>
      )}

      {editing && (
        <EditRideModal
          ride={editing}
          vehicles={vehicles}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ViewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <span className="text-subtext dark:text-gray-400">{label}</span>
      <span className="font-medium text-heading dark:text-gray-100">{value}</span>
    </div>
  );
}

function EditRideModal({ ride, vehicles, onClose, onSaved }) {
  const [vehicleName, setVehicleName] = useState(ride.vehicleName);
  const [date, setDate] = useState(ride.date);
  const [startReading, setStartReading] = useState(String(ride.startReading));
  const [endReading, setEndReading] = useState(String(ride.endReading));
  const [personName, setPersonName] = useState(ride.personName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (Number(endReading) < Number(startReading)) {
      setError("Ending Meter Reading must be greater than or equal to Start Meter Reading.");
      return;
    }
    setSaving(true);
    try {
      await updateVehicleRide(ride._id, { vehicleName, date, startReading, endReading, personName });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Saving failed — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit Ride" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Vehicle Name">
          <ThemedSelect value={vehicleName} onChange={setVehicleName} options={vehicles} placeholder="Select vehicle" />
        </Field>
        <Field label="Date">
          <ThemedDatePicker value={date} onChange={setDate} />
        </Field>
        <Field label="Start Meter Reading">
          <input
            type="text"
            inputMode="numeric"
            required
            value={startReading}
            onChange={(e) => setStartReading(e.target.value.replace(/\D/g, ""))}
            className="input"
          />
        </Field>
        <Field label="Ending Meter Reading">
          <input
            type="text"
            inputMode="numeric"
            required
            value={endReading}
            onChange={(e) => setEndReading(e.target.value.replace(/\D/g, ""))}
            className="input"
          />
        </Field>
        <Field label="Person Name">
          <input required value={personName} onChange={(e) => setPersonName(e.target.value)} className="input" />
        </Field>

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
    </div>
  );
}
