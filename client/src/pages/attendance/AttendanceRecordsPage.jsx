import React, { useEffect, useState } from "react";
import { LogIn, LogOut, User, CheckCircle2, XCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import FilterBar, { Select } from "../../components/FilterBar";
import PhotoLightbox from "../../components/PhotoLightbox";
import { listAttendanceScanRecords } from "../../api/attendanceScan";
import { listSiteLocations } from "../../api/siteLocations";

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
          {
            key: "photo",
            header: "Photo",
            render: (r) =>
              r.photo ? (
                <img
                  src={r.photo}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 cursor-pointer"
                  onClick={() => setLightboxIndex(photosWithRecord.indexOf(r))}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <User size={16} className="text-gray-400" />
                </div>
              ),
          },
          { key: "name", header: "Name" },
          { key: "employeeId", header: "Employee ID" },
          { key: "siteName", header: "Site" },
          {
            key: "type",
            header: "Type",
            render: (r) =>
              r.type === "in" ? (
                <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium">
                  <LogIn size={13} /> In
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                  <LogOut size={13} /> Out
                </span>
              ),
          },
          {
            key: "date",
            header: "Date",
            render: (r) => new Date(r.timestamp).toLocaleDateString(),
          },
          {
            key: "timestamp",
            header: "Time",
            render: (r) => new Date(r.timestamp).toLocaleTimeString(),
          },
          {
            key: "location",
            header: "Location",
            render: (r) => {
              if (r.latitude == null || r.longitude == null) {
                return <span className="text-xs text-gray-400">—</span>;
              }
              return (
                <div className="max-w-[220px]">
                  <a
                    href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    title={r.address || `${r.latitude}, ${r.longitude}`}
                    className="text-xs text-gray-600 hover:text-primary hover:underline line-clamp-2"
                  >
                    {r.address || `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`}
                  </a>
                  {r.withinGeofence != null && (
                    <div className="mt-0.5">
                      {r.withinGeofence ? (
                        <span className="inline-flex items-center gap-1 text-green-700 text-xs">
                          <CheckCircle2 size={13} /> On site
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs">
                          <XCircle size={13} /> Off site
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            },
          },
        ]}
        rows={loading ? [] : records}
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
