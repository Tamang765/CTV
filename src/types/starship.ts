import type { Resource } from "./common";
import type { TransportationAttributes } from "./vehicle";

export type Starship = Resource<
  "starships",
  TransportationAttributes & {
    shipClass: string;
    hyperdriveRating: string;
    megalights: string;
  }
>;