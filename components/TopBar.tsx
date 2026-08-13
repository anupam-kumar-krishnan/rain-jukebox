"use client";

import styles from "./TopBar.module.css";
import { useIstClock } from "@/hooks/useIstClock";
import { usePresenceCount } from "@/hooks/usePresenceCount";

type TopBarProps = {
  rainEnabled: boolean;
  onToggleRain: () => void;
};

export default function TopBar({ rainEnabled, onToggleRain }: TopBarProps) {
  const time = useIstClock();
  const online = usePresenceCount();

  return (
    <div className={styles.topbar}>
      <span className={styles.clock}>{time} IST</span>

      <span className={styles.online}>
        <span className={styles.dot} />
        {online === null ? "—" : online} online
      </span>

      <div className={styles.links}>
        <a
          href="https://open.spotify.com/search/rain%20songs%20bollywood"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="#2af656" width="16" height="16">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.4a.7.7 0 01-1 .2c-2.7-1.6-6-2-9.9-1.1a.7.7 0 01-.3-1.4c4.3-1 8-.5 11 1.3.3.2.4.7.2 1zm1.2-2.7a.9.9 0 01-1.2.3c-3.1-1.9-7.8-2.4-11.4-1.3a.9.9 0 01-.5-1.7c4.2-1.3 9.3-.7 12.9 1.5.4.3.5.9.2 1.2zm.1-2.8C14.4 8.8 8.9 8.6 5.6 9.6a1 1 0 11-.6-2c3.8-1.1 10-.9 13.9 1.5a1 1 0 01-1 1.8z" />
          </svg>
          Spotify ↗
        </a>
        <a
          href="https://music.youtube.com/search?q=rain%20songs%20bollywood"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="#FF0033" width="16" height="16">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" fill="#fff" />
            <path d="M10 9l5 3-5 3z" fill="#FF0033" />
          </svg>
          YT Music ↗
        </a>

        <button
          type="button"
          className={styles.rainToggle}
          onClick={onToggleRain}
          aria-pressed={rainEnabled}
          aria-label={
            rainEnabled ? "Turn off rain sound" : "Turn on rain sound"
          }
          title={rainEnabled ? "Rain sound: on" : "Rain sound: off"}
        >
          {rainEnabled ? (
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="#fff"
              strokeWidth="1.8"
            >
              <path d="M6 14a5 5 0 019.9-1H16a3.5 3.5 0 010 7H8a4 4 0 01-2-7.4z" />
              <line x1="8" y1="19" x2="7" y2="22" strokeLinecap="round" />
              <line x1="12" y1="19" x2="11" y2="22" strokeLinecap="round" />
              <line x1="16" y1="19" x2="15" y2="22" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="#fff"
              strokeWidth="1.8"
            >
              <path d="M6 14a5 5 0 019.9-1H16a3.5 3.5 0 010 7H8a4 4 0 01-2-7.4z" />
              <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" />
            </svg>
          )}
          Rain Sound
        </button>
      </div>
    </div>
  );
}
