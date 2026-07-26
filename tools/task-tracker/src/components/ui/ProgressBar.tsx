import { cn } from "@/lib/utils/cn";

export function ProgressBar({
  percent,
  className,
  barClassName,
  label,
}: {
  percent: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn("h-full rounded-full bg-accent transition-all duration-500", barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
