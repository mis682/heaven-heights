import React, { useEffect, useState } from "react";
import { Link as LinkIcon, ExternalLink, Eye } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { getMaintenanceAuditMeta, listMaintenanceAuditSubmissions } from "../../api/maintenanceAudit";
import { cloudinaryThumbnailUrl } from "../../utils/cloudinary";

export default function MaintenanceAuditSubmissionsPage() {
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewing, setViewing] = useState(null);

  const formUrl = `${window.location.origin}/maintenance-audit-form`;
  const copyLink = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    getMaintenanceAuditMeta().then((m) => setProjects(m.projects));
  }, []);

  useEffect(() => {
    setLoading(true);
    listMaintenanceAuditSubmissions({ project: projectFilter || undefined }).then((data) => {
      setSubmissions(data);
      setLoading(false);
    });
  }, [projectFilter]);

  return (
    <div>
      <PageHeader
        title="Maintenance Audit — Submissions"
        subtitle="Every submitted audit form."
        secondaryActions={[{ label: copied ? "Link Copied!" : "Copy Form Link", icon: <LinkIcon size={16} />, onClick: copyLink }]}
        primaryAction={{ label: "Open Form", icon: <ExternalLink size={16} />, onClick: () => window.open("/maintenance-audit-form", "_blank") }}
      />

      <FilterBar
        search=""
        onSearchChange={() => {}}
        placeholder="Search..."
        filters={<Select value={projectFilter} onChange={setProjectFilter} options={projects} placeholder="All projects" />}
      />

      <DataTable
        columns={[
          { key: "submittedAt", header: "Submitted At", render: (r) => new Date(r.submittedAt).toLocaleString() },
          { key: "clientName", header: "Client Name" },
          { key: "unitNo", header: "Unit No." },
          { key: "project", header: "Project" },
          { key: "remarks", header: "Remarks" },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <button onClick={() => setViewing(r)} className="text-gray-500 dark:text-gray-400 hover:text-primary">
                <Eye size={16} />
              </button>
            ),
          },
        ]}
        rows={loading ? [] : submissions}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No audit submissions match these filters"}
      />

      {viewing && (
        <Modal title={`${viewing.clientName} — Unit ${viewing.unitNo}`} onClose={() => setViewing(null)}>
          <div className="space-y-2 text-sm">
            <ViewRow label="Submitted At" value={new Date(viewing.submittedAt).toLocaleString()} />
            <ViewRow label="Client Name" value={viewing.clientName} />
            <ViewRow label="Unit No." value={viewing.unitNo} />
            <ViewRow label="Project" value={viewing.project} />
            <ViewRow label="Remarks" value={viewing.remarks} />
          </div>

          {(viewing.image1Url || viewing.image2Url) && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <PhotoThumb label="Image-1" url={viewing.image1Url} />
              <PhotoThumb label="Image-2" url={viewing.image2Url} />
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function ViewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <span className="text-subtext dark:text-gray-400">{label}</span>
      <span className="font-medium text-heading dark:text-gray-100 text-right">{value}</span>
    </div>
  );
}

function PhotoThumb({ label, url }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block">
      <img src={cloudinaryThumbnailUrl(url, 300)} alt={label} className="w-full h-28 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
      <p className="text-xs text-subtext dark:text-gray-400 text-center mt-1">{label}</p>
    </a>
  );
}
