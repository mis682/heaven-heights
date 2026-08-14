import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, Send, Image as ImageIcon, Lock, Maximize2 } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import StatusPill from "../../../components/StatusPill";
import Modal from "../../../components/Modal";
import PhotoLightbox from "../../../components/PhotoLightbox";
import { useAuth } from "../../../context/AuthContext";
import {
  getNightGuardMeta,
  getReportByDate,
  saveDraftReport,
  submitReport,
  listNightGuardSubmissions,
} from "../../../api/nightguard";
import { listGuards } from "../../../api/guards";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateHeader(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${m}/${d}/${y}`;
}

function emptyRow(site, timeSlot) {
  return { site: site || "", timeSlot: timeSlot || "", guardName: "", status: "", linkedSubmissionId: null };
}

export default function NightGuardDailyReportPage() {
  const { user } = useAuth();
  const [meta, setMeta] = useState({ sites: [], statusOptions: [], timeSlots: [] });
  const [date, setDate] = useState(today());
  const [report, setReport] = useState(null);
  const [rows, setRows] = useState([]);
  const [guards, setGuards] = useState([]);
  const [proofRow, setProofRow] = useState(null);
  const [proofSubmissions, setProofSubmissions] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNightGuardMeta().then(setMeta);
    // Not filtered by site — guards rotate between sites daily.
    listGuards({ module: "night_guard" }).then(setGuards);
  }, []);

  useEffect(() => {
    (async () => {
      const r = await getReportByDate(date);
      setReport(r);
      setRows(r ? r.entries.map((e) => ({ ...e })) : [emptyRow()]);
    })();
  }, [date]);

  const isLocked = report?.status === "submitted";

  const updateRow = (idx, patch) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const openProof = async (row) => {
    if (!row.site) return;
    setProofRow(row);
    setLightboxIndex(null);
    const subs = await listNightGuardSubmissions({ site: row.site, date, hour: row.timeSlot || undefined });
    setProofSubmissions(subs);
  };

  const persist = async (targetStatus) => {
    const cleanRows = rows.filter((r) => r.site && r.timeSlot && r.guardName && r.status);
    const droppedCount = rows.length - cleanRows.length;

    if (rows.length > 0 && cleanRows.length === 0) {
      alert("Every row is missing a Site, Time, Guard Name or Status — nothing was saved. Fill in all fields before saving.");
      return;
    }
    if (droppedCount > 0) {
      const proceed = window.confirm(
        `${droppedCount} row(s) are incomplete (missing Site/Time/Guard Name/Status) and will NOT be saved. Continue anyway?`
      );
      if (!proceed) return;
    }

    setSaving(true);
    const saved = await saveDraftReport({ reportDate: date, entries: cleanRows, preparedBy: user?.name || "" });
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
            : [{ label: "Add Row", icon: <Plus size={16} />, onClick: addRow }]
        }
        primaryAction={
          isLocked
            ? undefined
            : { label: saving ? "Saving..." : "Submit Report", icon: <Send size={16} />, onClick: () => persist("submitted") }
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-gray-700">Report Date</label>
        <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className="input max-w-[180px]" />
        {isLocked && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
            <Lock size={12} /> Submitted — read only (ask Admin to unlock)
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Site", "Time", formatDateHeader(date), "Guard Name", "Proof", ""].map((h) => (
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
                  <td className="px-4 py-2">
                    <select disabled={isLocked} value={row.timeSlot} onChange={(e) => updateRow(idx, { timeSlot: e.target.value })} className="input">
                      <option value="">Time</option>
                      {meta.timeSlots.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </td>
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
