import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import ThemedSelect from "../../components/ThemedSelect";
import { PM_PROJECT_FORM_ROUTES } from "../../layouts/navConfig";

// Single shared entry point for the "Unit Photographs Form" — all 3
// Property Management projects use the exact same checklist, so instead of
// distributing 3 separate links, field staff get one link, pick their
// Project here, and get routed to that project's own public form — the
// submission then lands in that project's own Submissions/Daily
// Report/Admin Report, same as if they'd gone there directly.
export default function PropertyManagementFormEntry() {
  const navigate = useNavigate();
  const [project, setProject] = useState("");

  const goToForm = () => {
    const path = PM_PROJECT_FORM_ROUTES[project];
    if (path) navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 px-4 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-heading dark:text-gray-100 text-lg">Property Management — Unit Photographs Form</p>
            <p className="text-sm text-subtext dark:text-gray-400">Pehle apna Project select karein.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
            <ThemedSelect
              value={project}
              onChange={setProject}
              options={Object.keys(PM_PROJECT_FORM_ROUTES)}
              placeholder="Project select karein"
              className="w-full"
            />
          </div>

          <button
            type="button"
            onClick={goToForm}
            disabled={!project}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
