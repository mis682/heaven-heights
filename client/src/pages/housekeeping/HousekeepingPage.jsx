import React, { useEffect, useMemo, useState } from "react";
import { Plus, Users, Clock, CheckCircle2, XCircle, LayoutGrid, List as ListIcon } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import FilterBar, { Select } from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import StatusPill from "../../components/StatusPill";
import Modal from "../../components/Modal";
import CameraCapture from "../../components/CameraCapture";
import { listEmployees } from "../../api/employees";
import {
  getHousekeepingStats,
  listHousekeepingTasks,
  createHousekeepingTask,
  updateHousekeepingTask,
} from "../../api/housekeeping";

const TASK_TYPES = ["Sweeping", "Mopping", "Deep Clean", "Dusting", "Window Cleaning", "Waste Disposal"];
const STATUSES = ["Scheduled", "Pending", "Completed", "Skipped", "Overdue"];

export default function HousekeepingPage() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [blockFilter, setBlockFilter] = useState("");
  const [view, setView] = useState("list"); // list | block
  const [showCreate, setShowCreate] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);

  const load = async () => {
    setLoading(true);
    const [s, t, e] = await Promise.all([
      getHousekeepingStats(),
      listHousekeepingTasks(),
      listEmployees({ department: "Housekeeping" }),
    ]);
    setStats(s);
    setTasks(t);
    setStaff(e);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const blocks = useMemo(() => [...new Set(tasks.map((t) => t.block))].filter(Boolean), [tasks]);

  const filtered = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (blockFilter && t.block !== blockFilter) return false;
    if (search && !`${t.areaName} ${t.taskType}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      map[t.block] = map[t.block] || [];
      map[t.block].push(t);
    });
    return map;
  }, [filtered]);

  return (
    <div>
      <PageHeader
        title="Housekeeping"
        subtitle="Assign, track and verify housekeeping tasks across the property."
        primaryAction={{ label: "New Task", icon: <Plus size={16} />, onClick: () => setShowCreate(true) }}
        secondaryActions={[
          {
            label: view === "list" ? "Block View" : "List View",
            icon: view === "list" ? <LayoutGrid size={16} /> : <ListIcon size={16} />,
            onClick: () => setView(view === "list" ? "block" : "list"),
          },
        ]}
      />

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          <StatCard label="All Tasks" value={stats.all} icon={<Users size={16} />} color="gray" active={!statusFilter} onClick={() => setStatusFilter("")} />
          <StatCard label="Today's Tasks" value={stats.today} icon={<Clock size={16} />} color="blue" />
          <StatCard label="Scheduled" value={stats.scheduled} icon={<Clock size={16} />} color="blue" active={statusFilter === "Scheduled"} onClick={() => setStatusFilter("Scheduled")} />
          <StatCard label="Pending / Overdue" value={stats.pending} icon={<XCircle size={16} />} color="amber" active={statusFilter === "Pending"} onClick={() => setStatusFilter("Pending")} />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 size={16} />} color="green" active={statusFilter === "Completed"} onClick={() => setStatusFilter("Completed")} />
          <StatCard label="Skipped" value={stats.skipped} icon={<XCircle size={16} />} color="red" active={statusFilter === "Skipped"} onClick={() => setStatusFilter("Skipped")} />
        </div>
      )}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search area or task type..."
        filters={
          <>
            <Select value={blockFilter} onChange={setBlockFilter} options={blocks} placeholder="All blocks" />
            <Select value={statusFilter} onChange={setStatusFilter} options={STATUSES} placeholder="All statuses" />
          </>
        }
      />

      {view === "list" ? (
        <DataTable
          columns={[
            { key: "createdAt", header: "Created At", render: (r) => new Date(r.createdAt).toLocaleString() },
            { key: "areaName", header: "Area / Room" },
            { key: "taskType", header: "Task Type" },
            { key: "assignedStaff", header: "Assigned Staff", render: (r) => r.assignedStaff?.name || "—" },
            { key: "block", header: "Block / Floor", render: (r) => `${r.block}${r.floor ? " / " + r.floor : ""}` },
            { key: "frequency", header: "Frequency" },
            { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
            { key: "verifiedBy", header: "Verified By", render: (r) => r.verifiedBy || "—" },
            {
              key: "actions",
              header: "Actions",
              render: (r) => (
                <div className="flex gap-2">
                  {r.status !== "Completed" && (
                    <button onClick={() => setCompletingTask(r)} className="text-xs font-semibold text-primary hover:underline">
                      Mark Status
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          rows={loading ? [] : filtered}
          emptyMessage={loading ? "Loading..." : "No records found"}
          emptyHint={loading ? "" : "Try adjusting filters or create a new task"}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(grouped).length === 0 && (
            <p className="text-sm text-subtext col-span-full text-center py-10">No records found</p>
          )}
          {Object.entries(grouped).map(([block, blockTasks]) => (
            <div key={block} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="font-semibold text-heading mb-3">{block}</p>
              <div className="space-y-2">
                {blockTasks.map((t) => (
                  <div key={t._id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t.areaName} · {t.taskType}</span>
                    <StatusPill status={t.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTaskModal
          staff={staff}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {completingTask && (
        <CompleteTaskModal
          task={completingTask}
          onClose={() => setCompletingTask(null)}
          onDone={() => {
            setCompletingTask(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function CreateTaskModal({ staff, onClose, onCreated }) {
  const [form, setForm] = useState({
    areaName: "",
    taskType: TASK_TYPES[0],
    assignedStaff: staff[0]?._id || "",
    block: "",
    floor: "",
    frequency: "Daily",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await createHousekeepingTask(form);
    setSaving(false);
    onCreated();
  };

  return (
    <Modal title="New Housekeeping Task" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Area / Room Name">
          <input required value={form.areaName} onChange={(e) => setForm({ ...form, areaName: e.target.value })} className="input" />
        </Field>
        <Field label="Task Type">
          <select value={form.taskType} onChange={(e) => setForm({ ...form, taskType: e.target.value })} className="input">
            {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Assigned Staff">
          <select required value={form.assignedStaff} onChange={(e) => setForm({ ...form, assignedStaff: e.target.value })} className="input">
            <option value="">Select staff</option>
            {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Block">
            <input required value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} className="input" />
          </Field>
          <Field label="Floor">
            <input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="input" />
          </Field>
        </div>
        <Field label="Frequency">
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="input">
            <option>Daily</option>
            <option>Weekly</option>
          </select>
        </Field>
        <button disabled={saving} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 mt-2">
          {saving ? "Creating..." : "Create Task"}
        </button>
      </form>
    </Modal>
  );
}

function CompleteTaskModal({ task, onClose, onDone }) {
  const [status, setStatus] = useState("Completed");
  const [photo, setPhoto] = useState(null);
  const [verifiedBy, setVerifiedBy] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateHousekeepingTask(task._id, { status, verifiedBy }, photo?.file);
    setSaving(false);
    onDone();
  };

  return (
    <Modal title={`Update: ${task.areaName}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            <option>Completed</option>
            <option>Skipped</option>
            <option>Pending</option>
          </select>
        </Field>
        <Field label="Verified By">
          <input value={verifiedBy} onChange={(e) => setVerifiedBy(e.target.value)} className="input" placeholder="Supervisor name" />
        </Field>
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">Completion Photo (optional)</p>
          <CameraCapture label="Capture proof photo" onCapture={setPhoto} />
        </div>
        <button disabled={saving} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 mt-2">
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
