import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, Send, Image as ImageIcon, Lock, Maximize2 } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import StatusPill from "../../../components/StatusPill";
import Modal from "../../../components/Modal";
import PhotoLightbox from "../../../components/PhotoLightbox";
import ThemedSelect from "../../../components/ThemedSelect";
import ThemedDatePicker from "../../../components/ThemedDatePicker";
import { confirmAction, alertMessage } from "../../../utils/confirmDialog";
import { useAuth } from "../../../context/AuthContext";
import {
  getNightGuardMeta,
  getOpenDraft,
  saveDraftReport,
  submitReport,
  listNightGuardSubmissions,
} from "../../../api/nightguard";
import { listMaintenanceStaff } from "../../../api/maintenanceStaff";
import { saveDraft as saveLocalDraft, loadDraft as loadLocalDraft, clearDraft as clearLocalDraft } from "../../../utils/dailyReportDraft";
import { cloudinaryThumbnailUrl } from "../../../utils/cloudinary";

// Every edit is mirrored here as it happens, not just the last successful
// save — so a coordinator who fills in some fields and navigates to another
// page before clicking Save doesn't lose that work when they come back.
const DRAFT_KEY = "nightguard-report-rows-draft";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyRow(site, timeSlot) {
  return { date: today(), site: site || "", timeSlot: timeSlot || "", guardName: "", status: "", linkedSubmissionId: null };
}

// A full night's shift is 10 hourly rows (9 PM through 6 AM). Time is
// auto-assigned per row in sequence — the coordinator only fills in
// Date, Site, Status and Guard Name.
function makeShiftSet(timeSlots) {
  return timeSlots.map((t) => emptyRow("", t));
}

