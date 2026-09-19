import { isCategory } from "../constants/categories";
import type { Category } from "../types/common";

export function readInitialCategory(): Category | null {
  const value = new URLSearchParams(window.location.search).get("category");
  return isCategory(value) ? value : null;
}
