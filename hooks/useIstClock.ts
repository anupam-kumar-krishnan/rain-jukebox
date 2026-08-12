"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata", // always IST, independent of the viewer's device timezone
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatIst(date: Date): string {
  return formatter.format(date).toUpperCase();
}

/**
 * Returns the current time formatted in Indian Standard Time (UTC+5:30),
 * regardless of the visitor's own timezone or locale settings.
 */
export function useIstClock(intervalMs = 15_000): string {
  // Start with null on the server so SSR and the first client render match
  // (server and browser clocks can differ by a second, which would cause a
  // hydration mismatch); fill in the real value after mount.
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(formatIst(new Date()));
    const id = setInterval(() => setTime(formatIst(new Date())), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return time ?? "--:--";
}
