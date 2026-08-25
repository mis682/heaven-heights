import React, { useEffect, useState } from "react";
import { IdCard, User, Download } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import { getMaintenanceStaffMeta, listMaintenanceStaff } from "../../api/maintenanceStaff";
import { printIdCardsUrl } from "../../api/idCardPrint";

// Standalone page, deliberately separate from MaintenanceStaffPage — only
// reads staff data via the existing (unmodified) API, to print several ID
// cards onto shared pages (3 per page) instead of one page per card, at the
// exact same physical card size so laminating pouches still fit.
export default function PrintIdCardsPage() {
  const [staff, setStaff] = useState([]);
  const [meta, setMeta] = useState({ sites: [], designations: [], companies: [] });
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    getMaintenanceStaffMeta().then(setMeta);
  }, []);

  useEffect(() => {
    setLoading(true);
    listMaintenanceStaff({
      siteName: siteFilter || undefined,
      designation: designationFilter || undefined,
      search: search || undefined,
    }).then((data) => {
      setStaff(data);
      setLoading(false);
    });
  }, [siteFilter, designationFilter, search]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelected((prev) => {
      const allVisible = staff.every((s) => prev.has(s._id));
      const next = new Set(prev);
      staff.forEach((s) => (allVisible ? next.delete(s._id) : next.add(s._id)));
      return next;
    });
  };

  const download = () => {
    if (selected.size === 0) return;
    window.open(printIdCardsUrl([...selected]), "_blank");
  };

  const allVisibleSelected = staff.length > 0 && staff.every((s) => selected.has(s._id));

  return (
    <div>
      <PageHeader
        title="Print ID Cards"
        subtitle="Select multiple staff to print their ID cards together — 3 per page, same size as a single card."
        primaryAction={{
          label: `Download Selected (${selected.size})`,
          icon: <Download size={16} />,
          onClick: download,
        }}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by name, employee ID, site or designation..."
        filters={
          <>
            <Select value={siteFilter} onChange={setSiteFilter} options={meta.sites} placeholder="All sites" />
            <Select value={designationFilter} onChange={setDesignationFilter} options={meta.designations} placeholder="All designations" />
          </>
        }
      />

      <DataTable
        columns={[
          {
            key: "select",
            header: <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} />,
            render: (r) => <input type="checkbox" checked={selected.has(r._id)} onChange={() => toggle(r._id)} />,
          },
          {
            key: "photo",
            header: "Photo",
            render: (r) =>
              r.photo ? (
                <img src={r.photo} alt={r.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <User size={16} className="text-gray-400" />
                </div>
              ),
          },
          { key: "employeeId", header: "Employee ID" },
          { key: "siteName", header: "Site Name" },
          { key: "designation", header: "Designation" },
          { key: "name", header: "Name" },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <a
                href={printIdCardsUrl([r._id])}
                target="_blank"
                rel="noreferrer"
                className="text-gray-500 hover:text-primary"
                title="Download this ID Card"
              >
                <IdCard size={16} />
              </a>
            ),
          },
        ]}
        rows={loading ? [] : staff}
        emptyMessage={loading ? "Loading..." : "No records found"}
        emptyHint={loading ? "" : "No staff match these filters"}
      />
    </div>
  );
}
