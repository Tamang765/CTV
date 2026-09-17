import type { Resource } from "./common";

export interface TransportationAttributes {
  model: string;
  manufacturer: string;
  cost: string;
  length: string;
  crew: string;
  passengers: string;
  cargoCapacity: string;
  consumables: string;
  atmosphericSpeed: string;
  films: number;
  pilots: number;
}

export type Vehicle = Resource<
  "vehicles",
  TransportationAttributes & { vehicleClass: string }
>;