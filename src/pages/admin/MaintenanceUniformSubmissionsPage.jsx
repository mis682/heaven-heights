import React, { useEffect, useState } from "react";
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import PhotoLightbox from "../../components/PhotoLightbox";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import { listMaintenanceUniformSubmissions } from "../../api/maintenanceUniform";
import { cloudinaryThumbnailUrl } from "../../utils/cloudinary";
import { MAINTENANCE_UNIFORM_SITES, MAINTENANCE_UNIFORM_DESIGNATIONS } from "../../constants/maintenanceUniform";

export default function MaintenanceUniformSubmissionsPage() {
  const [siteName, setSiteName] = useState("");
  const [designation, setDesignation] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    setLoading(true);
    listMaintenanceUniformSubmissions({
      siteName: siteName || undefined,
      designation: designation || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }).then((data) => {
      setSubmissions(data);
      setLoading(false);
    });
  }, [siteName, designation, dateFrom, dateTo]);

  const formUrl = `${window.location.origin}/maintenance-uniform-form`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Maintenance Uniform — Submissions"
        subtitle="Uniform photo submissions — reference only."
        secondaryActions={[
          { label: copied ? "Link Copied!" : "Copy Form Link", icon: <LinkIcon size={16} />, onClick: copyLink },
        ]}
        primaryAction={{
          label: "Open Form",
          icon: <ExternalLink size={16} />,
          onClick: () => window.open("/maintenance-uniform-form", "_blank"),
        }}
      />

      <FilterBar
        search=""
        onSearchChange={() => {}}
        filters={
          <>
            <Select value={siteName} onChange={setSiteName} options={MAINTENANCE_UNIFORM_SITES} placeholder="All sites" />
            <Select
              value={designation}
              onChange={setDesignation}
              options={MAINTENANCE_UNIFORM_DESIGNATIONS}
              placeholder="All designations"
            />
            <span className="text-sm text-subtext dark:text-gray-400">Submitted between</span>
            <ThemedDatePicker value={dateFrom} onChange={setDateFrom} className="max-w-[160px]" />
            <span className="text-sm text-subtext dark:text-gray-400">and</span>
            <ThemedDatePicker value={dateTo} onChange={setDateTo} className="max-w-[160px]" />
          </>
        }
      />

      <DataTable
        columns={[
          {
            key: "photoUrl",
            header: "Photo",
            render: (r) => (
              <img
                src={cloudinaryThumbnailUrl(r.photoUrl, 100)}
                alt={r.staffName}
                onClick={() => setLightboxIndex(submissions.indexOf(r))}
                className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
              />
            ),
          },
          { key: "staffName", header: "Staff Name" },
          { key: "designation", header: "Designation" },
          { key: "siteName", header: "Site Name" },
          { key: "shift", header: "Shift" },
          { key: "submittedAt", header: "Submitted At", render: (r) => new Date(r.submittedAt).toLocaleString() },
        ]}
        rows={loading ? [] : submissions}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No uniform submissions match these filters"}
      />

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={submissions}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          caption={(p) => `${p.staffName} — ${p.designation} — ${p.siteName} — ${new Date(p.submittedAt).toLocaleString()}`}
          downloadName={(p) => `${p.staffName}-${p.siteName}-${new Date(p.submittedAt).toISOString().slice(0, 10)}`}
        />
      )}
    </div>
  );
}
