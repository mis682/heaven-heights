import React, { useState } from "react";
import ChecklistKpiPage from "../../components/ChecklistKpiPage";
import ThemedSelect from "../../components/ThemedSelect";
import { MAINTENANCE_UNIFORM_REPORT_FORMATS } from "../../constants/maintenanceUniform";
import { getMaintenanceUniformKpi, maintenanceUniformKpiPdfUrl } from "../../api/maintenanceUniformReport";

const REPORT_NAMES = Object.keys(MAINTENANCE_UNIFORM_REPORT_FORMATS);

export default function MaintenanceUniformKpiPage() {
  const [reportName, setReportName] = useState("");

  return (
    <ChecklistKpiPage
      title="Maintenance Uniform — KPI"
      subtitle="Staff compliance — how often each staff member came back OK vs Not OK over the date range."
      groupColumnLabel="Staff"
      fetchKpi={(from, to) => getMaintenanceUniformKpi(from, to, reportName)}
      pdfUrl={(from, to) => maintenanceUniformKpiPdfUrl(from, to, reportName)}
      extraFilter={
        <ThemedSelect value={reportName} onChange={setReportName} options={REPORT_NAMES} placeholder="All reports" className="max-w-[200px]" />
      }
    />
  );
}
