import { useEffect } from "preact/hooks";
import { isBackKey } from "../constants/keys";

// The remote Back key (ESC, BrowserBack or hardware back, plus Backspace on a
// physical keyboard) pops the previous screen while the handler is enabled.
export function useBackNavigation(onBack: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handleKey = (event: KeyboardEvent) => {
      if (isBackKey(event) || event.key === "Backspace") {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onBack, enabled]);
}