import { NextRequest, NextResponse } from "next/server";

// This route tracks *real* concurrently-connected clients via a heartbeat:
// each browser tab POSTs its sessionId every ~10s, and we count sessions
// seen within the last HEARTBEAT_TIMEOUT_MS.
//
// IMPORTANT CAVEAT: this uses an in-memory Map, which lives inside a single
// server process. That's accurate for `next dev`, `next start` on one
// machine, or a single long-running container. It will NOT be accurate if
// deployed across multiple serverless instances/regions (e.g. Vercel can
// spin up several isolated instances), because each instance would keep
// its own separate count. For a production deployment that's truly global,
// swap this Map for a shared store — Redis/Upstash, Vercel KV, or a
// presence-native service like Pusher Channels / Ably / Supabase Realtime.
//
// Forcing the Node.js runtime (not edge) so this module-level state
// persists across requests within the same instance.
export const runtime = "nodejs";

type SessionMap = Map<string, number>; // sessionId -> lastSeen (ms)

declare global {
  // eslint-disable-next-line no-var
  var __baarishSessions: SessionMap | undefined;
}

const sessions: SessionMap = global.__baarishSessions ?? new Map();
global.__baarishSessions = sessions;

const HEARTBEAT_TIMEOUT_MS = 30_000; // drop a session if no heartbeat in 30s

function pruneAndCount(): number {
  const now = Date.now();
  for (const [id, lastSeen] of sessions) {
    if (now - lastSeen > HEARTBEAT_TIMEOUT_MS) sessions.delete(id);
  }
  return sessions.size;
}

export async function POST(req: NextRequest) {
  let sessionId: string | undefined;
  try {
    const body = await req.json();
    sessionId = body?.sessionId;
  } catch {
    // ignore malformed body
  }

  if (sessionId) {
    sessions.set(sessionId, Date.now());
  }

  return NextResponse.json({ count: pruneAndCount() });
}

export async function GET() {
  return NextResponse.json({ count: pruneAndCount() });
}
