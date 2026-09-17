import { useCallback, useRef } from "preact/hooks";
import { focus } from "../utils/navigation";

// Remembers which focus key opened entity details so closing them returns to
// the originating card or poster on the next frame.
export function useFocusRestore(initial: string) {
  const returnFocus = useRef(initial);
  const restoreFocus = useCallback((fallback?: string) => {
    const key = fallback ?? returnFocus.current;
    requestAnimationFrame(() => focus(key));
  }, []);
  return { returnFocus, restoreFocus };
}