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

function mapRecords(category: Category, records: unknown[]): Entity[] {
  switch (category) {
    case "planets":
      return records.map((record) => mapPlanet(record as SwapiPlanet));
    case "people":
      return records.map((record) => mapPerson(record as SwapiPerson));
    case "starships":
      return records.map((record) => mapStarship(record as SwapiStarship));
    case "vehicles":
      return records.map((record) => mapVehicle(record as SwapiVehicle));
    case "species":
      return records.map((record) => mapSpecies(record as SwapiSpecies));
    case "films":
      return records.map((record) => mapFilm(record as SwapiFilm));
  }
}

function malformed(): Error {
  return new Error(
    "The archive returned an unexpected format. Please try again.",
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
  const envelope = await request<SwapiCollection<unknown>>(url, signal);
  return {
    data: mapRecords(category, envelope.results),
    total: envelope.count,
    next: nextLink(url, envelope.next),
  };
}
