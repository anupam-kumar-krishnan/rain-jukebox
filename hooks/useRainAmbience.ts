"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const RAIN_TARGET_VOLUME = 0.22;

export function useRainAmbience() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  const songPlayingRef = useRef(false);
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(true);

  const setVolume = useCallback((target: number, fadeSeconds = 1.5) => {
    const ctx = audioCtxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(target, now + fadeSeconds);
  }, []);

  const applyVolume = useCallback(() => {
    if (!startedRef.current) return;
    const target =
      enabledRef.current && !songPlayingRef.current ? RAIN_TARGET_VOLUME : 0;
    setVolume(target);
  }, [setVolume]);

  const init = useCallback(() => {
    if (audioCtxRef.current) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    const duration = 2;
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
    applyVolume();
  }, [init, applyVolume]);

  useEffect(() => {
    const handler = () => start();
    document.addEventListener("click", handler, { once: true });
    return () => document.removeEventListener("click", handler);
  }, [start]);

  /** Call with true when a song starts playing, false when it pauses/stops. */
  const setSongPlaying = useCallback(
    (isPlaying: boolean) => {
      songPlayingRef.current = isPlaying;
      applyVolume();
    },
    [applyVolume],
  );

  const toggleRain = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      enabledRef.current = next;
      applyVolume();
      return next;
    });
  }, [applyVolume]);

  return { setSongPlaying, rainEnabled: enabled, toggleRain };
}
