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

export function useIstClock(intervalMs = 15_000): string {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(formatIst(new Date()));
    const id = setInterval(() => setTime(formatIst(new Date())), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return time ?? "--:--";
}
