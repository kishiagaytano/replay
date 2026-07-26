import type { Member, Task } from "@/lib/schema/task.schema";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { TaskRow } from "@/components/tasks/TaskRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { STATUS_LIST } from "@/lib/utils/constants";
import { memberWorkload } from "@/lib/utils/metrics";
import { cn } from "@/lib/utils/cn";

/** Per-member summary: assigned, completed, current workload + active list. */
export function MemberCard({
  member,
  tasks,
  now,
  onEdit,
}: {
  member: Member;
  tasks: Task[];
  now: Date | null;
  onEdit?: (member: Member) => void;
}) {
  const load = memberWorkload(tasks, member.id);

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar member={member} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">{member.name}</p>
            <p className="truncate text-xs text-slate-500">{member.role || "No role set"}</p>
          </div>
          {onEdit ? (
            <button
              onClick={() => onEdit(member)}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Edit
            </button>
          ) : null}
        </div>

        {/* Workload stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Assigned" value={load.assigned.length} />
          <Stat label="Active" value={load.active.length} tone={load.active.length > 4 ? "warn" : "default"} />
          <Stat label="Done" value={load.completed.length} tone="good" />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>Completion</span>
            <span className="font-medium tabular-nums">{load.completionPercent}%</span>
          </div>
          <ProgressBar percent={load.completionPercent} label={`${member.name} completion`} />
        </div>

        {/* Per-status mini counts */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_LIST.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
              {s.label} · {load.byStatus[s.id]}
            </span>
          ))}
        </div>

        {/* Active task list */}
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Current workload</p>
          {load.active.length === 0 ? (
            <EmptyState title="No active tasks" hint="All caught up." />
          ) : (
            <ul className="divide-y divide-slate-50">
              {load.active.map((task) => (
                <li key={task.id}>
                  <TaskRow task={task} now={now} showStatus />
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "warn" | "good" }) {
  const toneClass = { default: "text-slate-900", warn: "text-amber-600", good: "text-emerald-600" }[tone];
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <p className={cn("text-lg font-semibold tabular-nums", toneClass)}>{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}
