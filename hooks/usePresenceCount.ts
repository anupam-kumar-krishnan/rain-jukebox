"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "baarish_session_id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Returns the number of clients currently connected to the app, based on a
 * real heartbeat against /api/presence (see that route's caveats about
 * multi-instance deployments). Returns null until the first response.
 */
export function usePresenceCount(intervalMs = 10_000): number | null {
  const [count, setCount] = useState<number | null>(null);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = getSessionId();
    let cancelled = false;

    async function heartbeat() {
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionIdRef.current }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data.count === "number") setCount(data.count);
      } catch {
        // transient network error — keep last known count
      }
    }

    heartbeat();
    const id = setInterval(heartbeat, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return count;
}
