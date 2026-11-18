import React, { useEffect, useState } from "react";
import { Link as LinkIcon, ExternalLink, Check } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Time12hInput from "../../components/Time12hInput";
import { listMaintenanceStaffInOut, setMaintenanceStaffInOutOutTime } from "../../api/maintenanceStaffInOut";

export default function MaintenanceStaffInOutSubmissionsPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savedId, setSavedId] = useState(null);

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

  const saveOutTime = async (id, outTime) => {
    setEntries((prev) => prev.map((e) => (e._id === id ? { ...e, outTime } : e)));
    await setMaintenanceStaffInOutOutTime(id, outTime);
    setSavedId(id);
    setTimeout(() => setSavedId((curr) => (curr === id ? null : curr)), 1500);
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
          { key: "employeeName", header: "Labour/Staff Name" },
          { key: "mobileNumber", header: "Mobile Number" },
          { key: "work", header: "Work" },
          { key: "inTime", header: "In-Time" },
          {
            key: "outTime",
            header: "Out-Time",
            render: (r) => (
              <div className="flex items-center gap-2">
                <Time12hInput value={r.outTime} onChange={(outTime) => saveOutTime(r._id, outTime)} />
                {savedId === r._id && <Check size={15} className="text-green-500" />}
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
