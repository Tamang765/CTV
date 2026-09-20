import { useState } from "preact/hooks";
import { Button } from "../../../components/Button/Button";
import { FocusButton } from "../../../components/Focusable/Focusable";
import { Icon } from "../../../components/Icon/Icon";
import { Modal } from "../../../components/Modal/Modal";
import { CATEGORY_META } from "../../../constants/categories";
import { SEARCH_QUERY_LIMIT } from "../../../constants/config";
import { useRemoteKeys } from "../../../hooks/useRemoteKeys";
import { KEYS_PER_ROW } from "../../../navigation/navigation.constants";
import ui from "../../../styles/ui.module.css";
import type { Category } from "../../../types/common";
import { focus } from "../../../utils/navigation";
import searchStyles from "../styles/Search.module.css";

const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

export function SearchKeyboard({
  category,
  query,
  onApply,
  onClose,
}: {
  category: Category;
  query: string;
  onApply: (value: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(query);
  const add = (value: string) =>
    setDraft((text) => (text + value).slice(0, SEARCH_QUERY_LIMIT));
  const remove = () => setDraft((text) => text.slice(0, -1));
  useRemoteKeys({
    onAppend: add,
    onDelete: remove,
  });

  return (
    <Modal
      id="keyboard"
      titleId="search-title"
      initialFocus="key-A"
      onClose={onClose}
      className={searchStyles.keyboardModal}
    >
      <div className={ui.detailTop}>
        <span></span>
        <Button
          variant="small"
          id="close-search"
          onPress={onClose}
          label="Cancel search"
        >
          <Icon name="close" /> Cancel
        </Button>
      </div>
      <h2 id="search-title">
        Search {CATEGORY_META[category].label.toLowerCase()}
      </h2>
      <div
        className={searchStyles.searchPreview}
        role="status"
        aria-label="Search query"
      >
        <Icon name="search" size={30} />
        <span>
          {draft || (
            <span className={searchStyles.placeholder}>Search by name…</span>
          )}
          <span className={searchStyles.caret} />
        </span>
      </div>
      <div
        className={searchStyles.keyboard}
        style={{ "--key-cols": KEYS_PER_ROW }}
      >
        {keys.map((key, index) => (
          <FocusButton
            id={`key-${key}`}
            key={key}
            className={searchStyles.key}
            onPress={() => add(key)}
            onArrow={(direction) => {
              if (
                direction === "up" &&
                Math.floor(index / KEYS_PER_ROW) === 0
              ) {
                focus("close-search");
                return false;
              }
              return true;
            }}
          >
            {key}
          </FocusButton>
        ))}
      </div>
      <div className={ui.keyboardActions}>
        <Button variant="small" id="key-space" onPress={() => add(" ")}>
          Space
        </Button>
        <Button
          variant="small"
          id="key-hyphen"
          onPress={() => add("-")}
          label="Hyphen"
        >
          −
        </Button>
        <Button
          variant="small"
          id="key-apostrophe"
          onPress={() => add("'")}
          label="Apostrophe"
        >
          ’
        </Button>
        <Button
          variant="small"
          id="key-delete"
          onPress={remove}
        >
          ⌫ Delete
        </Button>
        <Button variant="small" id="key-clear" onPress={() => setDraft("")}>
          Clear
        </Button>
        <Button
          variant="primary"
          id="search-done"
          onPress={() => onApply(draft.trim())}
        >
          Show results <Icon name="arrow" />
        </Button>
      </div>
    </Modal>
  );
}
