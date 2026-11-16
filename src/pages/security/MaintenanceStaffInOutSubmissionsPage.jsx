import React, { useEffect, useState } from "react";
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusPill from "../../components/StatusPill";
import { listMaintenanceStaffInOut } from "../../api/maintenanceStaffInOut";

export default function MaintenanceStaffInOutSubmissionsPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  return (
    <div>
      <PageHeader
        title="Maintenance Staff In/Out"
        subtitle="Main office mein aane-jaane wale maintenance staff ka entry/exit record."
        secondaryActions={[{ label: copied ? "Link Copied!" : "Copy Form Link", icon: <LinkIcon size={16} />, onClick: copyLink }]}
        primaryAction={{ label: "Open Form", icon: <ExternalLink size={16} />, onClick: () => window.open(formUrl, "_blank") }}
      />

      <DataTable
        columns={[
          { key: "employeeName", header: "Staff Name" },
          { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
          { key: "createdAt", header: "Time", render: (r) => new Date(r.createdAt).toLocaleString() },
        ]}
        rows={loading ? [] : entries}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "Koi entry/exit record nahi mila"}
      />
    </div>
  );
}
