import { CATEGORIES, type Category, type CategoryMeta } from "../types/common";

export { CATEGORIES };

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  planets: {
    label: "Planets",
    icon: "planet",
    tagline: "Worlds across the galaxy",
  },
  people: {
    label: "People",
    icon: "people",
    tagline: "Heroes, villains and droids",
  },
  starships: {
    label: "Starships",
    icon: "ship",
    tagline: "The fastest hunk of junk",
  },
  vehicles: {
    label: "Vehicles",
    icon: "vehicle",
    tagline: "Every craft in the fleet",
  },
  species: {
    label: "Species",
    icon: "species",
    tagline: "Life forms of every scale",
  },
  films: {
    label: "Films",
    icon: "film",
    tagline: "Nine legends of the saga",
  },
};

export function isCategory(value: unknown): value is Category {
  return (
    typeof value === "string" &&
    CATEGORIES.some((category) => category === value)
  );
}