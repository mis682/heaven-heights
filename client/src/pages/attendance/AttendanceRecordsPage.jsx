import React, { useEffect, useMemo, useState } from "react";
import { User, CheckCircle2, XCircle, Trash2, Sun, Moon } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import FilterBar, { Select } from "../../components/FilterBar";
import PhotoLightbox from "../../components/PhotoLightbox";
import { listAttendanceScanRecords, deleteAttendanceScanRecord } from "../../api/attendanceScan";
import { listSiteLocations } from "../../api/siteLocations";

function formatTotalHours(inRecord, outRecord) {
  if (!inRecord || !outRecord) return "—";
  const ms = new Date(outRecord.timestamp) - new Date(inRecord.timestamp);
  if (ms <= 0) return "—";
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function PunchCell({ record, onPhotoClick, onDelete }) {
  if (!record) return <span className="text-xs text-gray-400">—</span>;

  return (
    <div className="flex items-center gap-2 group">
      {record.photo ? (
        <img
          src={record.photo}
          alt=""
          className="w-8 h-8 rounded-full object-cover border border-gray-200 cursor-pointer shrink-0"
          onClick={() => onPhotoClick(record)}
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
          <User size={14} className="text-gray-400" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-heading flex items-center gap-1">
          {new Date(record.timestamp).toLocaleTimeString()}
          {record.shift === "day" && <Sun size={12} className="text-amber-500" />}
          {record.shift === "night" && <Moon size={12} className="text-indigo-500" />}
        </p>
        {record.latitude != null && (
          <a
            href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
            target="_blank"
            rel="noreferrer"
            title={record.address || `${record.latitude}, ${record.longitude}`}
            className="text-xs text-gray-500 hover:text-primary hover:underline line-clamp-1 max-w-[160px] block"
          >
            {record.address || `${record.latitude.toFixed(5)}, ${record.longitude.toFixed(5)}`}
          </a>
        )}
        {record.withinGeofence != null &&
          (record.withinGeofence ? (
            <span className="inline-flex items-center gap-1 text-green-700 text-xs">
              <CheckCircle2 size={12} /> On site
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-red-600 text-xs">
              <XCircle size={12} /> Off site
            </span>
          ))}
      </div>
      <button
        onClick={() => onDelete(record)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 shrink-0"
        title="Delete this punch"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function AttendanceRecordsPage() {
  const [records, setRecords] = useState([]);
  const [sites, setSites] = useState([]);
  const [siteFilter, setSiteFilter] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    listSiteLocations().then((data) => setSites(data.map((s) => s.siteName)));
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await listAttendanceScanRecords({
      siteName: siteFilter || undefined,
      date: date || undefined,
      search: search || undefined,
    });
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteFilter, date, search]);

  const photosWithRecord = records.filter((r) => r.photo);

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete ${record.type === "in" ? "Punch In" : "Punch Out"} for ${record.name}?`)) return;
    await deleteAttendanceScanRecord(record._id);
    load();
  };

  // Group scans by staff + shift day, then take the chronologically earliest
  // scan as Punch In and the latest as Punch Out — any scans in between
  // (e.g. someone checking again mid-shift) are ignored, same rule the
  // Team Attendance grid uses. A night shift's later scans carry shiftDate
  // copied from the original "in", so they group with that day even though
  // they happened after midnight.
  const rows = useMemo(() => {
    const byKey = new Map();
    records.forEach((r) => {
      const dateKey = r.shiftDate || new Date(r.timestamp).toISOString().slice(0, 10);
      const key = `${r.employeeId}__${dateKey}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          employeeId: r.employeeId,
          name: r.name,
          siteName: r.siteName,
          dateKey,
          scans: [],
        });
      }
      byKey.get(key).scans.push(r);
    });
    return Array.from(byKey.values())
      .map((row) => {
        const sorted = [...row.scans].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return { ...row, in: sorted[0] || null, out: sorted.length > 1 ? sorted[sorted.length - 1] : null };
      })
      .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
  }, [records]);

  return (
    <div>
      <PageHeader title="Attendance Records" subtitle="QR scan se capture hui saari punch in/out entries." />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by name, employee ID or site..."
        filters={
          <>
            <Select value={siteFilter} onChange={setSiteFilter} options={sites} placeholder="All sites" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </>
        }
      />

      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "employeeId", header: "Employee ID" },
          { key: "siteName", header: "Site" },
          {
            key: "dateKey",
            header: "Date",
            render: (r) => new Date(r.dateKey).toLocaleDateString(),
          },
          {
            key: "in",
            header: "Punch In",
            render: (r) => (
              <PunchCell
                record={r.in}
                onPhotoClick={(rec) => setLightboxIndex(photosWithRecord.indexOf(rec))}
                onDelete={handleDelete}
              />
            ),
          },
          {
            key: "out",
            header: "Punch Out",
            render: (r) => (
              <PunchCell
                record={r.out}
                onPhotoClick={(rec) => setLightboxIndex(photosWithRecord.indexOf(rec))}
                onDelete={handleDelete}
              />
            ),
          },
          {
            key: "totalHours",
            header: "Total Hours",
            render: (r) => <span className="text-sm font-medium text-heading">{formatTotalHours(r.in, r.out)}</span>,
          },
        ]}
        rows={loading ? [] : rows}
        rowKey="key"
        emptyMessage={loading ? "Loading..." : "Koi attendance record nahi mila"}
        emptyHint={loading ? "" : "Scan Attendance page se QR scan karke shuru karein"}
      />

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photosWithRecord.map((r) => ({ photoUrl: r.photo }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          caption={(_, idx) => `${photosWithRecord[idx].name} — ${new Date(photosWithRecord[idx].timestamp).toLocaleString()}`}
          downloadName={(_, idx) => `${photosWithRecord[idx].employeeId}-${photosWithRecord[idx].type}`}
        />
      )}
    </div>
  );
}
