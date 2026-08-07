import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import StatCard from "../../../components/StatCard";
import DataTable from "../../../components/DataTable";
import { listProjects } from "../../../api/projects";
import { listPatrolSubmissions } from "../../../api/patrol";
import { ShieldCheck, ListChecks } from "lucide-react";

export default function PatrolReportsPage() {
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, s] = await Promise.all([
        listProjects({ module: "patrol_checkpoint" }),
        listPatrolSubmissions(),
      ]);
      setProjects(p);
      setSubmissions(s);
      setLoading(false);
    })();
  }, []);

  const rows = useMemo(() => {
    return projects.map((project) => {
      const projectSubs = submissions.filter((s) => s.projectName === project.name);
      const totalCoverage = projectSubs.reduce(
        (sum, s) => sum + (s.checkpointCount ? s.checkpointsCovered / s.checkpointCount : 0),
        0
      );
      const avgCoveragePct = projectSubs.length ? Math.round((totalCoverage / projectSubs.length) * 100) : 0;
      return {
        _id: project._id,
        name: project.name,
        checkpointCount: project.checkpointCount,
        submissionCount: projectSubs.length,
        avgCoveragePct,
      };
    });
  }, [projects, submissions]);

  return (
    <div>
      <PageHeader title="Patrol Reports" subtitle="Checkpoint coverage summary across all patrol sites." />

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mb-5">
        <StatCard label="Total Submissions" value={submissions.length} icon={<ListChecks size={16} />} color="blue" />
        <StatCard label="Active Sites" value={projects.length} icon={<ShieldCheck size={16} />} color="orange" />
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
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${r.avgCoveragePct}%` }} />
                </div>
                <span className="text-xs text-gray-500">{r.avgCoveragePct}%</span>
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
