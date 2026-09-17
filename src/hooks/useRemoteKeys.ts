import { useEffect, useRef } from "preact/hooks";
import { SEARCH_CHARACTER_PATTERN } from "../constants/keys";

interface RemoteKeyHandlers {
  onAppend: (value: string) => void;
  onDelete: () => void;
}

// Keeps the physical-keyboard typing shortcut (letters, digits, space,
// hyphen, apostrophe and Backspace) decoupled from the on-screen keyboard UI.
export function useRemoteKeys(handlers: RemoteKeyHandlers) {
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const type = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "Backspace") {
        event.preventDefault();
        ref.current.onDelete();
      } else if (
        event.key.length === 1 &&
        SEARCH_CHARACTER_PATTERN.test(event.key)
      ) {
        event.preventDefault();
        ref.current.onAppend(event.key);
      }
    };
    window.addEventListener("keydown", type);
    return () => window.removeEventListener("keydown", type);
  }, []);
}