export default function NightGuardDailyReportPage() {
  const { user } = useAuth();
  const [meta, setMeta] = useState({ sites: [], statusOptions: [], timeSlots: [] });
  const [report, setReport] = useState(null);
  const [rows, setRows] = useState([]);
  const [guards, setGuards] = useState([]);
  const [proofRow, setProofRow] = useState(null);
  const [proofSubmissions, setProofSubmissions] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState(false);
  // Guards the autosave effect below from firing with the placeholder empty
  // `rows` state before the initial load (server draft vs. local draft) has
  // actually decided what rows should start out as — otherwise it would
  // overwrite a real local draft with [] the instant this page mounts.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Sourced from Maintenance Staff (Security Guard designation), not
    // filtered by site — guards rotate between sites daily.
    listMaintenanceStaff({ designation: "Security Guard" }).then(setGuards);
  }, []);

  useEffect(() => {
    (async () => {
      const [m, r] = await Promise.all([getNightGuardMeta(), getOpenDraft()]);
      setMeta(m);
      setReport(r);
      const locked = r?.status === "submitted";
      const localDraft = !locked ? loadLocalDraft(DRAFT_KEY) : null;
      if (locked) clearLocalDraft(DRAFT_KEY);
      if (localDraft) {
        setRows(localDraft);
        setRestoredNotice(true);
      } else {
        setRows(r && r.entries.length > 0 ? r.entries.map((e) => ({ ...e })) : makeShiftSet(m.timeSlots));
      }
      setLoaded(true);
    })();
  }, []);

  const isLocked = report?.status === "submitted";

  // Mirrors every edit to localStorage as a safety net — see DRAFT_KEY above.
  useEffect(() => {
    if (loaded && !isLocked) saveLocalDraft(DRAFT_KEY, rows);
  }, [rows, isLocked, loaded]);

  const updateRow = (idx, patch) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, ...makeShiftSet(meta.timeSlots)]);
  const removeRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const openProof = async (row) => {
    if (!row.site || !row.date) return;
    setProofRow(row);
    setLightboxIndex(null);
    const subs = await listNightGuardSubmissions({ site: row.site, date: row.date, hour: row.timeSlot || undefined });
    setProofSubmissions(subs);
  };

  const persist = async (targetStatus) => {
    const cleanRows = rows.filter((r) => r.date && r.site && r.timeSlot && r.guardName && r.status);
    const droppedCount = rows.length - cleanRows.length;

    // Submitting locks the report, so it's worth pausing to confirm before
    // dropping incomplete rows or submitting nothing at all — those are
    // covered here. Saving a draft never blocks on anything below: it just
    // silently saves whatever rows are already complete (or does nothing if
    // none are), with no alert/confirm to interrupt the coordinator or risk
    // losing already-finished work to a dismissed prompt.
    if (targetStatus === "submitted") {
      if (rows.length > 0 && cleanRows.length === 0) {
        await alertMessage("Every row is missing a Date, Site, Time, Guard Name or Status — nothing was saved. Fill in all fields before saving.");
        return;
      }
      if (droppedCount > 0) {
        const proceed = await confirmAction({
          title: "Incomplete rows will be skipped",
          text: `${droppedCount} row(s) are incomplete (missing Date/Site/Time/Guard Name/Status) and will NOT be included. Continue anyway?`,
          confirmText: "Continue",
          danger: true,
        });
        if (!proceed) return;
      }
    } else if (cleanRows.length === 0) {
      return; // nothing fillable yet — nothing to save
    }

    setSaving(true);
    const saved = await saveDraftReport({ entries: cleanRows, preparedBy: user?.name || "" });
    clearLocalDraft(DRAFT_KEY); // now safely on the server — the local safety-net copy is no longer needed
    if (targetStatus === "submitted") {
      const submitted = await submitReport(saved._id);
      setReport(submitted);
      setRows(submitted.entries.map((e) => ({ ...e })));
    } else {
      setReport(saved);
    }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader
        title="Night Guard — Daily Report Builder"
        subtitle="Cross-check guard proof photos before recording status per time slot."
        secondaryActions={
          isLocked
            ? []
            : [{ label: "Add Shift Set", icon: <Plus size={16} />, onClick: addRow }]
        }
        primaryAction={
          isLocked
            ? undefined
            : { label: saving ? "Saving..." : "Submit Report", icon: <Send size={16} />, onClick: () => persist("submitted") }
        }
      />

      {restoredNotice && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-medium">
          Aapke pichle unsaved changes restore ho gaye hain — bhoolna mat, "Save as Draft" dabana.
        </div>
      )}

      {isLocked && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
            <Lock size={12} /> Submitted — read only (ask Admin to unlock)
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                {["Date", "Site", "Time", "Status", "Guard Name", "Proof", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <td className="px-4 py-2">
                    <ThemedDatePicker
                      disabled={isLocked}
                      value={row.date || ""}
                      max={today()}
                      onChange={(v) => updateRow(idx, { date: v })}
                      className="min-w-[150px]"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <ThemedSelect
                      disabled={isLocked}
                      value={row.site}
                      onChange={(v) => updateRow(idx, { site: v, guardName: "" })}
                      options={meta.sites}
                      placeholder="Select site"
                    />
                  </td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.timeSlot}</td>
                  <td className="px-4 py-2">
                    <ThemedSelect
                      disabled={isLocked}
                      value={row.status}
                      onChange={(v) => updateRow(idx, { status: v })}
                      options={meta.statusOptions}
                      placeholder="Status"
                    />
                    {row.status && <div className="mt-1"><StatusPill status={row.status} /></div>}
                  </td>
                  <td className="px-4 py-2">
                    <ThemedSelect
                      disabled={isLocked}
                      value={row.guardName}
                      onChange={(v) => updateRow(idx, { guardName: v })}
                      options={guards.map((g) => ({ value: g.name, label: g.name }))}
                      placeholder="Select guard"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => openProof(row)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      <ImageIcon size={14} /> View
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    {!isLocked && (
                      <button onClick={() => removeRow(idx)} className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400">
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

      {!isLocked && (
        <button
          onClick={() => persist("draft")}
          disabled={saving}
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save as Draft"}
        </button>
      )}

      {proofRow && (
        <Modal title={`Proof — ${proofRow.site || "Select a site"}`} onClose={() => setProofRow(null)} wide>
          {proofSubmissions.length === 0 ? (
            <p className="text-sm text-subtext dark:text-gray-400 text-center py-6">No guard submissions found for this site / time.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {proofSubmissions.map((s, idx) => (
                <div key={s._id} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="relative w-full h-28 block group"
                    title="Click to maximize"
                  >
                    <img src={cloudinaryThumbnailUrl(s.guardPhotoUrl)} alt={s.guardName} className="w-full h-28 object-cover" />
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                      <Maximize2 size={18} className="text-white opacity-0 group-hover:opacity-100" />
                    </span>
                  </button>
                  <div className="p-2 text-xs text-gray-600 dark:text-gray-400">
                    <p className="font-semibold text-heading dark:text-gray-100">{s.guardName}</p>
                    <p>{new Date(s.capturedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {proofRow && lightboxIndex !== null && (
        <PhotoLightbox
          photos={proofSubmissions}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          caption={(p) => `${p.guardName} — ${p.projectName} — ${new Date(p.capturedAt).toLocaleString()}`}
          downloadName={(p) => `${p.projectName}-${p.guardName}`}
        />
      )}
    </div>
  );
}
