import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import { getVehicleMeta, listVehicleSubmissions } from "../../api/vehicle";

export default function VehicleRideSubmissionsPage() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleName, setVehicleName] = useState("");
  const [date, setDate] = useState("");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicleMeta().then((m) => setVehicles(m.vehicles));
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await listVehicleSubmissions({ vehicleName: vehicleName || undefined, date: date || undefined });
    setRides(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleName, date]);

  return (
    <div>
      <PageHeader title="Daily Basis Ride — Submissions" subtitle="Every logged ride, with the distance covered each time." />

      <FilterBar
        search=""
        onSearchChange={() => {}}
        placeholder="Search..."
        filters={
          <>
            <Select value={vehicleName} onChange={setVehicleName} options={vehicles} placeholder="All vehicles" />
            <ThemedDatePicker value={date} onChange={setDate} className="max-w-[160px]" />
          </>
        }
      />

      <DataTable
        columns={[
          { key: "vehicleName", header: "Vehicle Name" },
          { key: "date", header: "Date" },
          { key: "startReading", header: "Start Meter Reading" },
          { key: "endReading", header: "Ending Meter Reading" },
          { key: "distance", header: "Distance (km)" },
          { key: "personName", header: "Person Name" },
        ]}
        rows={loading ? [] : rides}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No rides match these filters"}
      />
    </div>
  );
}
