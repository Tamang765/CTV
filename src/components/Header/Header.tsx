import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.topbar}>
      <span></span>
      <span className={styles.archiveLabel}>
        <i /> POWERED BY UKTV
      </span>
    </header>
  );
}