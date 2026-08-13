import React, { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, Video, FileText, Image as ImageIcon, X, Copy, Loader2 } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import FilterBar, { Select } from "../../../components/FilterBar";
import Modal from "../../../components/Modal";
import PhotoLightbox from "../../../components/PhotoLightbox";
import {
  getFireMockDrillMeta,
  listFireMockDrills,
  createFireMockDrill,
  updateFireMockDrill,
  deleteFireMockDrill,
} from "../../../api/fireMockDrill";
import { uploadVideoDirect } from "../../../api/cloudinaryDirectUpload";

const PUBLIC_FORM_PATH = "/fire-mock-drill-form";

export default function FireMockDrillSubmissionsPage() {
  const [drills, setDrills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  useEffect(() => {
    getFireMockDrillMeta().then((m) => setProjects(m.projects));
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await listFireMockDrills({ projectName: projectFilter || undefined, search: search || undefined });
    setDrills(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFilter, search]);

  const remove = async (id) => {
    if (!window.confirm("Delete this fire mock drill record?")) return;
    await deleteFireMockDrill(id);
    load();
  };

  const copyFormLink = () => {
    const url = `${window.location.origin}${PUBLIC_FORM_PATH}`;
    navigator.clipboard.writeText(url);
    alert("Public form link copied");
  };

  return (
    <div>
      <PageHeader
        title="Fire Mock Drill"
        subtitle="Fire mock drill submissions — panel photo, videos and drill report."
        primaryAction={{ label: "Copy Public Form Link", icon: <Copy size={16} />, onClick: copyFormLink }}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by project or date..."
        filters={<Select value={projectFilter} onChange={setProjectFilter} options={projects} placeholder="All projects" />}
      />

      <DataTable
        columns={[
          { key: "projectName", header: "Project" },
          { key: "date", header: "Date" },
          {
            key: "panelPhoto",
            header: "Panel Photo",
            render: (r) =>
              r.panelPhoto ? (
                <img
                  src={r.panelPhoto}
                  alt=""
                  className="w-9 h-9 rounded-lg object-cover border border-gray-200 cursor-pointer"
                  onClick={() => setLightboxPhoto(r.panelPhoto)}
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <ImageIcon size={14} className="text-gray-400" />
                </div>
              ),
          },
          ...Array.from({ length: 8 }, (_, i) => ({
            key: `video${i + 1}`,
            header: `Video ${i + 1}`,
            render: (r) =>
              r.videos?.[i] ? (
                <a href={r.videos[i]} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary">
                  <Video size={16} />
                </a>
              ) : (
                <span className="text-xs text-gray-300">—</span>
              ),
          })),
          {
            key: "reportAttachment",
            header: "Report Attachment",
            render: (r) =>
              r.reportAttachment ? (
                <a href={r.reportAttachment} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary">
                  <FileText size={16} />
                </a>
              ) : (
                <span className="text-xs text-gray-300">—</span>
              ),
          },
          ...Array.from({ length: 5 }, (_, i) => ({
            key: `checklistPage${i + 1}`,
            header: `Checklist Page ${i + 1}`,
            render: (r) =>
              r.checklistAttachments?.[i] ? (
                <a href={r.checklistAttachments[i]} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary">
                  <FileText size={16} />
                </a>
              ) : (
                <span className="text-xs text-gray-300">—</span>
              ),
          })),
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex gap-3">
                <button onClick={() => setViewing(r)} className="text-gray-500 hover:text-primary" title="View">
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditing(r);
                    setShowForm(true);
                  }}
                  className="text-gray-500 hover:text-primary"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(r._id)} className="text-gray-500 hover:text-red-600" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
        rows={loading ? [] : drills}
        emptyMessage={loading ? "Loading..." : "No submissions yet"}
        emptyHint={loading ? "" : "Share the public form link to start collecting drill records"}
      />

      {viewing && <ViewModal drill={viewing} onClose={() => setViewing(null)} />}

      {showForm && (
        <DrillFormModal
          drill={editing}
          projects={projects}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {lightboxPhoto && (
        <PhotoLightbox
          photos={[{ photoUrl: lightboxPhoto }]}
          index={0}
          onClose={() => setLightboxPhoto(null)}
          onNavigate={() => {}}
        />
      )}
    </div>
  );
}

function ViewModal({ drill, onClose }) {
  return (
    <Modal title={`${drill.projectName} — ${drill.date}`} onClose={onClose} wide>
      <div className="space-y-4">
        {drill.panelPhoto && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Panel Photo</p>
            <img src={drill.panelPhoto} alt="" className="rounded-xl border border-gray-200 max-h-72 object-contain" />
          </div>
        )}

        {drill.videos?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Videos ({drill.videos.length})</p>
            <div className="grid grid-cols-2 gap-3">
              {drill.videos.map((v, idx) => (
                <video key={idx} src={v} controls className="w-full rounded-xl border border-gray-200" />
              ))}
            </div>
          </div>
        )}

        {drill.reportAttachment && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Report Attachment</p>
            <a
              href={drill.reportAttachment}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <FileText size={16} /> Open report
            </a>
          </div>
        )}

        {drill.checklistAttachments?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Checklist Attachments ({drill.checklistAttachments.length})</p>
            <div className="flex flex-wrap gap-3">
              {drill.checklistAttachments.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <FileText size={16} /> Page {idx + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DrillFormModal({ drill, projects, onClose, onSaved }) {
  const [projectName, setProjectName] = useState(drill?.projectName || "");
  const [date, setDate] = useState(drill?.date || "");
  const [panelPhoto, setPanelPhoto] = useState(null);
  const [panelPreview, setPanelPreview] = useState(drill?.panelPhoto || null);
  const [existingVideos, setExistingVideos] = useState(drill?.videos || []);
  const [newVideos, setNewVideos] = useState([]);
  const [reportAttachment, setReportAttachment] = useState(null);
  const [existingReport, setExistingReport] = useState(drill?.reportAttachment || "");
  const [existingChecklist, setExistingChecklist] = useState(drill?.checklistAttachments || []);
  const [newChecklistPages, setNewChecklistPages] = useState(Array(5).fill(null));
  const [saving, setSaving] = useState(false);

  const totalVideoSlots = existingVideos.length + newVideos.length;
  const remainingSlots = Math.max(0, 8 - totalVideoSlots);

  const onPanelChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPanelPhoto(file);
    setPanelPreview(URL.createObjectURL(file));
  };

  const addNewVideo = (file) => {
    if (!file) return;
    const slot = { preview: URL.createObjectURL(file), progress: 0, uploading: true, url: null, failed: false };
    setNewVideos((prev) => [...prev, slot]);
    const idx = newVideos.length;

    uploadVideoDirect(file, (progress) => {
      setNewVideos((prev) => {
        const next = [...prev];
        if (next[idx]) next[idx] = { ...next[idx], progress };
        return next;
      });
    })
      .then((url) => {
        setNewVideos((prev) => {
          const next = [...prev];
          if (next[idx]) next[idx] = { ...next[idx], url, uploading: false, progress: 1 };
          return next;
        });
      })
      .catch(() => {
        setNewVideos((prev) => {
          const next = [...prev];
          if (next[idx]) next[idx] = { ...next[idx], uploading: false, failed: true };
          return next;
        });
      });
  };

  const removeExistingVideo = (idx) => {
    setExistingVideos((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewVideo = (idx) => {
    setNewVideos((prev) => prev.filter((_, i) => i !== idx));
  };

  const videosStillUploading = newVideos.some((v) => v.uploading);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { projectName, date };
    const videoUrls = [...existingVideos, ...newVideos.filter((v) => v.url).map((v) => v.url)];
    const newChecklist = newChecklistPages.filter(Boolean);
    const files = { panelPhoto, reportAttachment, checklistAttachments: newChecklist.length ? newChecklist : undefined, videoUrls };
    if (drill) {
      await updateFireMockDrill(drill._id, data, files);
    } else {
      await createFireMockDrill(data, files);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={drill ? "Edit Fire Mock Drill" : "Add Fire Mock Drill"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Project">
            <select required value={projectName} onChange={(e) => setProjectName(e.target.value)} className="input">
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </Field>
        </div>

        <Field label="Panel Photo">
          <div className="flex items-center gap-3">
            {panelPreview ? (
              <img src={panelPreview} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                <ImageIcon size={20} className="text-gray-400" />
              </div>
            )}
            <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
              {panelPreview ? "Replace photo" : "Upload photo"}
              <input type="file" accept="image/*" onChange={onPanelChange} className="hidden" />
            </label>
          </div>
        </Field>

        <Field label={`Videos (${totalVideoSlots}/8)`}>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {existingVideos.map((v, idx) => (
              <div key={`existing-${idx}`} className="relative">
                <video src={v} className="w-full h-20 rounded-lg border border-gray-200 object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingVideo(idx)}
                  className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 shadow hover:bg-white"
                >
                  <X size={12} className="text-red-600" />
                </button>
              </div>
            ))}
            {newVideos.map((v, idx) => (
              <div key={`new-${idx}`} className="relative">
                <video src={v.preview} className="w-full h-20 rounded-lg border border-gray-200 object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewVideo(idx)}
                  className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 shadow hover:bg-white"
                >
                  <X size={12} className="text-red-600" />
                </button>
                {v.uploading && (
                  <div className="absolute inset-x-1 bottom-1">
                    <div className="h-1 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${Math.round(v.progress * 100)}%` }} />
                    </div>
                  </div>
                )}
                {v.failed && (
                  <span className="absolute inset-0 flex items-center justify-center bg-red-50/90 text-red-600 text-[10px] font-medium rounded-lg">
                    Upload failed
                  </span>
                )}
              </div>
            ))}
          </div>
          {remainingSlots > 0 && (
            <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
              + Add video
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  addNewVideo(e.target.files?.[0]);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
          )}
        </Field>

        <Field label="Report Attachment">
          <div className="flex items-center gap-3">
            {existingReport && !reportAttachment && (
              <a href={existingReport} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <FileText size={14} /> Current file
              </a>
            )}
            {reportAttachment && <span className="text-sm text-gray-600">{reportAttachment.name}</span>}
            <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
              {existingReport || reportAttachment ? "Replace file" : "Upload file"}
              <input type="file" onChange={(e) => setReportAttachment(e.target.files?.[0] || null)} className="hidden" />
            </label>
          </div>
        </Field>

        <Field label="Checklist Attachment (5 pages)">
          {newChecklistPages.every((f) => !f) && existingChecklist.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {existingChecklist.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  <FileText size={14} /> Page {idx + 1}
                </a>
              ))}
              <span className="text-xs text-gray-400">(pick new files below to replace)</span>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {newChecklistPages.map((file, idx) => (
              <label key={idx} className="cursor-pointer text-xs font-medium text-primary hover:underline border border-gray-300 rounded-lg px-2 py-1.5 text-center">
                {file ? file.name : `+ Page ${idx + 1}`}
                <input
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  onChange={(e) =>
                    setNewChecklistPages((prev) => {
                      const next = [...prev];
                      next[idx] = e.target.files?.[0] || null;
                      return next;
                    })
                  }
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </Field>

        <button
          disabled={saving || videosStillUploading}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
        >
          {videosStillUploading && <Loader2 size={15} className="animate-spin" />}
          {saving ? "Saving..." : videosStillUploading ? "Videos uploading..." : "Save"}
        </button>
      </form>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
