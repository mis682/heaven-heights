import React, { useEffect, useState } from "react";
import { MapPin, LocateFixed, CheckCircle2 } from "lucide-react";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { listSiteLocations, saveSiteLocation, setSiteLocationEnabled } from "../../api/siteLocations";

export default function SiteLocationsCore() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [togglingSite, setTogglingSite] = useState(null);

  const load = async () => {
    setLoading(true);
    setSites(await listSiteLocations());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleEnabled = async (site) => {
    setTogglingSite(site.siteName);
    await setSiteLocationEnabled(site.siteName, !site.enabled);
    await load();
    setTogglingSite(null);
  };

  return (
    <div>
      <DataTable
        columns={[
          { key: "siteName", header: "Site Name" },
          {
            key: "latitude",
            header: "Latitude",
            render: (r) => (r.latitude != null ? r.latitude.toFixed(6) : "—"),
          },
          {
            key: "longitude",
            header: "Longitude",
            render: (r) => (r.longitude != null ? r.longitude.toFixed(6) : "—"),
          },
          { key: "radiusMeters", header: "Radius (m)" },
          {
            key: "configured",
            header: "Status",
            render: (r) =>
              r.configured ? (
                <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium">
                  <CheckCircle2 size={14} /> Set
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-600">Not set</span>
              ),
          },
          {
            key: "enabled",
            header: "Location",
            render: (r) =>
              r.configured ? (
                <button
                  onClick={() => toggleEnabled(r)}
                  disabled={togglingSite === r.siteName}
                  title={r.enabled ? "Location ON — click to turn OFF" : "Location OFF — click to turn ON"}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                    r.enabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      r.enabled ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <button onClick={() => setEditing(r)} className="text-gray-500 hover:text-primary" title="Set location">
                <MapPin size={16} />
              </button>
            ),
          },
        ]}
        rows={loading ? [] : sites}
        rowKey="siteName"
        emptyMessage={loading ? "Loading..." : "Koi site nahi mili"}
        emptyHint={loading ? "" : "Maintenance Staff mein sites add karein"}
      />

      {editing && (
        <SiteLocationModal
          site={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function SiteLocationModal({ site, onClose, onSaved }) {
  const [latitude, setLatitude] = useState(site.latitude ?? "");
  const [longitude, setLongitude] = useState(site.longitude ?? "");
  const [radiusMeters, setRadiusMeters] = useState(site.radiusMeters ?? 500);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is device par support nahi hai");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setError("Location access nahi mil paya — permission allow karein");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (latitude === "" || longitude === "") {
      setError("Latitude/Longitude zaroori hai");
      return;
    }
    setSaving(true);
    await saveSiteLocation(site.siteName, {
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusMeters: Number(radiusMeters) || 500,
    });
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={`Location: ${site.siteName}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary text-primary font-medium text-sm hover:bg-primary-light"
        >
          <LocateFixed size={16} />
          {locating ? "Location le rahe hain..." : "Use My Current Location"}
        </button>

        <Field label="Latitude">
          <input
            required
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Longitude">
          <input
            required
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Allowed Radius (meters)">
          <input
            required
            type="number"
            min="10"
            value={radiusMeters}
            onChange={(e) => setRadiusMeters(e.target.value)}
            className="input"
          />
        </Field>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button disabled={saving} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 mt-2">
          {saving ? "Saving..." : "Save Location"}
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
