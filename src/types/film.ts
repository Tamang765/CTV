import type { Resource } from "./common";

export type Film = Resource<
  "films",
  {
    episode: number;
    director: string;
    producer: string;
    releaseDate: string;
    openingCrawl: string;
    characters: number;
    planets: number;
    starships: number;
    vehicles: number;
    species: number;
  }
>;