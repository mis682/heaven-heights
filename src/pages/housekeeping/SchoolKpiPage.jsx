import React, { useEffect, useState } from "react";
import ChecklistKpiPage from "../../components/ChecklistKpiPage";
import ThemedSelect from "../../components/ThemedSelect";
import { getSchoolReportMeta, getSchoolKpi, schoolKpiPdfUrl } from "../../api/schoolReport";

export default function SchoolKpiPage() {
  const [forms, setForms] = useState([]);
  const [formNumber, setFormNumber] = useState("");

  useEffect(() => {
    getSchoolReportMeta().then((m) => setForms(m.forms));
  }, []);

  return (
    <ChecklistKpiPage
      title="School — KPI"
      subtitle="Checkpoint compliance — how often each checkpoint came back OK vs Not OK over the date range."
      fetchKpi={(from, to) => getSchoolKpi(from, to, formNumber)}
      pdfUrl={(from, to) => schoolKpiPdfUrl(from, to, formNumber)}
      extraFilter={
        <ThemedSelect
          value={formNumber}
          onChange={setFormNumber}
          options={forms.map((f) => ({ value: f.formNumber, label: f.label }))}
          placeholder="All forms"
          className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-between gap-2 max-w-[200px] w-full"
        />
      }
    />
  );
}
