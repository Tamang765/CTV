import { useEffect, useState } from "preact/hooks";
import { CategoryNav } from "../components/CategoryNav/CategoryNav";
import { Header } from "../components/Header/Header";
import { useBackNavigation } from "../hooks/useBackNavigation";
import { useStageScale } from "../hooks/useStageScale";
import { Category } from "../pages/Category/Category";
import { Home } from "../pages/Home/Home";
import type { Category as CategoryType } from "../types/common";
import { focus } from "../utils/navigation";
import styles from "./App.module.css";

export function App() {
  const [category, setCategory] = useState<CategoryType | null>(null);
  const scale = useStageScale();
  const goHome = () => setCategory(null);
  useBackNavigation(goHome, category !== null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => focus(category ? `nav-${category}` : "nav-home"));
    return () => cancelAnimationFrame(frame);
  }, [category]);

  return (
    <div className={styles.viewport}>
      <div className={styles.stage} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div className={styles.application}>
          <CategoryNav
            category={category}
            invalidCategory={false}
            showHome={category === null}
            onHome={goHome}
            onChoose={setCategory}
          />
          <main className={styles.main}>
            <Header />
            {category === null ? (
              <Home
                onOpenCategory={setCategory}
                onOpenEntity={(entity) => setCategory(entity.category)}
              />
            ) : (
              <Category category={category} onBack={goHome} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
