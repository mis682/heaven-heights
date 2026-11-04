import React, { useEffect, useRef, useState } from "react";
import { Eye, Pencil, Trash2, Video, FileText, Image as ImageIcon, X, Copy, Loader2 } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import FilterBar, { Select } from "../../../components/FilterBar";
import Modal from "../../../components/Modal";
import PhotoLightbox from "../../../components/PhotoLightbox";
import ThemedSelect from "../../../components/ThemedSelect";
import ThemedDatePicker from "../../../components/ThemedDatePicker";
import { confirmAction, alertMessage } from "../../../utils/confirmDialog";
import { cloudinaryThumbnailUrl } from "../../../utils/cloudinary";
import {
  getFireMockDrillMeta,
  listFireMockDrills,
  createFireMockDrill,
  updateFireMockDrill,
  deleteFireMockDrill,
} from "../../../api/fireMockDrill";
import { uploadFireMockDrillFile, getVideoDuration, MAX_VIDEO_SECONDS } from "../../../api/fireMockDrillUpload";
import { useAuth } from "../../../context/AuthContext";

const PUBLIC_FORM_PATH = "/fire-mock-drill-form";
const MAINTENANCE_SUPERVISORS = ["Mukesh", "Shailendra", "Vinod", "Pramod", "Ranijay", "Avinash"];
const ISSUE_STATUS_OPTIONS = ["Open", "Closed", "WIP", "Pending", "Complete"];

