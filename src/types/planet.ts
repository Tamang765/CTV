import type { Resource } from "./common";

export type Planet = Resource<
  "planets",
  {
    climate: string;
    terrain: string;
    population: string;
    diameter: string;
    gravity: string;
    rotationPeriod: string;
    orbitalPeriod: string;
    surfaceWater: string;
    residents: number;
    films: number;
  }
>;