import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SessionMap = Map<string, number>;

declare global {
  var __baarishSessions: SessionMap | undefined;
}

const sessions: SessionMap = global.__baarishSessions ?? new Map();
global.__baarishSessions = sessions;

const HEARTBEAT_TIMEOUT_MS = 30_000;

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
  } catch {}

  if (sessionId) {
    sessions.set(sessionId, Date.now());
  }

  return NextResponse.json({ count: pruneAndCount() });
}

export async function GET() {
  return NextResponse.json({ count: pruneAndCount() });
}
