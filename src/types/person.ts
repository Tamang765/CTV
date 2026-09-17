import type { Resource } from "./common";

export type Person = Resource<
  "people",
  {
    birthYear: string;
    gender: string;
    height: string;
    mass: string;
    hairColor: string;
    skinColor: string;
    eyeColor: string;
    films: number;
    starships: number;
    vehicles: number;
  }
>;