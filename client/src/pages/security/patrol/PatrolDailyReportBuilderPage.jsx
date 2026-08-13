import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2, Save, Send, Image as ImageIcon, Lock, Maximize2, FileText, Download } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import StatusPill from "../../../components/StatusPill";
import Modal from "../../../components/Modal";
import PhotoLightbox from "../../../components/PhotoLightbox";
import { useAuth } from "../../../context/AuthContext";
import { getProjectBySlug } from "../../../api/projects";
import { listGuards } from "../../../api/guards";
import { apiOrigin as API_BASE } from "../../../api/client";
import {
  getPatrolReportMeta,
  getPatrolCheckpointProof,
  getPatrolReportByDate,
  savePatrolReportDraft,
  submitPatrolReport,
  exportPatrolReportUrl,
  exportPatrolReportPdfUrl,
} from "../../../api/patrolReports";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyRow(checkpointCount) {
  return { guardName: "", timeSlot: "", checkpointStatuses: Array(checkpointCount).fill("") };
}

export default function PatrolDailyReportBuilderPage() {
  const { project: slug } = useParams();
  const { user } = useAuth();
  const [meta, setMeta] = useState({ statusOptions: [], timeSlots: [] });
  const [project, setProject] = useState(null);
  const [date, setDate] = useState(today());
  const [report, setReport] = useState(null);
  const [rows, setRows] = useState([]);
  const [guards, setGuards] = useState([]);
  const [saving, setSaving] = useState(false);
  const [proofRow, setProofRow] = useState(null);
  const [proofPhotos, setProofPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    getPatrolReportMeta(slug).then(setMeta);
  }, [slug]);

  useEffect(() => {
    getProjectBySlug(slug).then((d) => setProject(d.project));
  }, [slug]);

  const projectId = project?._id;

  useEffect(() => {
    if (!project) return;
    listGuards({ siteName: project.name, module: "patrol_checkpoint" }).then(setGuards);
  }, [project]);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const r = await getPatrolReportByDate(projectId, date);
      setReport(r);
      if (r) {
        setRows(r.entries.map((e) => ({ ...e, checkpointStatuses: [...e.checkpointStatuses] })));
      } else if (project) {
        setRows([emptyRow(project.checkpointCount)]);
      }
    })();
  }, [projectId, date, project]);

  const isLocked = report?.status === "submitted";
  const checkpointCount = report?.checkpointCount || project?.checkpointCount || 0;

  const updateRow = (idx, patch) => setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const updateCheckpoint = (rowIdx, cpIdx, status) =>
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r;
        const checkpointStatuses = [...r.checkpointStatuses];
        checkpointStatuses[cpIdx] = status;
        return { ...r, checkpointStatuses };
      })
    );

  const addRow = () => setRows((prev) => [...prev, emptyRow(checkpointCount)]);
  const removeRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const openProof = async (row) => {
    if (!row.guardName || !row.timeSlot) return;
    setProofRow(row);
    setLightboxIndex(null);
    const slotIndex = meta.timeSlots.indexOf(row.timeSlot);
    const photos = await getPatrolCheckpointProof({ projectId, guardName: row.guardName, date, slotIndex });
    setProofPhotos(photos);
  };

  const persist = async (targetStatus) => {
    const cleanRows = rows.filter((r) => r.guardName && r.timeSlot);
    const droppedCount = rows.length - cleanRows.length;

    if (rows.length > 0 && cleanRows.length === 0) {
      alert("Every row is missing a Guard Name or Time — nothing was saved. Select both before saving.");
      return;
    }
    if (droppedCount > 0) {
      const proceed = window.confirm(
        `${droppedCount} row(s) are missing a Guard Name or Time and will NOT be saved. Continue anyway?`
      );
      if (!proceed) return;
    }

    setSaving(true);
    const saved = await savePatrolReportDraft({
      projectId,
      projectName: project.name,
      reportDate: date,
      entries: cleanRows,
      preparedBy: user?.name || "",
    });
    if (targetStatus === "submitted") {
      const submitted = await submitPatrolReport(saved._id);
      setReport(submitted);
      setRows(submitted.entries.map((e) => ({ ...e, checkpointStatuses: [...e.checkpointStatuses] })));
    } else {
      setReport(saved);
    }
    setSaving(false);
  };

  if (!project) {
    return <p className="text-sm text-subtext">Loading...</p>;
  }

  return (
    <div>
      <PageHeader
        title={`${project.name} — Daily Report Builder`}
        subtitle="Cross-check checkpoint photos before recording status per checkpoint, per hour."
        secondaryActions={isLocked ? [] : [{ label: "Add Row", icon: <Plus size={16} />, onClick: addRow }]}
        primaryAction={
          isLocked ? undefined : { label: saving ? "Saving..." : "Submit Report", icon: <Send size={16} />, onClick: () => persist("submitted") }
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className="input max-w-[180px]" />
        {isLocked && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
            <Lock size={12} /> Submitted — read only (ask Admin to unlock)
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 sticky left-0 bg-gray-50 whitespace-nowrap">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">Guard Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">Time</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">Checkpoint</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">Proof</th>
                {Array.from({ length: checkpointCount }, (_, i) => (
                  <th key={i} className="text-left px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">
                    Checkpoint-{i + 1}
                  </th>
                ))}
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-4 py-2 sticky left-0 bg-white whitespace-nowrap text-gray-600">{date}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <select
                      disabled={isLocked}
                      value={row.guardName}
                      onChange={(e) => updateRow(rowIdx, { guardName: e.target.value })}
                      className="input min-w-[160px]"
                    >
                      <option value="">Select guard</option>
                      {guards.map((g) => (
                        <option key={g._id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <select
                      disabled={isLocked}
                      value={row.timeSlot}
                      onChange={(e) => updateRow(rowIdx, { timeSlot: e.target.value })}
                      className="input min-w-[160px]"
                    >
                      <option value="">Time</option>
                      {meta.timeSlots.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                    C1 TO C{checkpointCount}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button
                      onClick={() => openProof(row)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <ImageIcon size={14} /> View
                    </button>
                  </td>
                  {Array.from({ length: checkpointCount }, (_, cpIdx) => (
                    <td key={cpIdx} className="px-3 py-2 whitespace-nowrap">
                      <select
                        disabled={isLocked}
                        value={row.checkpointStatuses[cpIdx] || ""}
                        onChange={(e) => updateCheckpoint(rowIdx, cpIdx, e.target.value)}
                        className="input min-w-[130px]"
                      >
                        <option value="">—</option>
                        {meta.statusOptions.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                      {row.checkpointStatuses[cpIdx] && (
                        <div className="mt-1">
                          <StatusPill status={row.checkpointStatuses[cpIdx]} />
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {!isLocked && (
                      <button onClick={() => removeRow(rowIdx)} className="text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        {!isLocked && (
          <button
            onClick={() => persist("draft")}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save as Draft"}
          </button>
        )}
        {report && (
          <>
            <a
              href={exportPatrolReportPdfUrl(report._id, API_BASE)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileText size={16} /> Download PDF
            </a>
            <a
              href={exportPatrolReportUrl(report._id, API_BASE)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={16} /> Download Excel
            </a>
          </>
        )}
      </div>

      {proofRow && (
        <Modal title={`Proof — ${proofRow.guardName} — ${proofRow.timeSlot}`} onClose={() => setProofRow(null)} wide>
          {proofPhotos.length === 0 ? (
            <p className="text-sm text-subtext text-center py-6">No checkpoint photos found for this guard / hour.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {proofPhotos.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 overflow-hidden">
                  <button type="button" onClick={() => setLightboxIndex(idx)} className="relative w-full h-28 block group" title="Click to maximize">
                    <img src={p.photoUrl} alt={`Checkpoint ${p.checkpointId}`} className="w-full h-28 object-cover" />
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                      <Maximize2 size={18} className="text-white opacity-0 group-hover:opacity-100" />
                    </span>
                  </button>
                  <div className="p-2 text-xs text-gray-600">
                    <p className="font-semibold text-heading">Checkpoint {p.checkpointId}</p>
                    <p>{new Date(p.capturedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {proofRow && lightboxIndex !== null && (
        <PhotoLightbox
          photos={proofPhotos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          caption={(p) => `Checkpoint ${p.checkpointId} — ${proofRow.guardName} — ${new Date(p.capturedAt).toLocaleString()}`}
          downloadName={(p) => `${project?.name || "site"}-checkpoint-${p.checkpointId}`}
        />
      )}
    </div>
  );
}
