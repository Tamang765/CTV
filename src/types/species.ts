import type { Resource } from "./common";

export type Species = Resource<
  "species",
  {
    classification: string;
    designation: string;
    averageHeight: string;
    averageLifespan: string;
    eyeColors: string;
    hairColors: string;
    skinColors: string;
    language: string;
    people: number;
    films: number;
  }
>;