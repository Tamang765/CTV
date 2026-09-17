export const CATEGORIES = [
  "planets",
  "people",
  "starships",
  "vehicles",
  "species",
  "films",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type CategoryIcon =
  | "planet"
  | "people"
  | "ship"
  | "vehicle"
  | "species"
  | "film";

export interface CategoryMeta {
  label: string;
  icon: CategoryIcon;
  tagline: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface Resource<C extends Category, A> {
  id: string;
  category: C;
  name: string;
  summary: string;
  attributes: A;
}
