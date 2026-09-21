import { describe, expect, it } from "vitest";
import type { Person } from "../types/person";
import type { Film } from "../types/film";
import { displayValue, entityStats, formatQuantity } from "./formatters";

const person: Person = {
  id: "1",
  category: "people",
  name: "Luke Skywalker",
  summary: "19BBY",
  attributes: {
    birthYear: "19BBY",
    gender: "male",
    height: "172",
    mass: "77",
    hairColor: "blond",
    skinColor: "fair",
    eyeColor: "blue",
    films: 4,
    starships: 2,
    vehicles: 1,
  },
};

describe("displayValue", () => {
  it.each([
    ["unknown", "Unknown"],
    ["UNKNOWN", "Unknown"],
    ["n/a", "--"],
    ["N/A", "--"],
    ["  tatooine  ", "tatooine"],
    ["", "Unknown"],
  ])("maps %p to %p", (input, expected) => {
    expect(displayValue(input)).toBe(expected);
  });
});

describe("formatQuantity", () => {
  it.each([
    ["8720", "8,720"],
    ["1000000", "1,000,000"],
    ["3.5", "3.5"],
    ["1,000,000", "1,000,000"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatQuantity(input)).toBe(expected);
  });

  it("appends a unit", () => {
    expect(formatQuantity("8720", "km")).toBe("8,720 km");
  });

  it("leaves unknown, ranges and descriptive values intact", () => {
    expect(formatQuantity("unknown")).toBe("Unknown");
    expect(formatQuantity("n/a")).toBe("--");
    expect(formatQuantity("12-24 months")).toBe("12-24 months");
    expect(formatQuantity("150-200")).toBe("150-200");
  });

  it("keeps unsafe integers verbatim", () => {
    expect(formatQuantity("9007199254740993")).toBe("9007199254740993");
  });
});

describe("entityStats", () => {
  it("builds labelled stats for people", () => {
    const stats = entityStats(person);
    const byLabel = Object.fromEntries(stats.map((s) => [s.label, s.value]));

    expect(byLabel).toMatchObject({
      "Birth year": "19BBY",
      "Height": "172 cm",
      "Mass": "77 kg",
      "Hair colour": "blond",
      "Film appearances": "4",
      "Starships piloted": "2",
    });
  });

  it("renders the opening crawl section for films", () => {
    const film: Film = {
      id: "4",
      category: "films",
      name: "A New Hope",
      summary: "Episode 4 · 1977",
      attributes: {
        episode: 4,
        director: "George Lucas",
        producer: "Gary Kurtz",
        releaseDate: "1977-05-25",
        openingCrawl: "It is a period of civil war.",
        characters: 2,
        planets: 1,
        starships: 0,
        vehicles: 0,
        species: 0,
      },
    };
    const stats = entityStats(film);
    const byLabel = Object.fromEntries(stats.map((s) => [s.label, s.value]));

    expect(byLabel).toMatchObject({
      Episode: "4",
      Director: "George Lucas",
      Characters: "2",
      Species: "0",
    });
  });
});