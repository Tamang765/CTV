import type {
  Film,
  Person,
  Planet,
  Species,
  Starship,
  Vehicle,
} from "../types/entities";
import type { TransportationAttributes } from "../types/vehicle";
import type {
  SwapiFilm,
  SwapiPerson,
  SwapiPlanet,
  SwapiSpecies,
  SwapiStarship,
  SwapiTransportation,
  SwapiVehicle,
} from "../types/api";

// Stable API resource IDs also identify focus targets.
const idFromUrl = (url: string): string => url.split("/").filter(Boolean).at(-1)!;

export const mapPlanet = (r: SwapiPlanet): Planet => ({
  id: idFromUrl(r.url),
  category: "planets",
  name: r.name,
  summary: r.terrain,
  attributes: {
    climate: r.climate,
    terrain: r.terrain,
    population: r.population,
    diameter: r.diameter,
    gravity: r.gravity,
    rotationPeriod: r.rotation_period,
    orbitalPeriod: r.orbital_period,
    surfaceWater: r.surface_water,
    residents: r.residents.length,
    films: r.films.length,
  },
});

export const mapPerson = (r: SwapiPerson): Person => ({
  id: idFromUrl(r.url),
  category: "people",
  name: r.name,
  summary: r.birth_year,
  attributes: {
    birthYear: r.birth_year,
    gender: r.gender,
    height: r.height,
    mass: r.mass,
    hairColor: r.hair_color,
    skinColor: r.skin_color,
    eyeColor: r.eye_color,
    films: r.films.length,
    vehicles: r.vehicles.length,
    starships: r.starships.length,
  },
});

const transport = (r: SwapiTransportation): TransportationAttributes => ({
  model: r.model,
  manufacturer: r.manufacturer,
  cost: r.cost_in_credits,
  length: r.length,
  crew: r.crew,
  passengers: r.passengers,
  cargoCapacity: r.cargo_capacity,
  consumables: r.consumables,
  atmosphericSpeed: r.max_atmosphering_speed,
  films: r.films.length,
  pilots: r.pilots.length,
});

export const mapStarship = (r: SwapiStarship): Starship => ({
  id: idFromUrl(r.url),
  category: "starships",
  name: r.name,
  summary: r.starship_class,
  attributes: {
    ...transport(r),
    shipClass: r.starship_class,
    hyperdriveRating: r.hyperdrive_rating,
    megalights: r.MGLT,
  },
});

export const mapVehicle = (r: SwapiVehicle): Vehicle => ({
  id: idFromUrl(r.url),
  category: "vehicles",
  name: r.name,
  summary: r.vehicle_class,
  attributes: { ...transport(r), vehicleClass: r.vehicle_class },
});

export const mapSpecies = (r: SwapiSpecies): Species => ({
  id: idFromUrl(r.url),
  category: "species",
  name: r.name,
  summary: r.classification,
  attributes: {
    classification: r.classification,
    designation: r.designation,
    averageHeight: r.average_height,
    averageLifespan: r.average_lifespan,
    eyeColors: r.eye_colors,
    hairColors: r.hair_colors,
    skinColors: r.skin_colors,
    language: r.language,
    people: r.people.length,
    films: r.films.length,
  },
});

export const mapFilm = (r: SwapiFilm): Film => ({
  id: idFromUrl(r.url),
  category: "films",
  name: r.title,
  summary: `Episode ${r.episode_id} · ${r.release_date.slice(0, 4)}`,
  attributes: {
    episode: r.episode_id,
    director: r.director,
    producer: r.producer,
    releaseDate: r.release_date,
    openingCrawl: r.opening_crawl,
    characters: r.characters.length,
    planets: r.planets.length,
    starships: r.starships.length,
    vehicles: r.vehicles.length,
    species: r.species.length,
  },
});