import type { ComponentChildren } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { focus } from "../../utils/navigation";
import { isBackKey } from "../../constants/keys";
import { FocusRegion } from "../Focusable/Focusable";
import styles from "./Modal.module.css";

// A custom overlay is used instead of native <dialog> on purpose:
// <dialog> renders in the browser top layer, which is not affected by the
// transformed 1920x1080 stage, so it would escape spatial-navigation
// coordinates. It also installs its own focus trap that competes with
// Norigin's shouldFocusDOMNode/setFocus model. Static-analysis rule
// typescript:S6819 ("use <dialog>") does not apply to this CTV architecture.
export function Modal({
  id,
  titleId,
  initialFocus,
  onClose,
  children,
  className = "",
  closeOnBackspace = false,
}: {
  id: string;
  titleId: string;
  initialFocus: string;
  onClose: () => void;
  children: ComponentChildren;
  className?: string;
  closeOnBackspace?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => focus(initialFocus));
    const handleKey = (event: KeyboardEvent) => {
      if (isBackKey(event) || (closeOnBackspace && event.key === "Backspace")) {
        event.preventDefault();
        onClose();
      }
      // Native Tab must not escape the remote focus boundary into the background.
      if (event.key === "Tab") {
        event.preventDefault();
        const buttons = [
          ...(dialogRef.current?.querySelectorAll<HTMLButtonElement>(
            "button",
          ) ?? []),
        ];
        const current = buttons.indexOf(
          document.activeElement as HTMLButtonElement,
        );
        const next =
          (current + (event.shiftKey ? -1 : 1) + buttons.length) %
          buttons.length;
        const key = buttons[next]?.dataset.focusKey;
        if (key) focus(key);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKey);
    };
  }, [initialFocus, onClose, closeOnBackspace]);
  return (
    <div className={styles.backdrop}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${styles.modal} ${className}`}
      >
        <FocusRegion id={id} boundary preferred={initialFocus}>
          {children}
        </FocusRegion>
      </div>
    </div>
  );
}