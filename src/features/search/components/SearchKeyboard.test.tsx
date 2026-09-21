import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/preact";
import { SEARCH_QUERY_LIMIT } from "../../../constants/config";
import { SearchKeyboard } from "./SearchKeyboard";

const draftText = () =>
  (screen.getByRole("status") as HTMLElement).textContent ?? "";

describe("SearchKeyboard", () => {
  it("builds a draft by appending keys and reports a trimmed apply", () => {
    const onApply = vi.fn();
    const onClose = vi.fn();
    render(
      <SearchKeyboard
        category="films"
        query=""
        onApply={onApply}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("B"));
    fireEvent.click(screen.getByText("Space"));
    expect(draftText()).toContain("AB");

    fireEvent.click(screen.getByText("Show results"));
    expect(onApply).toHaveBeenCalledWith("AB");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("seeds the draft from the active query", () => {
    const onApply = vi.fn();
    render(
      <SearchKeyboard
        category="people"
        query="lando"
        onApply={onApply}
        onClose={vi.fn()}
      />,
    );

    expect(draftText()).toContain("lando");
  });

  it("supports delete, clear and cancel controls", () => {
    const onApply = vi.fn();
    const onClose = vi.fn();
    render(
      <SearchKeyboard
        category="films"
        query="abc"
        onApply={onApply}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("⌫ Delete"));
    expect(draftText()).toBe("ab");

    fireEvent.click(screen.getByText("Clear"));
    expect(draftText().includes("ab")).toBe(false);

    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onApply).not.toHaveBeenCalled();
  });

  it("caps the draft at the query limit", () => {
    render(
      <SearchKeyboard
        category="films"
        query=""
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const keyA = screen.getByText("A");
    for (let i = 0; i < SEARCH_QUERY_LIMIT + 10; i += 1) {
      fireEvent.click(keyA);
    }

    expect(draftText().length).toBe(SEARCH_QUERY_LIMIT);
  });
});