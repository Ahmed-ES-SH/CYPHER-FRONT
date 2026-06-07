"use client";
import { useState, useEffect } from "react";
import type { FilterOptions, ProductQuery } from "@/src/modules/products";

interface Props {
  filterOptions: FilterOptions;
  activeFilters: ProductQuery;
  onFilterChange: (updates: Partial<ProductQuery>) => void;
}

export default function DiscountRange({
  filterOptions,
  activeFilters,
  onFilterChange,
}: Props) {
  const [min, setMin] = useState(
    activeFilters.minDiscount ?? filterOptions.discountRange.min,
  );
  const [max, setMax] = useState(
    activeFilters.maxDiscount ?? filterOptions.discountRange.max,
  );

  useEffect(() => {
    setMin(activeFilters.minDiscount ?? filterOptions.discountRange.min);
    setMax(activeFilters.maxDiscount ?? filterOptions.discountRange.max);
  }, [activeFilters.minDiscount, activeFilters.maxDiscount, filterOptions.discountRange]);

  const apply = () => {
    onFilterChange({
      minDiscount: min !== filterOptions.discountRange.min ? min : undefined,
      maxDiscount: max !== filterOptions.discountRange.max ? max : undefined,
    });
  };

  return (
    <div>
      <label className="font-medium text-sm text-gray-700 block mb-1">
        Discount %
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={filterOptions.discountRange.min}
          max={filterOptions.discountRange.max}
          value={min}
          onChange={(e) => setMin(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
        />
        <span className="text-gray-400">—</span>
        <input
          type="number"
          min={filterOptions.discountRange.min}
          max={filterOptions.discountRange.max}
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
