import { isCategory } from "../constants/categories";
import type { Category } from "../types/common";
import type { Entity } from "../types/entities";

export type Route = "home" | "category" | "search" | "details";

export interface InitialLocation {
  category: Category | null;
  invalid: boolean;
}

export function readInitialLocation(): InitialLocation {
  const value = new URLSearchParams(window.location.search).get("category");
  return {
    category:
      value === null || value === ""
        ? null
        : isCategory(value)
          ? value
          : "planets",
    invalid: value !== null && value !== "" && !isCategory(value),
  };
}

export function routeFor(
  category: Category | null,
  selected: Entity | null,
  searchOpen: boolean,
): Route {
  if (selected) return "details";
  if (searchOpen && category) return "search";
  return category ? "category" : "home";
}