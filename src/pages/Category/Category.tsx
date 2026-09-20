import { getCurrentFocusKey } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useRef } from "preact/hooks";
import { FocusRegion } from "../../components/Focusable/Focusable";
import { CATEGORY_META } from "../../constants/categories";
import { SearchInput } from "../../features/search/components/SearchInput";
import {
  ResultsBody,
  ResultsHeader,
} from "../../features/search/components/SearchResults";
import type { SearchState } from "../../features/search/hooks/useSearch";
import type { Category as CategoryType } from "../../types/common";
import type { Entity } from "../../types/entities";
import { focus } from "../../utils/navigation";
import styles from "./Category.module.css";

export function Category({
  category,
  query,
  state,
  onSearch,
  onClearSearch,
  onRetry,
  onOpenEntity,
  onLoadMore,
}: {
  category: CategoryType;
  query: string;
  state: SearchState;
  onSearch: () => void;
  onClearSearch: () => void;
  onRetry: () => void;
  onOpenEntity: (entity: Entity) => void;
  onLoadMore: () => void;
}) {
  const meta = CATEGORY_META[category];
  const label = meta.label.toLowerCase();
  const showLoading =
    state.status === "loading" ||
    (state.status === "success" && state.loadingMore);
  const resultsRef = useRef<HTMLDivElement>(null);
  const hasMore = state.status === "success" && state.next !== null;

  useEffect(() => {
    if (resultsRef.current) resultsRef.current.scrollTop = 0;
  }, [category, query]);

  useEffect(() => {
    const current = getCurrentFocusKey();
    if (current?.startsWith("card-") && state.status !== "success")
      focus("search");
    if (current === "retry" && state.status !== "error") focus("search");
  }, [state.status]);

  // This listener belongs to the results DOM, which remounts after details.
  useEffect(() => {
    const container = resultsRef.current;
    if (!container || !hasMore) return;
    const nearEnd = () => {
      if (
        container.scrollHeight - container.scrollTop - container.clientHeight <
        480
      )
        onLoadMore();
    };
    container.addEventListener("scroll", nearEnd, { passive: true });
    return () => container.removeEventListener("scroll", nearEnd);
  }, [hasMore, onLoadMore]);

  return (
    <>
      <section className={styles.hero} aria-labelledby="category-heading">
        <div className={styles.heroCopy}>
          <h1 id="category-heading">
            Explore <em>{label}.</em>
          </h1>
        </div>
      </section>
      <FocusRegion id="content" className={styles.content} preferred="search">
        <SearchInput
          category={category}
          query={query}
          label={label}
          state={state}
          onSearch={onSearch}
          onClear={onClearSearch}
        />
        <ResultsHeader query={query} />
        <div
          className={styles.results}
          ref={resultsRef}
          data-scroll-region
          aria-busy={showLoading}
          aria-label={`${meta.label} results`}
        >
          <ResultsBody
            category={category}
            state={state}
            query={query}
            label={label}
            onRetry={onRetry}
            onClearSearch={onClearSearch}
            onOpen={onOpenEntity}
            onLoadMore={onLoadMore}
          />
        </div>
      </FocusRegion>
    </>
  );
}
