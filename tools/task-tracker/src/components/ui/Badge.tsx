import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * A pill label. `className` carries the full color classes from the *_META maps
 * (already static, JIT-safe).
 */
export function Badge({
  children,
  className,
  dotClassName,
}: {
  children: ReactNode;
  className?: string;
  dotClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        className,
      )}
    >
      {dotClassName ? <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} /> : null}
      {children}
    </span>
  );
}
