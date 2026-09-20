import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import type { ComponentChildren, CSSProperties } from "preact";
import { focus, reveal, synchronizeFocus } from "../../utils/navigation";
import styles from "../Button/Button.module.css";

export interface FocusButtonProps {
  id: string;
  children: ComponentChildren;
  onPress: () => void;
  onArrow?: (direction: string) => boolean;
  onFocus?: () => void;
  className?: string;
  label?: string;
  current?: boolean;
}

export function FocusButton({
  id,
  children,
  onPress,
  onArrow,
  onFocus,
  className = "",
  label,
  current,
}: FocusButtonProps) {
  const { ref, focused } = useFocusable<object, HTMLButtonElement>({
    focusKey: id,
    onEnterPress: onPress,
    onArrowPress: (direction) => onArrow?.(direction) ?? true,
    onFocus: ({ node }) => {
      onFocus?.();
      reveal(node);
    },
    accessibilityLabel: label,
  });
  return (
    <button
      ref={ref}
      type="button"
      data-focus-key={id}
      data-focused={focused || undefined}
      className={`${styles.focusable} ${className}`}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      onFocus={() => synchronizeFocus(id)}
      onClick={() => {
        focus(id);
        onPress();
      }}
    >
      {children}
    </button>
  );
}

export function FocusRegion({
  id,
  children,
  className,
  preferred,
  boundary = false,
  label,
  style,
}: {
  id: string;
  children: ComponentChildren;
  className?: string;
  preferred?: string;
  boundary?: boolean;
  label?: string;
  style?: CSSProperties;
}) {
  const { ref, focusKey } = useFocusable<object, HTMLDivElement>({
    focusKey: id,
    saveLastFocusedChild: true,
    autoRestoreFocus: false,
    preferredChildFocusKey: preferred,
    isFocusBoundary: boundary,
  });
  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} className={className} style={style} aria-label={label}>
        {children}
      </div>
    </FocusContext.Provider>
  );
}
