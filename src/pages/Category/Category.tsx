import { Button } from "../../components/Button/Button";
import { FocusRegion } from "../../components/Focusable/Focusable";
import { CATEGORY_META } from "../../constants/categories";
import type { Category as CategoryType } from "../../types/common";
import styles from "./Category.module.css";

export function Category({
  category,
  onBack,
}: {
  category: CategoryType;
  onBack: () => void;
}) {
  const meta = CATEGORY_META[category];
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>Explore <em>{meta.label.toLowerCase()}.</em></h1>
          <p>Discover records from across the archive.</p>
        </div>
      </section>
      <FocusRegion id="content" className={styles.content} preferred="category-home">
        <h2>{meta.label}</h2>
        <Button id="category-home" variant="primary" onPress={onBack}>Return home</Button>
      </FocusRegion>
    </>
  );
}
