import type { Member } from "@/lib/schema/task.schema";
import { cn } from "@/lib/utils/cn";

export function Avatar({ member, size = "md" }: { member: Member; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-inset",
        dims,
        member.color,
      )}
      title={member.name}
      aria-hidden
    >
      {member.initials}
    </span>
  );
}

export function AvatarLabel({ member, size = "md" }: { member: Member; size?: "sm" | "md" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar member={member} size={size} />
      <span className="text-sm text-slate-700">{member.name}</span>
    </span>
  );
}
