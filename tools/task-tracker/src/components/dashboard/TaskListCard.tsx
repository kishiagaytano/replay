import type { Member, Task } from "@/lib/schema/task.schema";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskRow } from "@/components/tasks/TaskRow";

/** Card that renders a titled list of tasks, or an empty state. */
export function TaskListCard({
  title,
  subtitle,
  action,
  tasks,
  getMember,
  now,
  emptyTitle,
  emptyHint,
  showStatus = false,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  tasks: Task[];
  getMember: (id: string) => Member | undefined;
  now: Date | null;
  emptyTitle: string;
  emptyHint?: string;
  showStatus?: boolean;
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={action ?? <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{tasks.length}</span>}
      />
      <CardBody className="p-2">
        {tasks.length === 0 ? (
          <div className="p-2">
            <EmptyState title={emptyTitle} hint={emptyHint} />
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} assignee={getMember(task.assigneeId)} now={now} showStatus={showStatus} />
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
