import { isCategory } from "../constants/categories";
import type {
  SwapiCollection,
  SwapiFilm,
  SwapiPerson,
  SwapiPlanet,
  SwapiSpecies,
  SwapiStarship,
  SwapiVehicle,
} from "../types/api";
import type { Category } from "../types/common";
import type { Entity } from "../types/entities";
import { request } from "./client";
import { categoryEndpoint, searchEndpoint } from "./endpoints";
import {
  mapFilm,
  mapPerson,
  mapPlanet,
  mapSpecies,
  mapStarship,
  mapVehicle,
} from "./mappers";

// Home previews and category entry share only the first unfiltered page.
// Additional pages stay in the mounted search hook, not a global cache.
const cache = new Map<Category, CollectionPage>();

type SwapiRecord =
  | SwapiFilm
  | SwapiPerson
  | SwapiPlanet
  | SwapiSpecies
  | SwapiStarship
  | SwapiVehicle;

// Each mapper targets its concrete SWAPI shape; the record union is narrowed
// once per category here instead of via repeated casts at every call site.
const recordMappers: Record<Category, (record: SwapiRecord) => Entity> = {
  planets: (record) => mapPlanet(record as SwapiPlanet),
  people: (record) => mapPerson(record as SwapiPerson),
  starships: (record) => mapStarship(record as SwapiStarship),
  vehicles: (record) => mapVehicle(record as SwapiVehicle),
  species: (record) => mapSpecies(record as SwapiSpecies),
  films: (record) => mapFilm(record as SwapiFilm),
};

function mapRecords(category: Category, records: SwapiRecord[]): Entity[] {
  const mapper = recordMappers[category];
  return records.map(mapper);
}

function malformed(): Error {
  return new Error(
    "The archive returned an unexpected format. Please try again.",
  );
}

function isCollection(value: unknown): value is SwapiCollection<SwapiRecord> {
  if (typeof value !== "object" || value === null) return false;
  const page = value as SwapiCollection<SwapiRecord>;
  return (
    Array.isArray(page.results) &&
    Number.isSafeInteger(page.count) &&
    page.count >= 0 &&
    (page.next === null || typeof page.next === "string")
  );
}

function nextLink(url: string, next: string | null): string | null {
  if (next === null) return null;
  const currentUrl = new URL(url, window.location.origin);
  const pageNumber = new URL(next, currentUrl).searchParams.get("page");
  if (!pageNumber || !/^\d+$/.test(pageNumber)) throw malformed();
  // SWAPI next links can contain its public host even behind a custom base.
  // Keep our configured endpoint and original search; copy only the page.
  currentUrl.searchParams.set("page", pageNumber);
  return currentUrl.href;
}

export async function fetchCategory(
  category: Category,
  signal: AbortSignal,
): Promise<CollectionPage> {
  if (!isCategory(category))
    throw new Error(
      "This category does not exist. Choose a category from the menu.",
    );
  signal.throwIfAborted();
  const cached = cache.get(category);
  if (cached) return cached;

  const page = await readCategoryPage(
    category,
    categoryEndpoint(category),
    signal,
  );

  // Cancelled or failed requests never enter the session cache.
  signal.throwIfAborted();
  cache.set(category, page);
  return page;
}

export interface CollectionPage {
  data: Entity[];
  total: number;
  next: string | null;
}

export function searchCategory(
  category: Category,
  query: string,
  signal: AbortSignal,
): Promise<CollectionPage> {
  const url = searchEndpoint(category, query);
  return readCategoryPage(category, url, signal);
}

export async function readCategoryPage(
  category: Category,
  url: string,
  signal: AbortSignal,
): Promise<CollectionPage> {
  const envelope = await request<unknown>(url, signal);
  if (!isCollection(envelope)) throw malformed();
  return {
    data: mapRecords(category, envelope.results),
    total: envelope.count,
    next: nextLink(url, envelope.next),
  };
}
