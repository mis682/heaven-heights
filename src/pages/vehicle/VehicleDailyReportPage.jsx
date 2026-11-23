import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import ThemedDatePicker from "../../components/ThemedDatePicker";
import { getVehicleMeta, getVehicleDailyReport } from "../../api/vehicle";

export default function VehicleDailyReportPage() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleName, setVehicleName] = useState("");
  const [date, setDate] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicleMeta().then((m) => setVehicles(m.vehicles));
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await getVehicleDailyReport({ vehicleName: vehicleName || undefined, date: date || undefined });
    setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleName, date]);

  return (
    <div>
      <PageHeader title="Vehicle Daily Report" subtitle="Total kilometers each vehicle covered, per day." />

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
          { key: "totalDistance", header: "Total KM" },
          { key: "rideCount", header: "Rides Logged" },
        ]}
        rows={loading ? [] : rows}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No rides match these filters"}
      />
    </div>
  );
}
