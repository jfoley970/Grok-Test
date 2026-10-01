"use client";

import { useState } from "react";
import { VEHICLE_MAKES, VEHICLE_YEARS, modelsForMake } from "@/lib/vehicles";

const fieldClass =
  "border border-[var(--steel)] bg-[var(--panel)] px-3 py-2 text-[var(--paper)] outline-none focus:border-[var(--signal)]";

export function VehicleFilters({
  make = "",
  model = "",
  year = "",
  query = "",
  showQuery = false,
}: {
  make?: string;
  model?: string;
  year?: string;
  query?: string;
  showQuery?: boolean;
}) {
  const [selectedMake, setSelectedMake] = useState(make);
  const [selectedModel, setSelectedModel] = useState(model);
  const models = modelsForMake(selectedMake);

  return (
    <form className="flex flex-wrap items-end gap-2">
      {showQuery ? (
        <label className="block text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          Part
          <input
            name="q"
            defaultValue={query}
            placeholder="Part # or keyword"
            className={`mt-1 block min-w-[220px] ${fieldClass}`}
          />
        </label>
      ) : query ? (
        <input type="hidden" name="q" value={query} />
      ) : null}
      <label className="block text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        Make
        <select
          name="make"
          value={selectedMake}
          onChange={(event) => {
            setSelectedMake(event.target.value);
            setSelectedModel("");
          }}
          className={`mt-1 block min-w-36 ${fieldClass}`}
        >
          <option value="">Any</option>
          {VEHICLE_MAKES.map((entry) => (
            <option key={entry.make} value={entry.make}>
              {entry.make}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        Model
        <select
          name="model"
          value={models.includes(selectedModel) ? selectedModel : ""}
          onChange={(event) => setSelectedModel(event.target.value)}
          disabled={!selectedMake}
          className={`mt-1 block min-w-36 ${fieldClass} disabled:opacity-50`}
        >
          <option value="">Any</option>
          {models.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        Year
        <select name="year" defaultValue={year} className={`mt-1 block min-w-28 ${fieldClass}`}>
          <option value="">Any</option>
          {VEHICLE_YEARS.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="bg-[var(--signal)] px-4 py-2 font-medium text-[var(--ink)]">
        Filter
      </button>
    </form>
  );
}
