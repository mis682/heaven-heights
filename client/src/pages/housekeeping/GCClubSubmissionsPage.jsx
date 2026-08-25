import React, { useEffect, useState } from "react";
import { Clock3, MapPin, Link as LinkIcon, ExternalLink, ListChecks, Maximize2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import PhotoLightbox from "../../components/PhotoLightbox";
import { listGCClubSubmissions, getGCClubSubmission } from "../../api/gcClub";
import { GC_CLUB_FORMS } from "../../layouts/navConfig";

function formLabel(formNumber) {
  return GC_CLUB_FORMS.find((f) => f.formNumber === formNumber)?.label || `Form ${formNumber}`;
}

export default function GCClubSubmissionsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [formFilter, setFormFilter] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [copiedForm, setCopiedForm] = useState(null);

  useEffect(() => {
    setLoading(true);
    listGCClubSubmissions({
      formNumber: formFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }).then((rows) => {
      setSubmissions(rows);
      setLoading(false);
    });
  }, [dateFrom, dateTo, formFilter]);

  const copyLink = async (formNumber) => {
    const url = `${window.location.origin}/gc-club-form/${formNumber}`;
    await navigator.clipboard.writeText(url);
    setCopiedForm(formNumber);
    setTimeout(() => setCopiedForm(null), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Garden City Club — Submissions"
        subtitle="Checkpoint photo responses across all Garden City Club forms."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {GC_CLUB_FORMS.map((f) => (
          <div key={f.formNumber} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-heading">{f.label}</p>
              <p className="text-xs text-subtext">{f.checkpoints.length} checkpoints</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <button
                onClick={() => copyLink(f.formNumber)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                title="Copy public link"
              >
                <LinkIcon size={13} /> {copiedForm === f.formNumber ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={() => window.open(`/gc-club-form/${f.formNumber}`, "_blank")}
                className="text-xs font-semibold text-gray-500 hover:underline flex items-center gap-1"
                title="Open form"
              >
                <ExternalLink size={13} /> Open
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <StatCard label="Total Submissions" value={submissions.length} icon={<ListChecks size={16} />} color="blue" />
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm text-subtext">Submitted between</span>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input max-w-[160px]" />
        <span className="text-sm text-subtext">and</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input max-w-[160px]" />
        <select value={formFilter} onChange={(e) => setFormFilter(e.target.value)} className="input max-w-[220px]">
          <option value="">All forms</option>
          {GC_CLUB_FORMS.map((f) => (
            <option key={f.formNumber} value={f.formNumber}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={[
          { key: "formNumber", header: "Form", render: (r) => formLabel(r.formNumber) },
          { key: "submittedBy", header: "Submitted By" },
          { key: "submittedAt", header: "Submitted At", render: (r) => new Date(r.submittedAt).toLocaleString() },
          { key: "photoCount", header: "Photos" },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <button
                onClick={async () => setViewing(await getGCClubSubmission(r._id))}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View Photos
              </button>
            ),
          },
        ]}
        rows={loading ? [] : submissions}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No Garden City Club submissions yet"}
      />

      {viewing && (
        <Modal title={`${viewing.submittedBy} — ${formLabel(viewing.formNumber)}`} onClose={() => setViewing(null)} wide>
          {viewing.textAnswers?.length > 0 && (
            <div className="mb-4 space-y-1.5">
              {viewing.textAnswers.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span className="font-medium text-heading">{t.label}</span>
                  <span className="text-gray-600">{t.value || <span className="text-gray-300">—</span>}</span>
                </div>
              ))}
            </div>
          )}
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
                    <img src={p.photoUrl} alt={p.checkpointLabel} className="w-full h-32 object-cover" />
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                      <Maximize2 size={20} className="text-white opacity-0 group-hover:opacity-100" />
                    </span>
                  </button>
                  <div className="p-2 text-xs text-gray-600 space-y-0.5">
                    <p className="font-semibold text-heading">{p.checkpointLabel}</p>
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
          caption={(p) => `${p.checkpointLabel} — ${viewing.submittedBy} — ${new Date(p.capturedAt).toLocaleString()}`}
          downloadName={(p) => `gc-club-${p.checkpointLabel}`}
        />
      )}
    </div>
  );
}
