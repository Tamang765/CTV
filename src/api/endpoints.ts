import type { Category } from "../types/common";

const API_BASE = (
  import.meta.env.VITE_SWAPI_DEV_BASE ?? "https://swapi.dev/api"
).replace(/\/+$/, "");

export const categoryEndpoint = (category: Category) =>
  `${API_BASE}/${category}/`;

export const searchEndpoint = (category: Category, query: string) =>
  `${categoryEndpoint(category)}?search=${encodeURIComponent(query)}`;
