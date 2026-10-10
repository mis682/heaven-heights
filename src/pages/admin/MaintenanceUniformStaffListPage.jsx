import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import { getMaintenanceUniformStaffList } from "../../api/maintenanceUniformReport";
import { MAINTENANCE_UNIFORM_DESIGNATIONS } from "../../constants/maintenanceUniform";

export default function MaintenanceUniformStaffListPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [designation, setDesignation] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMaintenanceUniformStaffList().then((data) => {
      setStaff(data);
      setLoading(false);
    });
  }, []);

  const filtered = staff.filter((s) => {
    if (designation && s.designation !== designation) return false;
    if (search && !s.staffName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Maintenance Uniform — Staff List"
        subtitle="Security Guard, House Keeping and Gardener staff covered by this checklist."
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by staff name..."
        filters={<Select value={designation} onChange={setDesignation} options={MAINTENANCE_UNIFORM_DESIGNATIONS} placeholder="All designations" />}
      />

      <DataTable
        columns={[
          { key: "siteName", header: "Site Name" },
          { key: "staffName", header: "Staff Name" },
          { key: "designation", header: "Designation" },
        ]}
        rows={loading ? [] : filtered}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No staff match these filters"}
      />
    </div>
  );
}
