import { getCurrentFocusKey } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useRef } from "preact/hooks";
import { FocusRegion } from "../../components/Focusable/Focusable";
import { CATEGORY_META } from "../../constants/categories";
import type { Entity } from "../../types/entities";
import type { Category as CategoryType } from "../../types/common";
import { SearchInput } from "../../features/search/components/SearchInput";
import {
  ResultsBody,
  ResultsHeader,
} from "../../features/search/components/SearchResults";
import type { SearchState } from "../../features/search/hooks/useSearch";
import styles from "./Category.module.css";
import { cardKey, focus } from "../../utils/navigation";

const EMPTY_RESULTS: Entity[] = [];

export function Category({
  category,
  query,
  state,
  invalidCategory,
  onSearch,
  onClearSearch,
  onReset,
  onRetry,
  onOpenEntity,
  onLoadMore,
  onRetryMore,
}: {
  category: CategoryType;
  query: string;
  state: SearchState;
  invalidCategory: boolean;
  onSearch: () => void;
  onClearSearch: () => void;
  onReset: () => void;
  onRetry: () => void;
  onOpenEntity: (entity: Entity) => void;
  onLoadMore: () => void;
  onRetryMore: () => void;
}) {
  const meta = CATEGORY_META[category];
  const label = meta.label.toLowerCase();
  const showLoading = !invalidCategory && state.status === "loading";
  const resultsRef = useRef<HTMLDivElement>(null);
  const results = state.status === "success" ? state.data : EMPTY_RESULTS;
  const hasMore = state.status === "success" && state.next !== null;
  const loadingMore = state.status === "success" && state.loadingMore;
  const viewKey = useRef(`${category}|${query}`);
  const prevCount = useRef(results.length);
  const wasLoadingMore = useRef(loadingMore);

  useEffect(() => {
    const key = `${category}|${query}`;
    if (viewKey.current !== key) {
      viewKey.current = key;
      prevCount.current = 0;
      wasLoadingMore.current = false;
      if (resultsRef.current) resultsRef.current.scrollTop = 0;
    }
    const current = getCurrentFocusKey();
    if (
      current?.startsWith("card-") &&
      !results.some((entity) => cardKey(entity) === current)
    )
      focus("search");
    if (current === "retry" && state.status !== "error") focus("search");
  }, [category, query, results, state.status]);

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

  // Keep focus usable even when the final page removes the load-more button.
  useEffect(() => {
    if (loadingMore && !wasLoadingMore.current) {
      prevCount.current = results.length;
    } else if (!loadingMore && wasLoadingMore.current) {
      const firstNew = results[prevCount.current];
      if (getCurrentFocusKey() === "load-more" && firstNew)
        focus(cardKey(firstNew));
    }
    wasLoadingMore.current = loadingMore;
  }, [loadingMore, results]);

  return (
    <>
      <section
        className={styles.hero}
        aria-labelledby="category-heading"
      >
        <div className={styles.heroCopy}>
          <h1 id="category-heading">
            Explore <em>{label}.</em>
          </h1>
        </div>
      </section>
      <FocusRegion
        id="content"
        className={styles.content}
        preferred="search"
      >
        <SearchInput
          category={category}
          query={query}
          label={label}
          state={state}
          invalidCategory={invalidCategory}
          onSearch={onSearch}
          onClear={onClearSearch}
        />
        <ResultsHeader
          query={query}
          label={label}
          invalidCategory={invalidCategory}
          state={state}
        />
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
            invalidCategory={invalidCategory}
            label={label}
            onReset={onReset}
            onRetry={onRetry}
            onClearSearch={onClearSearch}
            onOpen={onOpenEntity}
            onLoadMore={onLoadMore}
            onRetryMore={onRetryMore}
          />
        </div>
      </FocusRegion>
    </>
  );
}
