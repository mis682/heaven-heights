import React, { useEffect, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import DataTable from "../../../components/DataTable";
import { getPatrolSummary } from "../../../api/patrol";
import { ShieldCheck, ListChecks } from "lucide-react";

// Was previously computed client-side from every raw submission (photos
// array and all) pulled out of Atlas — this page is an overview
// coordinators reload many times a day, so that meant re-transferring the
// whole PatrolSubmission collection just to show a coverage percentage.
// getPatrolSummary() does the same math server-side via an aggregation and
// only ever returns a handful of small per-project rows.
export default function PatrolReportsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatrolSummary().then((r) => {
      setRows(r);
      setLoading(false);
    });
  }, []);

  const totalSubmissions = rows.reduce((sum, r) => sum + r.submissionCount, 0);

  return (
    <div>
      <PageHeader title="Patrol Reports" subtitle="Checkpoint coverage summary across all patrol sites." />

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mb-5">
        <StatCard label="Total Submissions" value={totalSubmissions} icon={<ListChecks size={16} />} color="blue" />
        <StatCard label="Active Sites" value={rows.length} icon={<ShieldCheck size={16} />} color="orange" />
      </div>

      <DataTable
        columns={[
          { key: "name", header: "Project" },
          { key: "checkpointCount", header: "Total Checkpoints" },
          { key: "submissionCount", header: "Submissions" },
          {
            key: "avgCoveragePct",
            header: "Avg. Coverage",
            render: (r) => (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${r.avgCoveragePct}%` }} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{r.avgCoveragePct}%</span>
              </div>
            ),
          },
        ]}
        rows={loading ? [] : rows}
        emptyMessage={loading ? "Loading..." : "No records found"}
      />
    </div>
  );
}
