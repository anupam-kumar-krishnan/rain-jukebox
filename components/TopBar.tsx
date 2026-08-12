"use client";

import styles from "./TopBar.module.css";
import { useIstClock } from "@/hooks/useIstClock";
import { usePresenceCount } from "@/hooks/usePresenceCount";

export default function TopBar() {
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
          <svg viewBox="0 0 24 24" fill="#fff" width="16" height="16">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.4a.7.7 0 01-1 .2c-2.7-1.6-6-2-9.9-1.1a.7.7 0 01-.3-1.4c4.3-1 8-.5 11 1.3.3.2.4.7.2 1zm1.2-2.7a.9.9 0 01-1.2.3c-3.1-1.9-7.8-2.4-11.4-1.3a.9.9 0 01-.5-1.7c4.2-1.3 9.3-.7 12.9 1.5.4.3.5.9.2 1.2zm.1-2.8C14.4 8.8 8.9 8.6 5.6 9.6a1 1 0 11-.6-2c3.8-1.1 10-.9 13.9 1.5a1 1 0 01-1 1.8z" />
          </svg>
          Spotify ↗
        </a>
        <a
          href="https://music.youtube.com/search?q=rain%20songs%20bollywood"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="#fff" width="16" height="16">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" fill="#0b1420" />
            <path d="M10 9l5 3-5 3z" fill="#fff" />
          </svg>
          YT Music ↗
        </a>
      </div>
    </div>
  );
}
