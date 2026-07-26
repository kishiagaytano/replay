import type { Task } from "@/lib/schema/task.schema";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_META, PRIORITY_META, STATUS_META } from "@/lib/utils/constants";

export function CategoryBadge({ category }: { category: Task["category"] }) {
  const meta = CATEGORY_META[category];
  return <Badge className={meta.badge}>{meta.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const meta = PRIORITY_META[priority];
  return <Badge className={meta.badge}>{meta.label}</Badge>;
}

export function StatusBadge({ status }: { status: Task["status"] }) {
  const meta = STATUS_META[status];
  return (
    <Badge className={meta.badge} dotClassName={meta.dot}>
      {meta.label}
    </Badge>
  );
}
