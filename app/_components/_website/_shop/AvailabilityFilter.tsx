"use client";
import type { ProductQuery } from "@/src/modules/products";

interface Props {
  activeFilters: ProductQuery;
  onFilterChange: (updates: Partial<ProductQuery>) => void;
}

export default function AvailabilityFilter({
  activeFilters,
  onFilterChange,
}: Props) {
  return (
    <div>
      <label className="font-medium text-sm text-gray-700 block mb-1">
        Availability
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!!activeFilters.inStockOnly}
          onChange={(e) =>
            onFilterChange({
              inStockOnly: e.target.checked || undefined,
            })
          }
          className="w-4 h-4 accent-blue-600"
        />
        <span className="text-sm text-gray-800">In Stock Only</span>
      </label>
    </div>
  );
}
