"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type MouseEvent,
  type ChangeEvent,
} from "react";
import styles from "./MusicPlayer.module.css";
import { tracks } from "@/lib/tracks";

// Minimal shape of the YT iframe API we use — the real API has no
// official types package, so we keep this loose and cast at the edges.
type YTPlayer = {
  cueVideoById: (id: string) => void;
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  destroy: () => void;
};

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (
        elementOrId: string | HTMLElement,
        options: Record<string, unknown>,
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
  }
}

type Props = {
  onPlayStateChange?: (isPlaying: boolean) => void;
};

function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function thumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

const DEFAULT_VOLUME = 80;

export default function MusicPlayer({ onPlayStateChange }: Props) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState({ cur: 0, dur: 0 });
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const playerRef = useRef<YTPlayer | null>(null);
  const apiReadyRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const currentRef = useRef(0);
  const shuffleRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackBarRef = useRef<HTMLDivElement>(null);
  // React owns this wrapper div. The YT Player mounts into a plain child
  // node created imperatively inside it, so React's reconciler never has
  // to remove a DOM node that the YouTube API has already replaced.
  const mountRef = useRef<HTMLDivElement>(null);

  const track = tracks[current];

  // keep a ref in sync so callbacks registered once (onStateChange) can read
  // the latest shuffle setting without being recreated
  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  const getNextIndex = useCallback((i: number, useShuffle: boolean) => {
    if (tracks.length <= 1) return i;
    if (!useShuffle) return (i + 1 + tracks.length) % tracks.length;
    let next = i;
    while (next === i) {
      next = Math.floor(Math.random() * tracks.length);
    }
    return next;
  }, []);

  const loadTrack = useCallback((i: number, autoplay: boolean) => {
    const next = ((i % tracks.length) + tracks.length) % tracks.length;
    currentRef.current = next;
    setCurrent(next);
    setProgress({ cur: 0, dur: 0 });
    const p = playerRef.current;
    if (p && apiReadyRef.current) {
      if (autoplay) p.loadVideoById(tracks[next].id);
      else p.cueVideoById(tracks[next].id);
    } else {
      pendingPlayRef.current = autoplay;
    }
  }, []);

  const goNext = useCallback(
    (autoplay: boolean) => {
      loadTrack(getNextIndex(currentRef.current, shuffleRef.current), autoplay);
    },
    [getNextIndex, loadTrack],
  );

  const startPoll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const cur = p.getCurrentTime();
      const dur = p.getDuration();
      if (dur) setProgress({ cur, dur });
    }, 500);
  }, []);

  useEffect(() => {
    let cancelled = false;

    function createPlayer() {
      if (!window.YT || !mountRef.current || cancelled) return;

      // Plain DOM node, created outside React's render output, for the
      // YT API to take over and eventually replace with an <iframe>.
      const mountEl = document.createElement("div");
      mountRef.current.appendChild(mountEl);

      playerRef.current = new window.YT.Player(mountEl, {
        height: "1",
        width: "1",
        videoId: tracks[0].id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            apiReadyRef.current = true;
            playerRef.current?.cueVideoById(tracks[currentRef.current].id);
            playerRef.current?.setVolume(DEFAULT_VOLUME);
            if (pendingPlayRef.current) {
              playerRef.current?.loadVideoById(tracks[currentRef.current].id);
              pendingPlayRef.current = false;
            }
          },
          onStateChange: (e: { data: number }) => {
            const YT = window.YT;
            if (!YT) return;
            if (e.data === YT.PlayerState.PLAYING) {
              setPlaying(true);
              startPoll();
            } else if (e.data === YT.PlayerState.PAUSED) {
              setPlaying(false);
            } else if (e.data === YT.PlayerState.ENDED) {
              goNext(true);
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      apiReadyRef.current = false;
      try {
        playerRef.current?.destroy();
      } catch {
        // player may already be gone (e.g. API script never finished
        // loading before unmount) — safe to ignore
      }
      playerRef.current = null;
      // Clear anything the YT API left behind so a remount (Strict Mode,
      // fast refresh, etc.) starts from a clean wrapper.
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, [goNext, startPoll]);

  useEffect(() => {
    onPlayStateChange?.(playing);
  }, [playing, onPlayStateChange]);

  function togglePlay() {
    const p = playerRef.current;
    if (!p || !apiReadyRef.current) {
      pendingPlayRef.current = true;
      return;
    }
    if (playing) p.pauseVideo();
    else p.playVideo();
  }

  function seek(e: MouseEvent<HTMLDivElement>) {
    const p = playerRef.current;
    if (!p || !apiReadyRef.current || !trackBarRef.current) return;
    const rect = trackBarRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const dur = p.getDuration();
    if (dur) p.seekTo(dur * pct, true);
  }

  function handleVolumeChange(e: ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setVolume(val);
    const p = playerRef.current;
    if (!p || !apiReadyRef.current) return;
    p.setVolume(val);
    if (val === 0) {
      p.mute();
      setMuted(true);
    } else if (muted) {
      p.unMute();
      setMuted(false);
    }
  }

  function toggleMute() {
    const p = playerRef.current;
    if (!p || !apiReadyRef.current) return;
    if (muted) {
      p.unMute();
      if (volume === 0) {
        setVolume(DEFAULT_VOLUME);
        p.setVolume(DEFAULT_VOLUME);
      }
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  }

  function toggleShuffle() {
    setShuffle((s) => !s);
  }

  const fillPct = progress.dur ? (progress.cur / progress.dur) * 100 : 0;
  const effectiveVolume = muted ? 0 : volume;

  return (
    <div className={styles.player}>
      <div className={styles.prow}>
        <div className={styles.art}>
          {/* Small, external, low-fixed-count thumbnails — a plain <img> avoids
              next/image's remote-domain allowlist config for this demo. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb(track.id)} alt={track.title} />
        </div>

        <div className={styles.meta}>
          <div className={styles.title}>{track.title}</div>
          <div className={styles.artist}>{track.artist}</div>
          <div className={styles.prog}>
            <div className={styles.track} ref={trackBarRef} onClick={seek}>
              <div className={styles.fill} style={{ width: `${fillPct}%` }} />
            </div>
            <div className={styles.times}>
              <span>{fmt(progress.cur)}</span> /{" "}
              <span>{fmt(progress.dur)}</span>
            </div>
          </div>
        </div>

        <div className={styles.ctrls}>
          <button
            className={
              shuffle
                ? `${styles.shuffleBtn} ${styles.active}`
                : styles.shuffleBtn
            }
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            aria-pressed={shuffle}
            title="Shuffle"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 3h5v5" />
              <path d="M4 20L21 3" />
              <path d="M21 16v5h-5" />
              <path d="M15 15l6 6" />
              <path d="M4 4l5 5" />
            </svg>
          </button>

          <button
            onClick={() => loadTrack(current - 1, playing)}
            aria-label="Previous track"
          >
            <svg viewBox="0 0 24 24" fill="#fff">
              <path d="M6 6h2v12H6zM20 6L10 12l10 6z" />
            </svg>
          </button>

          <button
            className={styles.playBtn}
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" fill="#0b1420">
                <rect x="5" y="4" width="4" height="16" />
                <rect x="15" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="#0b1420">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>

          <button onClick={() => goNext(playing)} aria-label="Next track">
            <svg viewBox="0 0 24 24" fill="#fff">
              <path d="M16 6h2v12h-2zM4 6l10 6L4 18z" />
            </svg>
          </button>
        </div>

        <div className={styles.volWrap}>
          <button
            className={styles.volBtn}
            onClick={toggleMute}
            aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
            title={muted || volume === 0 ? "Unmute" : "Mute"}
          >
            {muted || volume === 0 ? (
              <svg viewBox="0 0 24 24" fill="#fff">
                <path d="M16.5 12L21 7.5 19.5 6 15 10.5 10.5 6 9 7.5l4.5 4.5L9 16.5 10.5 18l4.5-4.5 4.5 4.5 1.5-1.5z" />
                <path d="M3 9v6h4l5 5V4L7 9H3z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="#fff">
                <path d="M3 9v6h4l5 5V4L7 9H3z" />
                <path
                  d="M16 8a5 5 0 010 8"
                  stroke="#fff"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M18.5 5.5a9 9 0 010 13"
                  stroke="#fff"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={effectiveVolume}
            onChange={handleVolumeChange}
            className={styles.volSlider}
            aria-label="Volume"
          />
        </div>
      </div>

      <div
        ref={mountRef}
        style={{
          position: "fixed",
          width: 1,
          height: 1,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
