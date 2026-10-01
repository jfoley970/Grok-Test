export const VEHICLE_MAKES = [
  { make: "Chevrolet", models: ["Equinox", "Malibu", "Silverado"] },
  { make: "Ford", models: ["Explorer", "F-150", "Mustang"] },
  { make: "Honda", models: ["Accord", "Civic", "CR-V"] },
  { make: "Toyota", models: ["Camry", "Corolla", "Tacoma"] },
] as const;

export const VEHICLE_YEARS = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => 2000 + i).reverse();

export function modelsForMake(make: string): string[] {
  const found = VEHICLE_MAKES.find((entry) => entry.make === make);
  return found ? [...found.models] : [];
}

export function fitmentWhere(make?: string, model?: string, year?: string) {
  const parsedYear = Number(year);
  const hasYear = Boolean(year) && Number.isInteger(parsedYear);
  return {
    ...(make ? { make } : {}),
    ...(model ? { model } : {}),
    ...(hasYear ? { year: parsedYear } : {}),
  };
}

export function isKnownFitment(make: string, model: string, year: number) {
  return modelsForMake(make).includes(model) && VEHICLE_YEARS.includes(year);
}