export default function FireMockDrillSubmissionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [drills, setDrills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState("");
  const [supervisorFilter, setSupervisorFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  useEffect(() => {
    getFireMockDrillMeta().then((m) => setProjects(m.projects));
  }, []);

  // Fast typing in the search box fires a request per keystroke; nothing
  // guarantees they resolve in the order they were sent, so an earlier
  // (shorter, broader) search's response can land after a later one and
  // overwrite it with stale results. A request counter lets only the
  // most-recently-started request's response ever get applied.
  const requestIdRef = useRef(0);

  const load = async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    const data = await listFireMockDrills({
      projectName: projectFilter || undefined,
      maintenanceSupervisor: supervisorFilter || undefined,
      date: dateFilter || undefined,
      search: search || undefined,
    });
    if (requestId !== requestIdRef.current) return;
    setDrills(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFilter, supervisorFilter, dateFilter, search]);

  const setIssueStatus = async (id, issueStatus) => {
    setDrills((prev) => prev.map((d) => (d._id === id ? { ...d, issueStatus } : d)));
    await updateFireMockDrill(id, { issueStatus }, {});
  };

  const remove = async (id) => {
    const proceed = await confirmAction({ title: "Delete record?", text: "Delete this fire mock drill record?", confirmText: "Delete", danger: true });
    if (!proceed) return;
    await deleteFireMockDrill(id);
    load();
  };

  const copyFormLink = async () => {
    const url = `${window.location.origin}${PUBLIC_FORM_PATH}`;
    navigator.clipboard.writeText(url);
    await alertMessage("Public form link copied", { title: "Copied", icon: "success" });
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
        filters={
          <>
            <Select value={projectFilter} onChange={setProjectFilter} options={projects} placeholder="All projects" />
            <Select value={supervisorFilter} onChange={setSupervisorFilter} options={MAINTENANCE_SUPERVISORS} placeholder="All supervisors" />
            <ThemedDatePicker value={dateFilter} onChange={setDateFilter} className="max-w-[160px]" />
          </>
        }
      />

      <DataTable
        columns={[
          { key: "projectName", header: "Project" },
          { key: "maintenanceSupervisor", header: "Maintenance Supervisor" },
          { key: "date", header: "Date" },
          {
            key: "panelPhoto",
            header: "Panel Photo",
            render: (r) =>
              r.panelPhoto ? (
                <img
                  src={cloudinaryThumbnailUrl(r.panelPhoto, 100)}
                  alt=""
                  className="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-gray-700 cursor-pointer"
                  onClick={() => setLightboxPhoto(r.panelPhoto)}
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <ImageIcon size={14} className="text-gray-400 dark:text-gray-500" />
                </div>
              ),
          },
          ...Array.from({ length: 8 }, (_, i) => ({
            key: `video${i + 1}`,
            header: `Video ${i + 1}`,
            render: (r) =>
              r.videos?.[i] ? (
                <a href={r.videos[i]} target="_blank" rel="noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-primary">
                  <Video size={16} />
                </a>
              ) : (
                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
              ),
          })),
          ...Array.from({ length: 3 }, (_, i) => ({
            key: `checklistPage${i + 1}`,
            header: `Checklist Page ${i + 1}`,
            render: (r) =>
              r.checklistAttachments?.[i] ? (
                <a href={r.checklistAttachments[i]} target="_blank" rel="noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-primary">
                  <FileText size={16} />
                </a>
              ) : (
                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
              ),
          })),
          {
            key: "issueIdentified",
            header: "Issue?",
            render: (r) =>
              r.issueIdentified ? (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    r.issueIdentified === "Yes"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                  }`}
                >
                  {r.issueIdentified}
                </span>
              ) : (
                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
              ),
          },
          {
            key: "issueReportPdf",
            header: "Issue Report",
            render: (r) =>
              r.issueReportPdf ? (
                <a href={r.issueReportPdf} target="_blank" rel="noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-primary">
                  <FileText size={16} />
                </a>
              ) : (
                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
              ),
          },
          {
            key: "issueStatus",
            header: "Issue Status",
            render: (r) =>
              r.issueIdentified === "Yes" ? (
                <ThemedSelect
                  value={r.issueStatus || ""}
                  onChange={(v) => setIssueStatus(r._id, v)}
                  options={ISSUE_STATUS_OPTIONS}
                  placeholder="—"
                  className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-1 min-w-[120px]"
                />
              ) : (
                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
              ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex gap-3">
                <button onClick={() => setViewing(r)} className="text-gray-500 dark:text-gray-400 hover:text-primary" title="View">
                  <Eye size={16} />
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        setEditing(r);
                        setShowForm(true);
                      }}
                      className="text-gray-500 dark:text-gray-400 hover:text-primary"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => remove(r._id)} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
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
        {drill.maintenanceSupervisor && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Maintenance Supervisor:</span> {drill.maintenanceSupervisor}
          </p>
        )}

        {drill.panelPhoto && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Panel Photo</p>
            <img src={drill.panelPhoto} alt="" className="rounded-xl border border-gray-200 dark:border-gray-700 max-h-72 object-contain" />
          </div>
        )}

        {drill.videos?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Videos ({drill.videos.length})</p>
            <div className="grid grid-cols-2 gap-3">
              {drill.videos.map((v, idx) => (
                <video key={idx} src={v} controls className="w-full rounded-xl border border-gray-200 dark:border-gray-700" />
              ))}
            </div>
          </div>
        )}

        {drill.checklistAttachments?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Checklist Attachments ({drill.checklistAttachments.length})</p>
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

        {drill.issueIdentified && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Issue identified: <span className={drill.issueIdentified === "Yes" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>{drill.issueIdentified}</span>
            </p>
            {drill.issueDescription && <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{drill.issueDescription}</p>}
          </div>
        )}

        {drill.actionTaken && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Action taken / plan</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{drill.actionTaken}</p>
          </div>
        )}

        {drill.issueEvidence && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Issue Evidence</p>
            {drill.issueEvidenceType === "video" ? (
              <video src={drill.issueEvidence} controls className="rounded-xl border border-gray-200 dark:border-gray-700 max-h-72" />
            ) : (
              <img src={drill.issueEvidence} alt="" className="rounded-xl border border-gray-200 dark:border-gray-700 max-h-72 object-contain" />
            )}
          </div>
        )}

        {drill.issueReportPdf && (
          <div>
            <a
              href={drill.issueReportPdf}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <FileText size={16} /> Download Issue Report (PDF)
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DrillFormModal({ drill, projects, onClose, onSaved }) {
  const [projectName, setProjectName] = useState(drill?.projectName || "");
  const [maintenanceSupervisor, setMaintenanceSupervisor] = useState(drill?.maintenanceSupervisor || "");
  const [date, setDate] = useState(drill?.date || "");
  const [panelPhoto, setPanelPhoto] = useState(null);
  const [panelPreview, setPanelPreview] = useState(drill?.panelPhoto || null);
  const [existingVideos, setExistingVideos] = useState(drill?.videos || []);
  const [newVideos, setNewVideos] = useState([]);
  const [existingChecklist, setExistingChecklist] = useState(drill?.checklistAttachments || []);
  const [newChecklistPages, setNewChecklistPages] = useState(Array(3).fill(null));
  const [issueIdentified, setIssueIdentified] = useState(drill?.issueIdentified || "");
  const [issueDescription, setIssueDescription] = useState(drill?.issueDescription || "");
  const [actionTaken, setActionTaken] = useState(drill?.actionTaken || "");
  const [issueEvidence, setIssueEvidence] = useState({
    uploading: false,
    url: drill?.issueEvidence || null,
    failed: false,
    mediaType: drill?.issueEvidenceType || "",
  });
  const [saving, setSaving] = useState(false);

  const totalVideoSlots = existingVideos.length + newVideos.length;
  const remainingSlots = Math.max(0, 8 - totalVideoSlots);

  const onPanelChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPanelPhoto(file);
    setPanelPreview(URL.createObjectURL(file));
  };

  const addNewVideo = async (file) => {
    if (!file) return;
    const idx = newVideos.length;

    let duration;
    try {
      duration = await getVideoDuration(file);
    } catch {
      setNewVideos((prev) => [...prev, { preview: URL.createObjectURL(file), uploading: false, failed: true, errorMessage: "Could not read this video." }]);
      return;
    }
    if (duration > MAX_VIDEO_SECONDS) {
      setNewVideos((prev) => [
        ...prev,
        { preview: URL.createObjectURL(file), uploading: false, failed: true, errorMessage: `${Math.round(duration)}s — max ${MAX_VIDEO_SECONDS}s` },
      ]);
      return;
    }

    const slot = { preview: URL.createObjectURL(file), progress: 0, uploading: true, url: null, failed: false };
    setNewVideos((prev) => [...prev, slot]);

    uploadFireMockDrillFile(file, (progress) => {
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
          if (next[idx]) next[idx] = { ...next[idx], uploading: false, failed: true, errorMessage: "Upload failed" };
          return next;
        });
      });
  };

  const handleIssueEvidence = async (file) => {
    if (!file) {
      setIssueEvidence({ uploading: false, url: null, failed: false });
      return;
    }

    const isVideo = file.type.startsWith("video/");
    const mediaType = isVideo ? "video" : "photo";

    if (isVideo) {
      let duration;
      try {
        duration = await getVideoDuration(file);
      } catch {
        setIssueEvidence({ uploading: false, url: null, failed: true, errorMessage: "Could not read this video." });
        return;
      }
      if (duration > MAX_VIDEO_SECONDS) {
        setIssueEvidence({ uploading: false, url: null, failed: true, errorMessage: `${Math.round(duration)}s — max ${MAX_VIDEO_SECONDS}s` });
        return;
      }
    }

    setIssueEvidence({ uploading: true, progress: 0, url: null, failed: false, mediaType });
    uploadFireMockDrillFile(file, (progress) => setIssueEvidence((prev) => ({ ...prev, progress })))
      .then((url) => setIssueEvidence({ uploading: false, url, failed: false, mediaType }))
      .catch(() => setIssueEvidence({ uploading: false, url: null, failed: true, errorMessage: "Upload failed" }));
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
    const data = { projectName, maintenanceSupervisor, date };
    const videoUrls = [...existingVideos, ...newVideos.filter((v) => v.url).map((v) => v.url)];
    const newChecklist = newChecklistPages.filter(Boolean);

    const [panelPhotoUrl, checklistUrls] = await Promise.all([
      panelPhoto ? uploadFireMockDrillFile(panelPhoto) : Promise.resolve(drill?.panelPhoto || ""),
      newChecklist.length ? Promise.all(newChecklist.map((f) => uploadFireMockDrillFile(f))) : Promise.resolve(null),
    ]);

    const urls = {
      panelPhoto: panelPhotoUrl,
      videoUrls,
      issueIdentified,
      issueDescription,
      actionTaken,
      issueEvidence: issueEvidence.url || "",
      issueEvidenceType: issueEvidence.url ? issueEvidence.mediaType : "",
    };
    if (checklistUrls) urls.checklistAttachments = checklistUrls;

    if (drill) {
      await updateFireMockDrill(drill._id, data, urls);
    } else {
      await createFireMockDrill(data, urls);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={drill ? "Edit Fire Mock Drill" : "Add Fire Mock Drill"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Project">
            <ThemedSelect required value={projectName} onChange={setProjectName} options={projects} placeholder="Select project" />
          </Field>
          <Field label="Maintenance Supervisor Name">
            <ThemedSelect
              required
              value={maintenanceSupervisor}
              onChange={setMaintenanceSupervisor}
              options={MAINTENANCE_SUPERVISORS}
              placeholder="Select supervisor"
            />
          </Field>
          <Field label="Date">
            <ThemedDatePicker required value={date} onChange={setDate} />
          </Field>
        </div>

        <Field label="Panel Photo">
          <div className="flex items-center gap-3">
            {panelPreview ? (
              <img src={panelPreview} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <ImageIcon size={20} className="text-gray-400 dark:text-gray-500" />
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
                <video src={v} className="w-full h-20 rounded-lg border border-gray-200 dark:border-gray-700 object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingVideo(idx)}
                  className="absolute top-1 right-1 bg-white/90 dark:bg-gray-800/90 rounded-full p-0.5 shadow hover:bg-white dark:hover:bg-gray-800"
                >
                  <X size={12} className="text-red-600 dark:text-red-400" />
                </button>
              </div>
            ))}
            {newVideos.map((v, idx) => (
              <div key={`new-${idx}`} className="relative">
                <video src={v.preview} className="w-full h-20 rounded-lg border border-gray-200 dark:border-gray-700 object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewVideo(idx)}
                  className="absolute top-1 right-1 bg-white/90 dark:bg-gray-800/90 rounded-full p-0.5 shadow hover:bg-white dark:hover:bg-gray-800"
                >
                  <X size={12} className="text-red-600 dark:text-red-400" />
                </button>
                {v.uploading && (
                  <div className="absolute inset-x-1 bottom-1">
                    <div className="h-1 bg-white/60 dark:bg-gray-900/60 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${Math.round(v.progress * 100)}%` }} />
                    </div>
                  </div>
                )}
                {v.failed && (
                  <span className="absolute inset-0 flex items-center justify-center text-center px-1 bg-red-50/90 dark:bg-red-900/70 text-red-600 dark:text-red-400 text-[10px] font-medium rounded-lg">
                    {v.errorMessage || "Upload failed"}
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

        <Field label="Checklist Attachment (3 pages)">
          {newChecklistPages.every((f) => !f) && existingChecklist.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {existingChecklist.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  <FileText size={14} /> Page {idx + 1}
                </a>
              ))}
              <span className="text-xs text-gray-400 dark:text-gray-500">(pick new files below to replace)</span>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {newChecklistPages.map((file, idx) => (
              <label key={idx} className="cursor-pointer text-xs font-medium text-primary hover:underline border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-center">
                {file ? file.name : `+ Page ${idx + 1}`}
                <input
                  required={!drill}
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

        <Field label="During the drill, was any issue or unsafe condition identified?">
          <ThemedSelect
            required
            value={issueIdentified}
            onChange={(v) => {
              setIssueIdentified(v);
              if (v === "No") {
                setIssueDescription("");
                setActionTaken("");
                setIssueEvidence({ uploading: false, url: null, failed: false });
              }
            }}
            options={["Yes", "No"]}
            placeholder="Select Yes or No"
          />
        </Field>

        {issueIdentified === "Yes" && (
          <>
            <Field label="Please describe the issue or unsafe condition and where it was found.">
              <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} rows={3} className="input" />
            </Field>

            <Field label="What action did the team take, or what action plan was agreed upon?">
              <textarea
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="Include the action, the person responsible, and the expected completion date."
                rows={3}
                className="input"
              />
            </Field>

            <Field label="Evidence of the issue or unsafe condition (photo/video)">
              <div className="flex items-center gap-3">
                {issueEvidence.url && !issueEvidence.uploading && (
                  <a href={issueEvidence.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                    <FileText size={14} /> Current file
                  </a>
                )}
                <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
                  {issueEvidence.url ? "Replace file" : "Upload file"}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      handleIssueEvidence(e.target.files?.[0] || null);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {issueEvidence.uploading && (
                <div className="mt-1">
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${Math.round((issueEvidence.progress || 0) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-subtext dark:text-gray-400 mt-0.5">Uploading {Math.round((issueEvidence.progress || 0) * 100)}%</p>
                </div>
              )}
              {issueEvidence.failed && <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">{issueEvidence.errorMessage || "Upload failed"}</p>}
            </Field>
          </>
        )}

        <button
          disabled={saving || videosStillUploading || issueEvidence.uploading}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
        >
          {(videosStillUploading || issueEvidence.uploading) && <Loader2 size={15} className="animate-spin" />}
          {saving ? "Saving..." : videosStillUploading || issueEvidence.uploading ? "Uploading..." : "Save"}
        </button>
      </form>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
    </div>
  );
}
