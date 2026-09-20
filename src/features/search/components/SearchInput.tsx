import { Button } from "../../../components/Button/Button";
import { FocusButton } from "../../../components/Focusable/Focusable";
import { Icon } from "../../../components/Icon/Icon";
import type { Category } from "../../../types/common";
import { cardKey, focus } from "../../../utils/navigation";
import type { SearchState } from "../hooks/useSearch";
import searchStyles from "../styles/Search.module.css";

export function SearchInput({
  category,
  query,
  label,
  state,
  onSearch,
  onClear,
}: {
  category: Category;
  query: string;
  label: string;
  state: SearchState;
  onSearch: () => void;
  onClear: () => void;
}) {
  const first = state.status === "success" ? state.data[0] : undefined;
  const firstResultKey = first ? cardKey(first) : undefined;
  const goToResults = (): boolean => {
    if (state.status === "error") {
      focus("retry");
      return true;
    }
    if (firstResultKey) {
      focus(firstResultKey);
      return true;
    }
    if (state.status === "success") {
      focus("clear-search");
      return true;
    }
    return false;
  };

  return (
    <div className={searchStyles.toolbar}>
      <FocusButton
        id="search"
        className={searchStyles.searchButton}
        onPress={onSearch}
        label={`Search ${label}`}
        onArrow={(direction) => {
          if (direction === "down") return !goToResults();
          if (direction === "left") {
            focus(`nav-${category}`);
            return false;
          }
          return true;
        }}
      >
        <Icon name="search" size={27} />
        <span>{query || `Search ${label}…`}</span>
      </FocusButton>
      {query && (
        <Button
          variant="small"
          id="clear-query"
          onPress={onClear}
          label="Clear search"
        >
          <Icon name="close" /> Clear
        </Button>
      )}
      <span className={searchStyles.collectionLabel}>
        <Icon name="grid" size={23} />{" "}
        {query ? "SEARCH RESULTS" : `ALL ${label.toUpperCase()}`}
      </span>
    </div>
  );
}
