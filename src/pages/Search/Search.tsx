import type { Category as CategoryType } from "../../types/common";
import { ErrorBoundary } from "../../components/ErrorBoundary/ErrorBoundary";
import { SearchKeyboard } from "../../features/search/components/SearchKeyboard";

export function Search({
  category,
  query,
  onApply,
  onClose,
}: {
  category: CategoryType;
  query: string;
  onApply: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <ErrorBoundary dismiss={onClose}>
      <SearchKeyboard
        category={category}
        query={query}
        onApply={onApply}
        onClose={onClose}
      />
    </ErrorBoundary>
  );
}
