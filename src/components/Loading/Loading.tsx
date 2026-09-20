import ui from "../../styles/ui.module.css";
import styles from "./Loading.module.css";

export function Loading() {
  return (
    <div className={ui.grid} aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div />
      <span />
      <span />
    </div>
  );
}

export function SkeletonRow({ count }: { count: number }) {
  return (
    <div className={styles.skeletonRow} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
