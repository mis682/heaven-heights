import React, { useEffect, useState } from "react";
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import FilterBar, { Select } from "../../../components/FilterBar";
import DataTable from "../../../components/DataTable";
import { getNightGuardMeta, listNightGuardSubmissions } from "../../../api/nightguard";

export default function NightGuardSubmissionsPage() {
  const [sites, setSites] = useState([]);
  const [site, setSite] = useState("");
  const [date, setDate] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getNightGuardMeta().then((m) => setSites(m.sites));
  }, []);

  useEffect(() => {
    setLoading(true);
    listNightGuardSubmissions({ site: site || undefined, date: date || undefined }).then((data) => {
      setSubmissions(data);
      setLoading(false);
    });
  }, [site, date]);

  const formUrl = `${window.location.origin}/night-guard-form`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Night Guard Submissions"
        subtitle="Guard proof-of-presence photos — reference only."
        secondaryActions={[
          { label: copied ? "Link Copied!" : "Copy Guard Form Link", icon: <LinkIcon size={16} />, onClick: copyLink },
        ]}
        primaryAction={{
          label: "Open Guard Form",
          icon: <ExternalLink size={16} />,
          onClick: () => window.open("/night-guard-form", "_blank"),
        }}
      />

      <FilterBar
        search=""
        onSearchChange={() => {}}
        filters={
          <>
            <Select value={site} onChange={setSite} options={sites} placeholder="All sites" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input max-w-[160px]" />
          </>
        }
      />

      <DataTable
        columns={[
          {
            key: "guardPhotoUrl",
            header: "Photo",
            render: (r) => <img src={r.guardPhotoUrl} alt={r.guardName} className="w-14 h-14 rounded-lg object-cover border border-gray-200" />,
          },
          { key: "guardName", header: "Guard Name" },
          { key: "projectName", header: "Project" },
          { key: "capturedAt", header: "Captured At", render: (r) => new Date(r.capturedAt).toLocaleString() },
          {
            key: "geoLocation",
            header: "Location",
            render: (r) => r.geoLocation?.address || (r.geoLocation?.lat ? `${r.geoLocation.lat.toFixed(4)}, ${r.geoLocation.lng.toFixed(4)}` : "—"),
          },
        ]}
        rows={loading ? [] : submissions}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No guard proof submissions match these filters"}
      />
    </div>
  );
}
