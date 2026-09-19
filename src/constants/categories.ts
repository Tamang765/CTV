import { CATEGORIES, type Category, type CategoryMeta } from "../types/common";

export { CATEGORIES };

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  planets: {
    label: "Planets",
    icon: "planet",
  },
  people: {
    label: "People",
    icon: "people",
  },
  starships: {
    label: "Starships",
    icon: "ship",
  },
  vehicles: {
    label: "Vehicles",
    icon: "vehicle",
  },
  species: {
    label: "Species",
    icon: "species",
  },
  films: {
    label: "Films",
    icon: "film",
  },
};

export function isCategory(value: unknown): value is Category {
  return (
    typeof value === "string" &&
    CATEGORIES.some((category) => category === value)
  );
}
