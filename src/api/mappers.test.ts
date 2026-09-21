import { describe, expect, it } from "vitest";
import {
  mapFilm,
  mapPerson,
  mapPlanet,
  mapSpecies,
  mapStarship,
  mapVehicle,
} from "./mappers";
import type { SwapiFilm, SwapiPerson, SwapiPlanet, SwapiSpecies, SwapiStarship, SwapiVehicle } from "../types/api";

const url = (category: string, id: number) =>
  `https://swapi.dev/api/${category}/${id}/`;

describe("mappers", () => {
  it("maps a planet and parses the stable id", () => {
    const raw = {
      name: "Tatooine",
      rotation_period: "23",
      orbital_period: "304",
      diameter: "10465",
      climate: "arid",
      gravity: "1",
      terrain: "desert",
      surface_water: "1",
      population: "200000",
      residents: ["r1", "r2", "r3"],
      films: ["f1", "f2"],
      url: url("planets", 1),
    } as SwapiPlanet;

    const planet = mapPlanet(raw);

    expect(planet).toMatchObject({
      id: "1",
      category: "planets",
      name: "Tatooine",
      summary: "desert",
    });
    expect(planet.attributes).toMatchObject({
      population: "200000",
      residents: 3,
      films: 2,
    });
  });

  it("maps a person", () => {
    const raw = {
      name: "Luke Skywalker",
      height: "172",
      mass: "77",
      hair_color: "blond",
      skin_color: "fair",
      eye_color: "blue",
      birth_year: "19BBY",
      gender: "male",
      homeworld: url("planets", 1),
      films: ["f1"],
      species: [],
      vehicles: ["v1", "v2"],
      starships: ["s1", "s2", "s3"],
      url: url("people", 1),
      created: "2014-12-09T13:50:51.644000Z",
      edited: "2014-12-20T21:17:56.891000Z",
    } as SwapiPerson;

    expect(mapPerson(raw)).toMatchObject({
      id: "1",
      category: "people",
      name: "Luke Skywalker",
      summary: "19BBY",
      attributes: {
        birthYear: "19BBY",
        gender: "male",
        height: "172",
        starships: 3,
        vehicles: 2,
        films: 1,
      },
    });
  });

  it("maps transportation with category-specific fields", () => {
    const ship = {
      name: "X-wing",
      model: "T-65",
      manufacturer: "Incom Corporation",
      cost_in_credits: "149999",
      length: "12.5",
      crew: "1",
      passengers: "0",
      cargo_capacity: "110",
      consumables: "1 week",
      max_atmosphering_speed: "1050",
      hyperdrive_rating: "1.0",
      MGLT: "100",
      starship_class: "Starfighter",
      films: ["f1"],
      pilots: ["p1", "p2"],
      url: url("starships", 12),
    } as SwapiStarship;

    expect(mapStarship(ship)).toMatchObject({
      id: "12",
      category: "starships",
      name: "X-wing",
      summary: "Starfighter",
      attributes: {
        model: "T-65",
        cost: "149999",
        shipClass: "Starfighter",
        hyperdriveRating: "1.0",
        megalights: "100",
        pilots: 2,
        films: 1,
      },
    });

    const vehicle = {
      name: "Sand Crawler",
      model: "Digger Crawler",
      manufacturer: "Corellia Mining Corporation",
      cost_in_credits: "150000",
      length: "36.8",
      crew: "46",
      passengers: "30",
      cargo_capacity: "50000",
      consumables: "2 months",
      max_atmosphering_speed: "30",
      vehicle_class: "wheeled",
      films: ["f1"],
      pilots: [],
      url: url("vehicles", 4),
      created: "2014-12-10T15:36:25.725000Z",
      edited: "2014-12-21T10:05:16.375000Z",
    } as SwapiVehicle;

    expect(mapVehicle(vehicle)).toMatchObject({
      id: "4",
      category: "vehicles",
      summary: "wheeled",
      attributes: { vehicleClass: "wheeled", passengers: "30" },
    });
  });

  it("maps a species", () => {
    const raw = {
      name: "Wookiee",
      classification: "Mammal",
      designation: "sentient",
      average_height: "210",
      average_lifespan: "400",
      eye_colors: "blue, green, yellow, brown, golden, red",
      hair_colors: "black, brown",
      skin_colors: "gray",
      homeworld: url("planets", 14),
      language: "Shyriiwook",
      people: ["p1", "p2"],
      films: ["f1", "f2", "f3"],
      url: url("species", 3),
      created: "2014-12-10T16:44:31.486000Z",
      edited: "2014-12-20T21:23:48.199000Z",
    } as SwapiSpecies;

    expect(mapSpecies(raw)).toMatchObject({
      id: "3",
      category: "species",
      name: "Wookiee",
      summary: "Mammal",
      attributes: {
        classification: "Mammal",
        designation: "sentient",
        language: "Shyriiwook",
        people: 2,
        films: 3,
      },
    });
  });

  it("maps a film with an episode summary", () => {
    const raw = {
      title: "A New Hope",
      episode_id: 4,
      opening_crawl: "It is a period of civil war.",
      director: "George Lucas",
      producer: "Gary Kurtz",
      release_date: "1977-05-25",
      characters: ["c1", "c2", "c3", "c4"],
      planets: ["p1"],
      starships: ["s1", "s2"],
      vehicles: ["v1"],
      species: ["sp1"],
      url: url("films", 4),
    } as SwapiFilm;

    expect(mapFilm(raw)).toMatchObject({
      id: "4",
      category: "films",
      name: "A New Hope",
      summary: "Episode 4 · 1977",
      attributes: {
        episode: 4,
        director: "George Lucas",
        characters: 4,
        planets: 1,
        starships: 2,
        vehicles: 1,
        species: 1,
      },
    });
  });
});