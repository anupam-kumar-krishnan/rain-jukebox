import Image from "next/image";
import styles from "./RainyBackground.module.css";

export default function RainyBackground() {
  return (
    <div className={styles.scene}>
      <Image
        src="/door-bg.jpg"
        alt="Rainy evening doorway"
        fill
        priority
        sizes="100vw"
        className={styles.bgimg}
      />
    </div>
  );
}
