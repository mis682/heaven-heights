import React from "react";
import ChecklistKpiPage from "../../components/ChecklistKpiPage";
import { getGCHousekeepingKpi, gcHousekeepingKpiPdfUrl } from "../../api/gcHousekeepingReport";

export default function GCHousekeepingKpiPage() {
  return (
    <ChecklistKpiPage
      title="Garden City Housekeeping — KPI"
      subtitle="Checkpoint compliance — how often each checkpoint came back OK vs Not OK over the date range."
      fetchKpi={getGCHousekeepingKpi}
      pdfUrl={gcHousekeepingKpiPdfUrl}
    />
  );
}
