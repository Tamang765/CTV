// SWAPI represents numeric measurements as strings (including "unknown" and ranges).
interface SwapiResource {
  url: string;
  created: string;
  edited: string;
}

export interface SwapiCollection<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SwapiPlanet extends SwapiResource {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: string[];
  films: string[];
}

export interface SwapiPerson extends SwapiResource {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
}

export interface SwapiTransportation extends SwapiResource {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  max_atmosphering_speed: string;
  films: string[];
  pilots: string[];
}

export interface SwapiStarship extends SwapiTransportation {
  hyperdrive_rating: string;
  MGLT: string;
  starship_class: string;
}

export interface SwapiVehicle extends SwapiTransportation {
  vehicle_class: string;
}

export interface SwapiSpecies extends SwapiResource {
  name: string;
  classification: string;
  designation: string;
  average_height: string;
  average_lifespan: string;
  eye_colors: string;
  hair_colors: string;
  skin_colors: string;
  homeworld: string | null;
  language: string;
  people: string[];
  films: string[];
}

export interface SwapiFilm extends SwapiResource {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  characters: string[];
  planets: string[];
  starships: string[];
  vehicles: string[];
  species: string[];
}
