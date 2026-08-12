"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./RotationSection.module.css";

type Rotation = { name: string; href: string };

const ROTATIONS_LEFT: Rotation[] = [
  { name: "Monsoon Mood", href: "#" },
  { name: "Purani Baarish", href: "#" },
  { name: "All songs", href: "#" },
];

const ROTATIONS_RIGHT: Rotation[] = [
  { name: "Chai Pe Baarish", href: "#" },
  { name: "Bheegi Shaam", href: "#" },
];

// Small scroll-reveal hook — fades the panel in once, no scroll-jacking,
// respects prefers-reduced-motion via the CSS (see .reveal in the module).
function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, inView };
}

// Signature element: a thin row of rain streaks that "falls" once when the
// section enters view — a small echo of the hero's rain, not a repeat of it.
function RainDivider({ active }: { active: boolean }) {
  const streaks = [0, 1, 2, 3, 4, 5, 6];
  return (
    <div className={styles.rainDivider} aria-hidden="true">
      {streaks.map((i) => (
        <span
          key={i}
          className={
            active ? `${styles.streak} ${styles.streakActive}` : styles.streak
          }
          style={{
            animationDelay: `${i * 70}ms`,
            left: `${(i / (streaks.length - 1)) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

export default function RotationsSection() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className={styles.section}>
      {/* reuses the hero's background image via CSS var --bg-image set on this
          element's ancestor (or hardcode the same url() in the module) */}
      <div className={styles.bg} />
      <div className={styles.overlay} />

      <RainDivider active={inView} />

      <div
        ref={ref}
        className={inView ? `${styles.panel} ${styles.panelIn}` : styles.panel}
      >
        <div className={styles.brand}>
          <div className={styles.mark}>
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M12 3c3 4 6 7.2 6 10.5A6 6 0 016 13.5C6 10.2 9 7 12 3z" />
            </svg>
          </div>
          <div>
            <div className={styles.wordmark}>बारिश</div>
            <div className={styles.eyebrow}>MONSOON RADIO</div>
          </div>
        </div>

        <p className={styles.description}>
          Purani Hindi film gaane, jo sirf barsaat ke mausam mein bajte hain —
          khidki ke shishe pe paani, aur speaker se seedha 90s ka mood. Kai
          jagah &ldquo;Barsaat&rdquo; bhi likha milega, par yahan hamesha
          Baarish hi bajta hai.
        </p>

        <div className={styles.rotationsBlock}>
          <div className={styles.rotationsLabel}>ROTATIONS</div>
          <div className={styles.rotationsGrid}>
            <ul className={styles.rotationsList}>
              {ROTATIONS_LEFT.map((r) => (
                <li key={r.name}>
                  <a href={r.href}>{r.name}</a>
                </li>
              ))}
            </ul>
            <ul className={styles.rotationsList}>
              {ROTATIONS_RIGHT.map((r) => (
                <li key={r.name}>
                  <a href={r.href}>{r.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.badges}>
          <a className={styles.badge} href="#" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#1db954">
              <circle cx="12" cy="12" r="12" fill="#1db954" />
              <path
                d="M6.5 15.5c3-1 6.6-1 9.5.6M6.8 12.3c3.4-1.1 7.7-.9 10.7 1M7 9c4-1.2 9-1 12.3 1.2"
                stroke="#0b1420"
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            Spotify
          </a>
          <a className={styles.badge} href="#" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#ff0033">
              <circle cx="12" cy="12" r="12" fill="#ff0033" />
              <polygon points="10,8 16,12 10,16" fill="#0b1420" />
            </svg>
            YT Music
          </a>
        </div>

        <p className={styles.fine}>
          Gaane YouTube ke embedded player se bajte hain. Yahan kuch bhi host
          nahi hota — rights hamesha labels, composers aur performers ke paas
          rehte hain. <br />
          <br />
          If you hold rights to anything here and want it taken off, email
          anupamk.krishnan@gmail.com and it comes down.
        </p>

        <div className={styles.footer}>© 2026 baarish.in</div>
      </div>
    </section>
  );
}
