import React, { useEffect, useState } from "react";
import { Clock3, MapPin, Link as LinkIcon, ExternalLink, ListChecks, Maximize2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import PhotoLightbox from "../../components/PhotoLightbox";
import ThemedSelect from "../../components/ThemedSelect";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import { listRegalGardenClubSubmissions, getRegalGardenClubSubmission } from "../../api/regalGardenClub";
import { REGAL_GARDEN_CLUB_FORMS } from "../../layouts/navConfig";
import { cloudinaryThumbnailUrl } from "../../utils/cloudinary";

function formLabel(formNumber) {
  return REGAL_GARDEN_CLUB_FORMS.find((f) => f.formNumber === formNumber)?.label || `Form ${formNumber}`;
}

export default function RegalGardenClubSubmissionsPage() {
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
    listRegalGardenClubSubmissions({
      formNumber: formFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }).then((rows) => {
      setSubmissions(rows);
      setLoading(false);
    });
  }, [dateFrom, dateTo, formFilter]);

  const copyLink = async (formNumber) => {
    const url = `${window.location.origin}/regal-garden-club-form/${formNumber}`;
    await navigator.clipboard.writeText(url);
    setCopiedForm(formNumber);
    setTimeout(() => setCopiedForm(null), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Regal Garden Club — Submissions"
        subtitle="Checkpoint photo responses across all Regal Garden Club forms."
      />

      {REGAL_GARDEN_CLUB_FORMS.length === 0 ? (
        <p className="text-sm text-subtext dark:text-gray-400 mb-5">Koi form abhi tak add nahi hua hai.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {REGAL_GARDEN_CLUB_FORMS.map((f) => (
            <div key={f.formNumber} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-heading dark:text-gray-100">{f.label}</p>
                <p className="text-xs text-subtext dark:text-gray-400">{f.checkpoints.length} checkpoints</p>
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
                  onClick={() => window.open(`/regal-garden-club-form/${f.formNumber}`, "_blank")}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:underline flex items-center gap-1"
                  title="Open form"
                >
                  <ExternalLink size={13} /> Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-5">
        <StatCard label="Total Submissions" value={submissions.length} icon={<ListChecks size={16} />} color="blue" />
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm text-subtext dark:text-gray-400">Submitted between</span>
        <ThemedDatePicker value={dateFrom} onChange={setDateFrom} className="max-w-[160px]" />
        <span className="text-sm text-subtext dark:text-gray-400">and</span>
        <ThemedDatePicker value={dateTo} onChange={setDateTo} className="max-w-[160px]" />
        <ThemedSelect
          value={formFilter}
          onChange={setFormFilter}
          options={REGAL_GARDEN_CLUB_FORMS.map((f) => ({ value: f.formNumber, label: f.label }))}
          placeholder="All forms"
          className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 max-w-[220px] w-full"
        />
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
                onClick={async () => setViewing(await getRegalGardenClubSubmission(r._id))}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View Photos
              </button>
            ),
          },
        ]}
        rows={loading ? [] : submissions}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No Regal Garden Club submissions yet"}
      />

      {viewing && (
        <Modal title={`${viewing.submittedBy} — ${formLabel(viewing.formNumber)}`} onClose={() => setViewing(null)} wide>
          {viewing.textAnswers?.length > 0 && (
            <div className="mb-4 space-y-1.5">
              {viewing.textAnswers.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                  <span className="font-medium text-heading dark:text-gray-100">{t.label}</span>
                  <span className="text-gray-600 dark:text-gray-400">{t.value || <span className="text-gray-300 dark:text-gray-600">—</span>}</span>
                </div>
              ))}
            </div>
          )}
          {viewing.photos.length === 0 ? (
            <p className="text-sm text-subtext dark:text-gray-400 text-center py-6">No checkpoint photos were submitted.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {viewing.photos.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="relative w-full h-32 block group"
                    title="Click to maximize"
                  >
                    <img src={cloudinaryThumbnailUrl(p.photoUrl)} alt={p.checkpointLabel} className="w-full h-32 object-cover" />
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                      <Maximize2 size={20} className="text-white opacity-0 group-hover:opacity-100" />
                    </span>
                  </button>
                  <div className="p-2 text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                    <p className="font-semibold text-heading dark:text-gray-100">{p.checkpointLabel}</p>
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
          downloadName={(p) => `regal-garden-club-${p.checkpointLabel}`}
        />
      )}
    </div>
  );
}
