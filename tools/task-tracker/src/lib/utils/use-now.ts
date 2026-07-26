"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current Date, but only after mount. During SSR and the first
 * client render it returns `null`, so date-derived values (countdown, "today's
 * tasks") don't cause a hydration mismatch. Components should render a neutral
 * placeholder while this is null.
 */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);
  return now;
}
