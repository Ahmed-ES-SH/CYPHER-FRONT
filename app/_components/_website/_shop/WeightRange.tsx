"use client";
import { useState, useEffect } from "react";
import type { FilterOptions, ProductQuery } from "@/src/modules/products";

interface Props {
  filterOptions: FilterOptions;
  activeFilters: ProductQuery;
  onFilterChange: (updates: Partial<ProductQuery>) => void;
}

export default function WeightRange({
  filterOptions,
  activeFilters,
  onFilterChange,
}: Props) {
  if (
    filterOptions.weightRange.min === null &&
    filterOptions.weightRange.max === null
  ) {
    return null;
  }

  const effectiveMin = filterOptions.weightRange.min ?? 0;
  const effectiveMax = filterOptions.weightRange.max ?? 10;

  const [min, setMin] = useState(activeFilters.minWeight ?? effectiveMin);
  const [max, setMax] = useState(activeFilters.maxWeight ?? effectiveMax);

  useEffect(() => {
    setMin(activeFilters.minWeight ?? effectiveMin);
    setMax(activeFilters.maxWeight ?? effectiveMax);
  }, [activeFilters.minWeight, activeFilters.maxWeight, effectiveMin, effectiveMax]);

  const apply = () => {
    onFilterChange({
      minWeight: min !== effectiveMin ? min : undefined,
      maxWeight: max !== effectiveMax ? max : undefined,
    });
  };

  return (
    <div>
      <label className="font-medium text-sm text-gray-700 block mb-1">
        Weight
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={effectiveMin}
          max={effectiveMax}
          value={min}
          onChange={(e) => setMin(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
        />
        <span className="text-gray-400">—</span>
        <input
          type="number"
          min={effectiveMin}
          max={effectiveMax}
          value={max}
          onChange={(e) => setMax(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
        />
      </div>
      <button
        onClick={apply}
        className="mt-2 w-full text-sm bg-primary-blue text-white rounded-md py-1.5 hover:bg-primary-blue/90 transition"
      >
        Apply
      </button>
    </div>
  );
}
