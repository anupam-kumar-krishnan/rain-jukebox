# Baarish — Next.js

A rainy-evening music player, converted from a static HTML page into a
Next.js 15 (App Router) project.

## Structure

```
app/
  layout.tsx          Root layout, Google Fonts (Yatra One, Inter, JetBrains Mono)
  globals.css          Base reset
  page.tsx              Composes the page
  api/presence/route.ts Presence heartbeat API (see caveat below)
components/
  RainyBackground.tsx   Background image + readability gradient
  TopBar.tsx            Clock, live online count, streaming links
  HeroTitle.tsx          "बारिश" title
  MusicPlayer.tsx        YouTube-iframe-API-backed player, glass pill UI
hooks/
  useIstClock.ts         Clock always shown in Indian Standard Time
  usePresenceCount.ts     Polls /api/presence for a live "online" count
  useRainAmbience.ts     Web Audio API ambient rain loop
lib/
  tracks.ts               Playlist data
public/
  door-bg.jpg              Background artwork
```

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## About the two things you asked to be "accurate"

**Time (IST)** — `useIstClock` uses
`Intl.DateTimeFormat(..., { timeZone: "Asia/Kolkata" })`, which always
renders correct Indian Standard Time no matter what timezone the visitor's
device is set to. This is the one that's fully solved.

**Online count** — this is now a *real* count, not a random number: each
open tab heartbeats its session id to `/api/presence` every ~10s, and the
server counts sessions seen in the last 30s. Please read the caveat at the
top of `app/api/presence/route.ts`: this uses an in-memory `Map`, so it's
accurate for `next dev`/`next start` on a single machine, but **not**
accurate if you deploy to a platform that runs multiple serverless
instances (e.g. Vercel can spin up several isolated instances across
regions) — each instance would keep its own separate count, so the number
shown could undercount real visitors.

For a production deployment with a truly global accurate count, swap the
in-memory `Map` in that route for a shared store, e.g.:
- Redis (Upstash) or Vercel KV — simplest drop-in swap, same heartbeat logic
- Pusher Channels / Ably / Supabase Realtime — presence-native services
  built exactly for "who's online right now"

I left the current implementation working and honest about its scope
rather than quietly faking a bigger number.
