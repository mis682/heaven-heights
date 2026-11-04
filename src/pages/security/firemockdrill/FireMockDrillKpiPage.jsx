import React, { useEffect, useState } from "react";
import ChecklistKpiPage from "../../../components/ChecklistKpiPage";
import ThemedSelect from "../../../components/ThemedSelect";
import { getFireMockDrillReportMeta, getFireMockDrillKpi, fireMockDrillKpiPdfUrl } from "../../../api/fireMockDrillReport";

export default function FireMockDrillKpiPage() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    getFireMockDrillReportMeta().then((m) => setProjects(m.projects));
  }, []);

  return (
    <ChecklistKpiPage
      title="Fire Mock Drill — KPI"
      subtitle="Attachment compliance — how often each attachment came back OK vs Not OK over the date range."
      fetchKpi={(from, to) => getFireMockDrillKpi(from, to, projectName)}
      pdfUrl={(from, to) => fireMockDrillKpiPdfUrl(from, to, projectName)}
      extraFilter={
        <ThemedSelect
          value={projectName}
          onChange={setProjectName}
          options={projects}
          placeholder="All projects"
          className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 max-w-[200px] w-full"
        />
      }
    />
  );
}
