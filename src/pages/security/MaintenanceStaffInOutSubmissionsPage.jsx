import React, { useEffect, useState } from "react";
import { Link as LinkIcon, ExternalLink, Save } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Time12hInput from "../../components/Time12hInput";
import { alertMessage } from "../../utils/confirmDialog";
import { listMaintenanceStaffInOut, setMaintenanceStaffInOutOutTime } from "../../api/maintenanceStaffInOut";

export default function MaintenanceStaffInOutSubmissionsPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  // Draft Out-Time per entry, kept separate from the saved `entries` state
  // so adjusting the hour/minute/AM-PM dropdowns doesn't save anything
  // until the coordinator explicitly clicks Save.
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    listMaintenanceStaffInOut().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const formUrl = `${window.location.origin}/maintenance-staff-in-out-form`;

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
      await setMaintenanceStaffInOutOutTime(entry._id, outTime);
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

  return (
    <div>
      <PageHeader
        title="Maintenance Staff In/Out"
        subtitle="Main office mein aane-jaane wale labour/staff ka entry/exit record."
        secondaryActions={[{ label: copied ? "Link Copied!" : "Copy Form Link", icon: <LinkIcon size={16} />, onClick: copyLink }]}
        primaryAction={{ label: "Open Form", icon: <ExternalLink size={16} />, onClick: () => window.open(formUrl, "_blank") }}
      />

      <DataTable
        columns={[
          { key: "date", header: "Date" },
          { key: "contractorName", header: "Contractor/Supervisor" },
          { key: "staffName", header: "Labour/Staff Name" },
          { key: "mobileNumber", header: "Mobile Number" },
          { key: "work", header: "Work" },
          { key: "inTime", header: "In-Time" },
          {
            key: "outTime",
            header: "Out-Time",
            render: (r) => (
              <div className="flex items-center gap-2">
                <Time12hInput
                  value={draftOutTime(r)}
                  onChange={(outTime) => setDrafts((prev) => ({ ...prev, [r._id]: outTime }))}
                />
                {isDirty(r) && (
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
        ]}
        rows={loading ? [] : entries}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "Koi entry/exit record nahi mila"}
      />
    </div>
  );
}
