import React, { useEffect, useState } from "react";
import { CheckCircle2, Building2, Loader2, AlertCircle } from "lucide-react";
import { getFireMockDrillMeta, createFireMockDrill } from "../../../api/fireMockDrill";
import { uploadFireMockDrillFile, getVideoDuration, MAX_VIDEO_SECONDS } from "../../../api/fireMockDrillUpload";
import ThemedSelect from "../../../components/ThemedSelect";
import ThemedDatePicker from "../../../components/ThemedDatePicker";

const MAINTENANCE_SUPERVISORS = ["Mukesh", "Shailendra", "Vinod", "Pramod", "Ranijay", "Avinash"];

export default function FireMockDrillPublicForm() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [maintenanceSupervisor, setMaintenanceSupervisor] = useState("");
  const [date, setDate] = useState("");
  const [panelPhoto, setPanelPhoto] = useState(null);
  const [videos, setVideos] = useState(Array(8).fill(null));
  const [checklistPages, setChecklistPages] = useState(Array(3).fill(null));
  const [issueIdentified, setIssueIdentified] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [issueEvidence, setIssueEvidence] = useState({ uploading: false, url: null, failed: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getFireMockDrillMeta().then((m) => setProjects(m.projects));
  }, []);

  // Videos start uploading the moment they're picked (not on final submit)
  // so the transfer + server-side compression overlaps with the rest of the
  // form being filled in, instead of adding to submit-time wait. A video
  // longer than MAX_VIDEO_SECONDS is rejected immediately, before any
  // upload starts, as the server-side compressor also hard-trims to this
  // length as a backstop — so a too-long video would otherwise silently get
  // cut short instead of being rejected.
  const setVideoAt = async (idx, file) => {
    if (!file) {
      setVideos((prev) => {
        const next = [...prev];
        next[idx] = null;
        return next;
      });
      return;
    }

    let duration;
    try {
      duration = await getVideoDuration(file);
    } catch {
      setVideos((prev) => {
        const next = [...prev];
        next[idx] = { name: file.name, uploading: false, failed: true, errorMessage: "Could not read this video — try another file." };
        return next;
      });
      return;
    }

    if (duration > MAX_VIDEO_SECONDS) {
      setVideos((prev) => {
        const next = [...prev];
        next[idx] = { name: file.name, uploading: false, failed: true, errorMessage: `Video is ${Math.round(duration)}s — max ${MAX_VIDEO_SECONDS}s allowed.` };
        return next;
      });
      return;
    }

    setVideos((prev) => {
      const next = [...prev];
      next[idx] = { name: file.name, progress: 0, uploading: true, url: null, failed: false };
      return next;
    });

    uploadFireMockDrillFile(file, (progress) => {
      setVideos((prev) => {
        const next = [...prev];
        if (next[idx]) next[idx] = { ...next[idx], progress };
        return next;
      });
    })
      .then((url) => {
        setVideos((prev) => {
          const next = [...prev];
          if (next[idx]) next[idx] = { ...next[idx], url, uploading: false, progress: 1 };
          return next;
        });
      })
      .catch(() => {
        setVideos((prev) => {
          const next = [...prev];
          if (next[idx]) next[idx] = { ...next[idx], uploading: false, failed: true, errorMessage: "Upload failed — try again." };
          return next;
        });
      });
  };

  const videosStillUploading = videos.some((v) => v?.uploading);

  const setChecklistPageAt = (idx, file) =>
    setChecklistPages((prev) => {
      const next = [...prev];
      next[idx] = file;
      return next;
    });

  // Evidence can be either a photo or a short video — a video picked here
  // goes through the same duration check + upload as the Videos field above.
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
        setIssueEvidence({ uploading: false, url: null, failed: true, errorMessage: "Could not read this video — try another file." });
        return;
      }
      if (duration > MAX_VIDEO_SECONDS) {
        setIssueEvidence({ uploading: false, url: null, failed: true, errorMessage: `Video is ${Math.round(duration)}s — max ${MAX_VIDEO_SECONDS}s allowed.` });
        return;
      }
    }

    setIssueEvidence({ uploading: true, progress: 0, url: null, failed: false, mediaType });
    uploadFireMockDrillFile(file, (progress) => setIssueEvidence((prev) => ({ ...prev, progress })))
      .then((url) => setIssueEvidence({ uploading: false, url, failed: false, mediaType }))
      .catch(() => setIssueEvidence({ uploading: false, url: null, failed: true, errorMessage: "Upload failed — try again." }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const videoUrls = videos.filter((v) => v?.url).map((v) => v.url);
      const [panelPhotoUrl, checklistAttachmentUrls] = await Promise.all([
        uploadFireMockDrillFile(panelPhoto),
        Promise.all(checklistPages.filter(Boolean).map((f) => uploadFireMockDrillFile(f))),
      ]);
      await createFireMockDrill(
        { projectName, date, maintenanceSupervisor },
        {
          panelPhoto: panelPhotoUrl,
          checklistAttachments: checklistAttachmentUrls,
          videoUrls,
          issueIdentified,
          issueDescription,
          actionTaken,
          issueEvidence: issueEvidence.url || "",
          issueEvidenceType: issueEvidence.url ? issueEvidence.mediaType : "",
        }
      );
      setDone(true);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-gray-900 px-4">
        <div className="text-center">
          <CheckCircle2 size={56} className="text-green-600 dark:text-green-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-heading dark:text-gray-100">Submitted</h1>
          <p className="text-subtext dark:text-gray-400 text-sm mt-1">Fire mock drill record saved successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 px-4 py-8">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
            <Building2 size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-heading dark:text-gray-100">Fire Mock Drill</h1>
          <p className="text-sm text-subtext dark:text-gray-400 text-center">Submit drill details, panel photo, videos and report.</p>
        </div>

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
          </div>

          <Field label="Date">
            <ThemedDatePicker required value={date} onChange={setDate} />
          </Field>

          <Field label="Panel Photo">
            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) => setPanelPhoto(e.target.files?.[0] || null)}
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            {videos.map((v, idx) => (
              <Field key={idx} label={`Video ${idx + 1}`}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    setVideoAt(idx, e.target.files?.[0] || null);
                    e.target.value = "";
                  }}
                  className="input text-xs"
                />
                {v?.uploading && (
                  <div className="mt-1">
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${Math.round(v.progress * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-subtext dark:text-gray-400 mt-0.5">Uploading {Math.round(v.progress * 100)}%</p>
                  </div>
                )}
                {v?.url && !v.uploading && (
                  <p className="text-[10px] text-green-600 dark:text-green-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Uploaded
                  </p>
                )}
                {v?.failed && (
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {v.errorMessage || "Upload failed — try again"}
                  </p>
                )}
              </Field>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Checklist Attachment (3 pages)</label>
            <div className="grid grid-cols-2 gap-3">
              {checklistPages.map((file, idx) => (
                <Field key={idx} label={`Page ${idx + 1}`}>
                  <input
                    required
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    onChange={(e) => setChecklistPageAt(idx, e.target.files?.[0] || null)}
                    className="input text-xs"
                  />
                  {file && (
                    <p className="text-[10px] text-green-600 dark:text-green-400 mt-0.5 flex items-center gap-1 truncate">
                      <CheckCircle2 size={10} /> {file.name}
                    </p>
                  )}
                </Field>
              ))}
            </div>
          </div>

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
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    handleIssueEvidence(e.target.files?.[0] || null);
                    e.target.value = "";
                  }}
                  className="input text-xs"
                />
                {issueEvidence.uploading && (
                  <div className="mt-1">
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${Math.round((issueEvidence.progress || 0) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-subtext dark:text-gray-400 mt-0.5">Uploading {Math.round((issueEvidence.progress || 0) * 100)}%</p>
                  </div>
                )}
                {issueEvidence.url && !issueEvidence.uploading && (
                  <p className="text-[10px] text-green-600 dark:text-green-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Uploaded
                  </p>
                )}
                {issueEvidence.failed && (
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {issueEvidence.errorMessage || "Upload failed — try again"}
                  </p>
                )}
              </Field>
            </>
          )}

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            disabled={
              submitting ||
              videosStillUploading ||
              issueEvidence.uploading ||
              !projectName ||
              !maintenanceSupervisor ||
              !date ||
              !panelPhoto ||
              !issueIdentified ||
              checklistPages.some((f) => !f)
            }
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {(videosStillUploading || issueEvidence.uploading) && <Loader2 size={15} className="animate-spin" />}
            {submitting ? "Submitting..." : videosStillUploading || issueEvidence.uploading ? "Uploading..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
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
