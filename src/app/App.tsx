import { useEffect, useState } from "preact/hooks";
import { CategoryNav } from "../components/CategoryNav/CategoryNav";
import { Header } from "../components/Header/Header";
import { useSearch } from "../features/search/hooks/useSearch";
import { useBackNavigation } from "../hooks/useBackNavigation";
import { useFocusRestore } from "../hooks/useFocusRestore";
import { useStageScale } from "../hooks/useStageScale";
import { Category } from "../pages/Category/Category";
import { Home } from "../pages/Home/Home";
import { Search } from "../pages/Search/Search";
import type { Category as CategoryType } from "../types/common";
import { focus } from "../utils/navigation";
import styles from "./App.module.css";

export function App() {
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { state, retry, loadMore, retryMore } = useSearch(category, query);
  const { restoreFocus } = useFocusRestore("search");
  const scale = useStageScale();
  const goHome = () => {
    setCategory(null);
    setQuery("");
  };
  useBackNavigation(goHome, category !== null && !searchOpen);
  useEffect(() => {
    const frame = requestAnimationFrame(() => focus(category ? `nav-${category}` : "nav-home"));
    return () => cancelAnimationFrame(frame);
  }, [category]);

  return (
    <div className={styles.viewport}>
      <div className={styles.stage} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div className={styles.application} inert={searchOpen} aria-hidden={searchOpen || undefined}>
          <CategoryNav category={category} invalidCategory={false} showHome={category === null} onHome={goHome} onChoose={(next) => { setCategory(next); setQuery(""); }} />
          <main className={styles.main}>
            <Header />
            {category === null ? (
              <Home onOpenCategory={setCategory} onOpenEntity={(entity) => setCategory(entity.category)} />
            ) : (
              <Category
                category={category}
                query={query}
                state={state}
                invalidCategory={false}
                onSearch={() => setSearchOpen(true)}
                onClearSearch={() => setQuery("")}
                onReset={goHome}
                onRetry={retry}
                onOpenEntity={() => undefined}
                onLoadMore={loadMore}
                onRetryMore={retryMore}
              />
            )}
          </main>
        </div>
        {category && searchOpen && (
          <Search
            category={category}
            query={query}
            onApply={(value) => { setQuery(value); setSearchOpen(false); restoreFocus("search"); }}
            onClose={() => { setSearchOpen(false); restoreFocus("search"); }}
          />
        )}
      </div>
    </div>
  );
}
