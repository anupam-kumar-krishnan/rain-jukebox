"use client";

import RainyBackground from "@/components/RainyBackground";
import TopBar from "@/components/TopBar";
import HeroTitle from "@/components/HeroTitle";
import MusicPlayer from "@/components/MusicPlayer";
import { useRainAmbience } from "@/hooks/useRainAmbience";
import RotationsSection from "@/components/RotationSection";
import styles from "./page.module.css";

export default function Home() {
  const { setSongPlaying, rainEnabled, toggleRain } = useRainAmbience();

  return (
    <main>
      <div className={styles.hero}>
        <RainyBackground />
        <TopBar rainEnabled={rainEnabled} onToggleRain={toggleRain} />
        <HeroTitle />
      </div>
      <RotationsSection />
      <MusicPlayer onPlayStateChange={setSongPlaying} />
    </main>
  );
}
