import React, { useEffect, useState } from "react";
import { Image as ImageIcon, MapPin, Clock3 } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import FilterBar, { Select } from "../../../components/FilterBar";
import DataTable from "../../../components/DataTable";
import Modal from "../../../components/Modal";
import { listProjects } from "../../../api/projects";
import { listPatrolSubmissions, getPatrolSubmission } from "../../../api/patrol";

export default function PatrolSubmissionsPage() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [date, setDate] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    listProjects({ module: "patrol_checkpoint" }).then(setProjects);
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await listPatrolSubmissions({ projectId: projectId || undefined, date: date || undefined });
    setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [projectId, date]);

  return (
    <div>
      <PageHeader
        title="Patrol Checkpoint Submissions"
        subtitle="Review guard submissions and cross-check checkpoint photos."
      />

      <FilterBar
        search=""
        onSearchChange={() => {}}
        placeholder="Search..."
        filters={
          <>
            <Select
              value={projectId}
              onChange={setProjectId}
              options={projects.map((p) => ({ value: p._id, label: p.name }))}
              placeholder="All projects"
            />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input max-w-[160px]" />
          </>
        }
      />

      <DataTable
        columns={[
          { key: "guardName", header: "Guard Name" },
          { key: "projectName", header: "Project" },
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
        rows={loading ? [] : submissions}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No patrol submissions match these filters"}
      />

      {viewing && (
        <Modal title={`${viewing.guardName} — ${viewing.projectName}`} onClose={() => setViewing(null)} wide>
          {viewing.photos.length === 0 ? (
            <p className="text-sm text-subtext text-center py-6">No checkpoint photos were submitted.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {viewing.photos.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 overflow-hidden">
                  <img src={p.photoUrl} alt={`Checkpoint ${p.checkpointId}`} className="w-full h-32 object-cover" />
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
    </div>
  );
}
