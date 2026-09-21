import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/preact";

afterEach(() => cleanup());

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// The spatial-navigation engine needs real layout data, so component tests
// stub its hooks. State wiring (focus keys, arrows, press callbacks) is still
// exercised through the components' own props.
vi.mock("@noriginmedia/norigin-spatial-navigation", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useFocusable: vi.fn(() => ({
      ref: { current: null },
      focused: false,
      focusKey: "",
    })),
    setFocus: vi.fn(),
    getCurrentFocusKey: vi.fn(() => null),
    updateAllLayouts: vi.fn(async () => undefined),
  };
});