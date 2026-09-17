import type { Film } from "./film";
import type { Person } from "./person";
import type { Planet } from "./planet";
import type { Species } from "./species";
import type { Starship } from "./starship";
import type { Vehicle } from "./vehicle";

export type { Film, Person, Planet, Species, Starship, Vehicle };

export type Entity = Planet | Person | Starship | Vehicle | Species | Film;
