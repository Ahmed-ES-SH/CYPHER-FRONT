"use client";
import { useState, useEffect } from "react";
import type { FilterOptions, ProductQuery } from "@/src/modules/products";

interface Props {
  filterOptions: FilterOptions;
  activeFilters: ProductQuery;
  onFilterChange: (updates: Partial<ProductQuery>) => void;
}

export default function PriceRange({
  filterOptions,
  activeFilters,
  onFilterChange,
}: Props) {
  const [min, setMin] = useState(
    activeFilters.minPrice ?? filterOptions.priceRange.min,
  );
  const [max, setMax] = useState(
    activeFilters.maxPrice ?? filterOptions.priceRange.max,
  );

  useEffect(() => {
    setMin(activeFilters.minPrice ?? filterOptions.priceRange.min);
    setMax(activeFilters.maxPrice ?? filterOptions.priceRange.max);
  }, [activeFilters.minPrice, activeFilters.maxPrice, filterOptions.priceRange]);

  const apply = () => {
    onFilterChange({
      minPrice: min !== filterOptions.priceRange.min ? min : undefined,
      maxPrice: max !== filterOptions.priceRange.max ? max : undefined,
    });
  };

  return (
    <div>
      <label className="font-medium text-sm text-gray-700 block mb-1">
        Price Range
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={filterOptions.priceRange.min}
          max={filterOptions.priceRange.max}
          value={min}
          onChange={(e) => setMin(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
        />
        <span className="text-gray-400">—</span>
        <input
          type="number"
          min={filterOptions.priceRange.min}
          max={filterOptions.priceRange.max}
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
