import { Button } from "../../../components/Button/Button";
import { Card } from "../../../components/Card/Card";
import { EmptyState } from "../../../components/EmptyState/EmptyState";
import { ErrorState } from "../../../components/ErrorState/ErrorState";
import {
  FocusButton,
  FocusRegion,
} from "../../../components/Focusable/Focusable";
import { Icon } from "../../../components/Icon/Icon";
import { Loading, SkeletonRow } from "../../../components/Loading/Loading";
import { GRID_COLUMNS } from "../../../navigation/navigation.constants";
import ui from "../../../styles/ui.module.css";
import type { Category } from "../../../types/common";
import type { Entity } from "../../../types/entities";
import { cardKey, focus } from "../../../utils/navigation";
import type { SearchState } from "../hooks/useSearch";
import searchStyles from "../styles/Search.module.css";

export function ResultsHeader({ query }: { query: string }) {
  return (
    <div className={searchStyles.resultsHeader}>
      <h2>{query ? `Results for “${query}”` : ``}</h2>
    </div>
  );
}

export function ResultsBody({
  category,
  state,
  query,
  label,
  onRetry,
  onClearSearch,
  onOpen,
  onLoadMore,
}: {
  category: Category;
  state: SearchState;
  query: string;
  label: string;
  onRetry: () => void;
  onClearSearch: () => void;
  onOpen: (entity: Entity) => void;
  onLoadMore: () => void;
}) {
  if (state.status === "error") {
    return (
      <ErrorState title="We lost the signal." message={state.message}>
        <Button
          variant="primary"
          id="retry"
          onPress={onRetry}
          label="Retry loading the archive"
        >
          <Icon name="reset" /> Try again
        </Button>
      </ErrorState>
    );
  }
  if (state.status === "loading") return <Loading />;
  if (state.data.length === 0)
    return (
      <EmptyState
        icon="search"
        title="No discoveries this time."
        message={
          query
            ? `No ${label} match “${query}”. Try a different name.`
            : "This category has no records yet."
        }
      >
        <Button
          variant="primary"
          id="clear-search"
          onPress={onClearSearch}
          label={query ? "Clear search" : "Back to search"}
        >
          {query ? "Clear search" : "Back to search"} <Icon name="arrow" />
        </Button>
      </EmptyState>
    );
  return (
    <ResultsGrid
      category={category}
      results={state.data}
      hasMore={state.next !== null}
      loading={state.loadingMore}
      onOpen={onOpen}
      onLoadMore={onLoadMore}
    />
  );
}

function ResultsGrid({
  category,
  results,
  hasMore,
  loading,
  onOpen,
  onLoadMore,
}: {
  category: Category;
  results: Entity[];
  hasMore: boolean;
  loading: boolean;
  onOpen: (entity: Entity) => void;
  onLoadMore: () => void;
}) {
  const last = results[results.length - 1];
  const loadFromControl = () => {
    if (last) focus(cardKey(last));
    onLoadMore();
  };
  return (
    <FocusRegion
      id={`grid-${category}`}
      className={ui.grid}
      preferred={results[0] ? cardKey(results[0]) : undefined}
      style={{ "--grid-cols": GRID_COLUMNS }}
    >
      {results.map((entity, index) => (
        <Card
          key={cardKey(entity)}
          entity={entity}
          onOpen={() => onOpen(entity)}
          onArrow={(direction) => {
            if (direction === "up" && index < GRID_COLUMNS) {
              focus("search");
              return false;
            }
            if (direction === "left" && index % GRID_COLUMNS === 0) {
              focus(`nav-${category}`);
              return false;
            }
            return true;
          }}
          onFocus={
            hasMore && index >= results.length - GRID_COLUMNS
              ? onLoadMore
              : undefined
          }
        />
      ))}
      {hasMore && loading && (
        <SkeletonRow key="pagination-skeleton" count={GRID_COLUMNS} />
      )}
      {hasMore && (
        <FocusButton
          key="load-more"
          id="load-more"
          className={searchStyles.loadMore}
          label={loading ? "Loading more results" : "More results below"}
          onPress={loadFromControl}
          onFocus={loadFromControl}
          onArrow={(direction) => {
            if (direction === "up" && last) {
              focus(cardKey(last));
              return false;
            }
            return true;
          }}
        >
          {loading ? "Loading more…" : "More results below"}
        </FocusButton>
      )}
    </FocusRegion>
  );
}
