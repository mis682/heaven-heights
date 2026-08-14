import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock3, MapPin, Link as LinkIcon, ExternalLink, ListChecks, ShieldCheck, Maximize2 } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import DataTable from "../../../components/DataTable";
import Modal from "../../../components/Modal";
import PhotoLightbox from "../../../components/PhotoLightbox";
import { getProjectBySlug } from "../../../api/projects";
import { listPatrolSubmissions, getPatrolSubmission } from "../../../api/patrol";

export default function PatrolSitePage() {
  const { project: slug } = useParams();
  const [data, setData] = useState(null);
  const [date, setDate] = useState("");
  const [guardFilter, setGuardFilter] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getProjectBySlug(slug).then(setData);
  }, [slug]);

  useEffect(() => {
    if (!data) return;
    setLoading(true);
    listPatrolSubmissions({ projectId: data.project._id, date: date || undefined }).then((rows) => {
      setSubmissions(rows);
      setLoading(false);
    });
  }, [data, date]);

  const formUrl = `${window.location.origin}/patrol-form/${slug}`;

  const guardOptions = useMemo(
    () => [...new Set(submissions.map((s) => s.guardName))].sort(),
    [submissions]
  );

  const filteredSubmissions = useMemo(
    () => (guardFilter ? submissions.filter((s) => s.guardName === guardFilter) : submissions),
    [submissions, guardFilter]
  );

  const avgCoveragePct = useMemo(() => {
    if (!filteredSubmissions.length) return 0;
    const total = filteredSubmissions.reduce((sum, s) => sum + (s.checkpointCount ? s.checkpointsCovered / s.checkpointCount : 0), 0);
    return Math.round((total / filteredSubmissions.length) * 100);
  }, [filteredSubmissions]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) {
    return <p className="text-sm text-subtext">Loading...</p>;
  }

  const { project } = data;

  return (
    <div>
      <PageHeader
        title={project.name}
        subtitle={`Guard checkpoint submissions for ${project.name} — ${project.checkpointCount} checkpoints.`}
        secondaryActions={[
          { label: copied ? "Link Copied!" : "Copy Guard Form Link", icon: <LinkIcon size={16} />, onClick: copyLink },
        ]}
        primaryAction={{
          label: "Open Guard Form",
          icon: <ExternalLink size={16} />,
          onClick: () => window.open(`/patrol-form/${slug}`, "_blank"),
        }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="Total Submissions" value={filteredSubmissions.length} icon={<ListChecks size={16} />} color="blue" />
        <StatCard label="Checkpoints" value={project.checkpointCount} icon={<ShieldCheck size={16} />} color="orange" />
        <StatCard label="Avg. Coverage" value={`${avgCoveragePct}%`} icon={<ShieldCheck size={16} />} color="green" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input max-w-[160px]" />
        <select value={guardFilter} onChange={(e) => setGuardFilter(e.target.value)} className="input max-w-[220px]">
          <option value="">All guards</option>
          {guardOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={[
          { key: "guardName", header: "Guard Name" },
          { key: "submittedAt", header: "Submitted At", render: (r) => new Date(r.submittedAt).toLocaleString() },
          {
            key: "checkpointsCovered",
            header: "Checkpoints Covered",
            render: (r) => `${r.checkpointsCovered}/${r.checkpointCount}`,
          },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <button
                onClick={async () => setViewing(await getPatrolSubmission(r._id))}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View Photos
              </button>
            ),
          },
        ]}
        rows={loading ? [] : filteredSubmissions}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No patrol submissions yet for this site"}
      />

      {viewing && (
        <Modal title={`${viewing.guardName} — ${project.name}`} onClose={() => setViewing(null)} wide>
          {viewing.photos.length === 0 ? (
            <p className="text-sm text-subtext text-center py-6">No checkpoint photos were submitted.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {viewing.photos.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="relative w-full h-32 block group"
                    title="Click to maximize"
                  >
                    <img src={p.photoUrl} alt={`Checkpoint ${p.checkpointId}`} className="w-full h-32 object-cover" />
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                      <Maximize2 size={20} className="text-white opacity-0 group-hover:opacity-100" />
                    </span>
                  </button>
                  <div className="p-2 text-xs text-gray-600 space-y-0.5">
                    <p className="font-semibold text-heading">Checkpoint {p.checkpointId}</p>
                    <p className="flex items-center gap-1">
                      <Clock3 size={12} /> {new Date(p.capturedAt).toLocaleString()}
                    </p>
                    {p.geoLocation?.lat && (
                      <p className="flex items-center gap-1 truncate">
                        <MapPin size={12} /> {p.geoLocation.address || `${p.geoLocation.lat.toFixed(4)}, ${p.geoLocation.lng.toFixed(4)}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {viewing && lightboxIndex !== null && (
        <PhotoLightbox
          photos={viewing.photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          caption={(p) => `Checkpoint ${p.checkpointId} — ${viewing.guardName} — ${new Date(p.capturedAt).toLocaleString()}`}
          downloadName={(p) => `${project.name}-checkpoint-${p.checkpointId}`}
        />
      )}
    </div>
  );
}
