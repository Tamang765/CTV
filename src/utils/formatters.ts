import type { Stat } from "../types/common";
import type { Entity } from "../types/entities";

const numberFormatter = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 6,
});

export function displayValue(value: string | number): string {
  const text = String(value).trim();
  if (!text || text.toLowerCase() === "unknown") return "Unknown";
  if (text.toLowerCase() === "n/a") return "--";
  return text;
}

export function formatQuantity(value: string, unit = ""): string {
  const text = displayValue(value);
  // Only format plain decimal values; ranges and descriptive API values stay intact.
  if (!/^\d+(?:,\d{3})*(?:\.\d+)?$/.test(text)) return text;
  const number = Number(text.replaceAll(",", ""));
  if (!Number.isSafeInteger(number) && Number.isInteger(number))
    return unit ? `${text} ${unit}` : text;
  const formatted = numberFormatter.format(number);
  return unit ? `${formatted} ${unit}` : formatted;
}

const stat = (label: string, value: string | number): Stat => ({
  label,
  value: displayValue(value),
});

export function entityStats(entity: Entity): Stat[] {
  switch (entity.category) {
    case "planets": {
      const a = entity.attributes;
      return [
        stat("Climate", a.climate),
        stat("Terrain", a.terrain),
        stat("Population", formatQuantity(a.population)),
        stat("Diameter", formatQuantity(a.diameter, "km")),
        stat("Gravity", a.gravity),
        stat("Rotation period", formatQuantity(a.rotationPeriod, "hours")),
        stat("Orbital period", formatQuantity(a.orbitalPeriod, "days")),
        stat("Surface water", formatQuantity(a.surfaceWater, "%")),
        stat("Known residents", a.residents),
        stat("Film appearances", a.films),
      ];
    }
    case "people": {
      const a = entity.attributes;
      return [
        stat("Birth year", a.birthYear),
        stat("Gender", a.gender),
        stat("Height", formatQuantity(a.height, "cm")),
        stat("Mass", formatQuantity(a.mass, "kg")),
        stat("Hair colour", a.hairColor),
        stat("Eye colour", a.eyeColor),
        stat("Skin colour", a.skinColor),
        stat("Film appearances", a.films),
        stat("Starships piloted", a.starships),
        stat("Vehicles piloted", a.vehicles),
      ];
    }
    case "starships":
    case "vehicles": {
      const a = entity.attributes;
      return [
        stat("Model", a.model),
        stat("Manufacturer", a.manufacturer),
        stat("Cost in credits", formatQuantity(a.cost, "credits")),
        stat("Length", formatQuantity(a.length, "m")),
        stat("Crew", a.crew),
        stat("Passengers", formatQuantity(a.passengers)),
        stat("Cargo capacity", formatQuantity(a.cargoCapacity, "kg")),
        stat("Consumables", a.consumables),
        stat("Atmospheric speed", a.atmosphericSpeed),
        ...(entity.category === "starships"
          ? [
              stat("Class", entity.attributes.shipClass),
              stat("Hyperdrive rating", entity.attributes.hyperdriveRating),
              stat("MGLT", entity.attributes.megalights),
            ]
          : [stat("Class", entity.attributes.vehicleClass)]),
      ];
    }
    case "species": {
      const a = entity.attributes;
      return [
        stat("Classification", a.classification),
        stat("Designation", a.designation),
        stat("Language", a.language),
        stat("Average height", formatQuantity(a.averageHeight, "cm")),
        stat("Average lifespan", formatQuantity(a.averageLifespan, "years")),
        stat("Eye colours", a.eyeColors),
        stat("Hair colours", a.hairColors),
        stat("Skin colours", a.skinColors),
        stat("Known people", a.people),
        stat("Film appearances", a.films),
      ];
    }
    case "films": {
      const a = entity.attributes;
      return [
        stat("Episode", a.episode),
        stat("Director", a.director),
        stat("Producer", a.producer),
        stat("Release date", a.releaseDate),
        stat("Characters", a.characters),
        stat("Planets", a.planets),
        stat("Starships", a.starships),
        stat("Vehicles", a.vehicles),
        stat("Species", a.species),
      ];
    }
  }
}
