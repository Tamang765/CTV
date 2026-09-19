import { useCallback, useEffect, useState } from "preact/hooks";
import { CategoryNav } from "../components/CategoryNav/CategoryNav";
import { Header } from "../components/Header/Header";
import { useSearch } from "../features/search/hooks/useSearch";
import { useBackNavigation } from "../hooks/useBackNavigation";
import { useFocusRestore } from "../hooks/useFocusRestore";
import { useStageScale } from "../hooks/useStageScale";
import { Category } from "../pages/Category/Category";
import { Details } from "../pages/Details/Details";
import { Home } from "../pages/Home/Home";
import { Search } from "../pages/Search/Search";
import type { Category as CategoryType } from "../types/common";
import type { Entity } from "../types/entities";
import { cardKey, focus, homeItemKey } from "../utils/navigation";
import styles from "./App.module.css";
import { readInitialLocation, routeFor } from "./routes";

export function App() {
  const [initial] = useState(readInitialLocation);
  const [category, setCategory] = useState<CategoryType | null>(
    initial.category,
  );
  const [invalidCategory, setInvalidCategory] = useState(initial.invalid);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<Entity | null>(null);
  const { state, retry, loadMore, retryMore } = useSearch(
    invalidCategory ? null : category,
    query,
  );
  const scale = useStageScale();
  const { returnFocus, restoreFocus } = useFocusRestore("search");
  const showHome = category === null && !invalidCategory;
  const route = routeFor(category, selected, searchOpen);

  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      focus(category ? `nav-${category}` : "nav-home"),
    );
    return () => cancelAnimationFrame(frame);
  }, [category]);
  const clearQuery = useCallback(() => {
    setQuery("");
    focus("search");
  }, []);
  const chooseCategory = (next: CategoryType) => {
    setCategory(next);
    setQuery("");
    setInvalidCategory(false);
    const url = new URL(window.location.href);
    url.searchParams.set("category", next);
    window.history.replaceState(null, "", url);
  };

  const goHome = useCallback(() => {
    setCategory(null);
    setQuery("");
    setInvalidCategory(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("category");
    window.history.replaceState(null, "", url);
  }, []);

  const backFromCategory = useCallback(() => {
    if (query) clearQuery();
    else goHome();
  }, [query, clearQuery, goHome]);
  useBackNavigation(backFromCategory, !!category && !selected && !searchOpen);

  const closeDetails = useCallback(() => {
    setSelected(null);
    restoreFocus();
  }, [restoreFocus]);
  // While a detail page is open, Back (ESC/BrowserBack/Backspace) closes it.
  useBackNavigation(closeDetails, !!selected);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    restoreFocus("search");
  }, [restoreFocus]);
  const openHomeEntity = (entity: Entity) => {
    returnFocus.current = homeItemKey(entity);
    setSelected(entity);
  };

  return (
    <div className={styles.viewport} data-route={route}>
      <div
        className={styles.stage}
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {selected ? (
          <Details entity={selected} onBack={closeDetails} />
        ) : (
          <div
            className={styles.application}
            inert={searchOpen}
            aria-hidden={searchOpen || undefined}
          >
            <CategoryNav
              category={category}
              invalidCategory={invalidCategory}
              showHome={showHome}
              onHome={goHome}
              onChoose={chooseCategory}
            />
            <main className={styles.main}>
              <Header />
              {category === null ? (
                <Home
                  onOpenCategory={chooseCategory}
                  onOpenEntity={openHomeEntity}
                />
              ) : (
                <Category
                  category={category}
                  query={query}
                  state={state}
                  invalidCategory={invalidCategory}
                  onSearch={() => setSearchOpen(true)}
                  onClearSearch={clearQuery}
                  onReset={() => {
                    goHome();
                    focus("nav-home");
                  }}
                  onRetry={() => {
                    focus("search");
                    retry();
                  }}
                  onOpenEntity={(entity) => {
                    returnFocus.current = cardKey(entity);
                    setSelected(entity);
                  }}
                  onLoadMore={loadMore}
                  onRetryMore={retryMore}
                />
              )}
            </main>
          </div>
        )}
        {category && searchOpen && (
          <Search
            category={category}
            query={query}
            onApply={(value) => {
              setQuery(value);
              closeSearch();
            }}
            onClose={closeSearch}
          />
        )}
      </div>
    </div>
  );
}
