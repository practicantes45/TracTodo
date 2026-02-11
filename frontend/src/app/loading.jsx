import Image from "next/image";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div
      className={styles.loadingScreen}
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      <div className={styles.logoWrap}>
        <Image
          src="/logo-tractodo.png"
          alt="Tractodo"
          width={220}
          height={220}
          priority
        />
      </div>
      <div className={styles.loadingText}>Cargando...</div>
      <div className={styles.dots} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
