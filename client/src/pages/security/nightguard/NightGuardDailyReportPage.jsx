import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, Send, Image as ImageIcon, Lock, Maximize2 } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import StatusPill from "../../../components/StatusPill";
import Modal from "../../../components/Modal";
import PhotoLightbox from "../../../components/PhotoLightbox";
import { useAuth } from "../../../context/AuthContext";
import {
  getNightGuardMeta,
  getOpenDraft,
  saveDraftReport,
  submitReport,
  listNightGuardSubmissions,
} from "../../../api/nightguard";
import { listMaintenanceStaff } from "../../../api/maintenanceStaff";

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
      setRows(r && r.entries.length > 0 ? r.entries.map((e) => ({ ...e })) : makeShiftSet(m.timeSlots));
    })();
  }, []);

  const isLocked = report?.status === "submitted";

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

    if (rows.length > 0 && cleanRows.length === 0) {
      alert("Every row is missing a Date, Site, Time, Guard Name or Status — nothing was saved. Fill in all fields before saving.");
      return;
    }
    // Submitting locks the report, so it's worth letting the coordinator back
    // out and go fill in the rest first. Saving a draft never blocks on this
    // — the completed rows are saved immediately regardless, so a cancelled
    // (or dismissed) prompt can never discard already-finished work. Losing
    // work here isn't hypothetical: a coordinator once hit Cancel on this
    // prompt while saving a draft and the whole in-progress report vanished,
    // because nothing had reached the server yet.
    if (targetStatus === "submitted" && droppedCount > 0) {
      const proceed = window.confirm(
        `${droppedCount} row(s) are incomplete (missing Date/Site/Time/Guard Name/Status) and will NOT be included. Continue anyway?`
      );
      if (!proceed) return;
    }

    setSaving(true);
    const saved = await saveDraftReport({ entries: cleanRows, preparedBy: user?.name || "" });
    if (targetStatus === "submitted") {
      const submitted = await submitReport(saved._id);
      setReport(submitted);
      setRows(submitted.entries.map((e) => ({ ...e })));
    } else {
      setReport(saved);
      if (droppedCount > 0) {
        alert(`Saved ${cleanRows.length} completed row(s). ${droppedCount} incomplete row(s) were not saved — fill them in and save again.`);
      }
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

      {isLocked && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
            <Lock size={12} /> Submitted — read only (ask Admin to unlock)
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Date", "Site", "Time", "Status", "Guard Name", "Proof", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-4 py-2">
                    <input
                      type="date"
                      disabled={isLocked}
                      value={row.date || ""}
                      max={today()}
                      onChange={(e) => updateRow(idx, { date: e.target.value })}
                      className="input min-w-[150px]"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      disabled={isLocked}
                      value={row.site}
                      onChange={(e) => updateRow(idx, { site: e.target.value, guardName: "" })}
                      className="input"
                    >
                      <option value="">Select site</option>
                      {meta.sites.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{row.timeSlot}</td>
                  <td className="px-4 py-2">
                    <select disabled={isLocked} value={row.status} onChange={(e) => updateRow(idx, { status: e.target.value })} className="input">
                      <option value="">Status</option>
                      {meta.statusOptions.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    {row.status && <div className="mt-1"><StatusPill status={row.status} /></div>}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      disabled={isLocked}
                      value={row.guardName}
                      onChange={(e) => updateRow(idx, { guardName: e.target.value })}
                      className="input"
                    >
                      <option value="">Select guard</option>
                      {guards.map((g) => <option key={g._id} value={g.name}>{g.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => openProof(row)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      <ImageIcon size={14} /> View
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    {!isLocked && (
                      <button onClick={() => removeRow(idx)} className="text-gray-400 hover:text-red-600">
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
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save as Draft"}
        </button>
      )}

      {proofRow && (
        <Modal title={`Proof — ${proofRow.site || "Select a site"}`} onClose={() => setProofRow(null)} wide>
          {proofSubmissions.length === 0 ? (
            <p className="text-sm text-subtext text-center py-6">No guard submissions found for this site / time.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {proofSubmissions.map((s, idx) => (
                <div key={s._id} className="rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="relative w-full h-28 block group"
                    title="Click to maximize"
                  >
                    <img src={s.guardPhotoUrl} alt={s.guardName} className="w-full h-28 object-cover" />
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                      <Maximize2 size={18} className="text-white opacity-0 group-hover:opacity-100" />
                    </span>
                  </button>
                  <div className="p-2 text-xs text-gray-600">
                    <p className="font-semibold text-heading">{s.guardName}</p>
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
