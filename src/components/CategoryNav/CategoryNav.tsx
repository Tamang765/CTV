import { CATEGORIES, CATEGORY_META } from "../../constants/categories";
import { focus } from "../../utils/navigation";
import { FocusButton, FocusRegion } from "../Focusable/Focusable";
import { Icon } from "../Icon/Icon";
import styles from "./CategoryNav.module.css";
import type { Category } from "../../types/common";

export function CategoryNav({
  category,
  invalidCategory,
  showHome,
  onHome,
  onChoose,
}: {
  category: Category | null;
  invalidCategory: boolean;
  showHome: boolean;
  onHome: () => void;
  onChoose: (category: Category) => void;
}) {
  const rightArrow = (direction: string) => {
    if (direction === "right") {
      focus(category ? "search" : "home-hero");
      return false;
    }
    return true;
  };
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>UKTV</div>
      </div>
      <div className={styles.navLabel}>Browse All Categories</div>
      <nav aria-label="Categories">
        <FocusRegion
          id="categories"
          preferred={category ? `nav-${category}` : "nav-home"}
          className={styles.navigation}
        >
          <FocusButton
            id="nav-home"
            current={showHome}
            className={`${styles.navItem} ${showHome ? styles.navActive : ""}`}
            onPress={onHome}
            onArrow={rightArrow}
          >
            <Icon name="grid" size={26} />
            <span>Home</span>
            <span className={styles.navIndicator}>›</span>
          </FocusButton>
          {CATEGORIES.map((item) => {
            const active = category === item && !invalidCategory;
            return (
              <FocusButton
                key={item}
                id={`nav-${item}`}
                current={active}
                className={`${styles.navItem} ${active ? styles.navActive : ""}`}
                onPress={() => onChoose(item)}
                onArrow={rightArrow}
              >
                <Icon name={CATEGORY_META[item].icon} size={26} />
                <span>{CATEGORY_META[item].label}</span>
                <span className={styles.navIndicator}>›</span>
              </FocusButton>
            );
          })}
        </FocusRegion>
      </nav>
    </aside>
  );
}