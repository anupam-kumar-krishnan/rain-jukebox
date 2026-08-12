"use client";

import { useCallback, useEffect, useRef } from "react";

const RAIN_TARGET_VOLUME = 0.22;

/**
 * Synthesizes a soft ambient rain loop with the Web Audio API (filtered
 * noise — no external audio file to fetch or break). It fades in whenever
 * no song is playing, and fades out the moment a track starts.
 *
 * Browsers block audio playback until a user gesture, so the ambience
 * starts on the visitor's first click anywhere on the page.
 */
export function useRainAmbience() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  const songPlayingRef = useRef(false);

  const setVolume = useCallback((target: number, fadeSeconds = 1.5) => {
    const ctx = audioCtxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(target, now + fadeSeconds);
  }, []);

  const init = useCallback(() => {
    if (audioCtxRef.current) return;
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    const duration = 2; // seconds, looped
    const bufferSize = duration * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 2000;
    bandpass.Q.value = 0.5;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 4200;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gainRef.current = gain;

    source.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ctx.destination);

    source.start(0);
  }, []);

  const start = useCallback(() => {
    init();
    const ctx = audioCtxRef.current;
    if (ctx?.state === "suspended") ctx.resume();
    startedRef.current = true;
    if (!songPlayingRef.current) setVolume(RAIN_TARGET_VOLUME);
  }, [init, setVolume]);

  useEffect(() => {
    const handler = () => start();
    document.addEventListener("click", handler, { once: true });
    return () => document.removeEventListener("click", handler);
  }, [start]);

  /** Call with true when a song starts playing, false when it pauses/stops. */
  const setSongPlaying = useCallback(
    (isPlaying: boolean) => {
      songPlayingRef.current = isPlaying;
      if (!startedRef.current) return;
      setVolume(isPlaying ? 0 : RAIN_TARGET_VOLUME);
    },
    [setVolume]
  );

  return { setSongPlaying };
}
