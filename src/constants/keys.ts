// Backspace is intentionally excluded: it deletes characters inside the search
// keyboard, so callers opt into it explicitly where appropriate.
export function isBackKey(event: KeyboardEvent): boolean {
  return event.key === "Escape" || event.key === "BrowserBack";
}

// Characters accepted by the on-screen search keyboard and the typing
// shortcut (letters, digits, space, hyphen and apostrophe).
export const SEARCH_CHARACTER_PATTERN = /^[a-z0-9 '-]$/i;
