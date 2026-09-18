import { Button } from "../../../components/Button/Button";
import { Card } from "../../../components/Card/Card";
import { EmptyState } from "../../../components/EmptyState/EmptyState";
import { ErrorState } from "../../../components/ErrorState/ErrorState";
import {
  FocusButton,
  FocusRegion,
} from "../../../components/Focusable/Focusable";
import { Icon } from "../../../components/Icon/Icon";
import {
  Loading,
  SkeletonRow,
  Spinner,
} from "../../../components/Loading/Loading";
import { GRID_COLUMNS } from "../../../navigation/navigation.constants";
import ui from "../../../styles/ui.module.css";
import type { Category } from "../../../types/common";
import type { Entity } from "../../../types/entities";
import { cardKey, focus } from "../../../utils/navigation";
import type { SearchState } from "../hooks/useSearch";
import searchStyles from "../styles/Search.module.css";

export function ResultsHeader({
  query,
  label,
  invalidCategory,
  state,
}: {
  query: string;
  label: string;
  invalidCategory: boolean;
  state: SearchState;
}) {
  const count =
    invalidCategory || state.status !== "success" ? "—" : state.data.length;
  return (
    <div className={searchStyles.resultsHeader}>
      <h2>
        {query ? `Results for “${query}”` : `All ${label}`} <span>{count}</span>
      </h2>
      <span aria-live="polite">{statusMessage(invalidCategory, state)}</span>
    </div>
  );
}

function statusMessage(invalidCategory: boolean, state: SearchState): string {
  if (invalidCategory) return "Invalid category";
  if (state.status === "loading") return "Connecting to the archive…";
  if (state.status === "error") return "Connection interrupted";
  return `${state.data.length} of ${state.total} records`;
}

export function ResultsBody({
  category,
  state,
  query,
  invalidCategory,
  label,
  onReset,
  onRetry,
  onClearSearch,
  onOpen,
  onLoadMore,
  onRetryMore,
}: {
  category: Category;
  state: SearchState;
  query: string;
  invalidCategory: boolean;
  label: string;
  onReset: () => void;
  onRetry: () => void;
  onClearSearch: () => void;
  onOpen: (entity: Entity) => void;
  onLoadMore: () => void;
  onRetryMore: () => void;
}) {
  if (invalidCategory) return <InvalidCategoryState onReset={onReset} />;
  if (state.status === "loading") return <Loading />;
  if (state.status === "error")
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
      error={state.moreError}
      onRetryMore={onRetryMore}
      onOpen={onOpen}
      onLoadMore={onLoadMore}
    />
  );
}

function InvalidCategoryState({ onReset }: { onReset: () => void }) {
  return (
    <ErrorState
      title="Unknown category"
      message="This category does not exist. Choose one from the menu to continue."
    >
      <Button
        variant="primary"
        id="reset-category"
        onPress={onReset}
        label="Return home"
      >
        Go home <Icon name="arrow" />
      </Button>
    </ErrorState>
  );
}

function ResultsGrid({
  category,
  results,
  hasMore,
  loading,
  error,
  onRetryMore,
  onOpen,
  onLoadMore,
}: {
  category: Category;
  results: Entity[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  onRetryMore: () => void;
  onOpen: (entity: Entity) => void;
  onLoadMore: () => void;
}) {
  const last = results[results.length - 1];
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
            hasMore && !error && index >= results.length - GRID_COLUMNS
              ? onLoadMore
              : undefined
          }
        />
      ))}
      {hasMore && loading && (
        <SkeletonRow key="skeleton-row" count={GRID_COLUMNS} />
      )}
      {error && <p role="alert">{error}</p>}
      {hasMore && (
        <FocusButton
          id="load-more"
          className={searchStyles.loadMore}
          label={
            loading
              ? "Loading more results"
              : error
                ? "Retry loading more results"
                : "More results below"
          }
          onPress={error ? onRetryMore : onLoadMore}
          onFocus={error ? undefined : onLoadMore}
          onArrow={(direction) => {
            if (direction === "up" && last) {
              focus(cardKey(last));
              return false;
            }
            return true;
          }}
        >
          {loading && <Spinner />}
          {loading
            ? "Loading more…"
            : error
              ? "Try again"
              : "More results below"}
        </FocusButton>
      )}
    </FocusRegion>
  );
}
