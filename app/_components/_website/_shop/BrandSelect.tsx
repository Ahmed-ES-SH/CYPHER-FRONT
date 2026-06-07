"use client";
import type { FilterOptions, ProductQuery } from "@/src/modules/products";

interface Props {
  filterOptions: FilterOptions;
  activeFilters: ProductQuery;
  onFilterChange: (updates: Partial<ProductQuery>) => void;
}

export default function BrandSelect({
  filterOptions,
  activeFilters,
  onFilterChange,
}: Props) {
  if (filterOptions.brands.length === 0) return null;

  return (
    <div>
      <label className="font-medium text-sm text-gray-700 block mb-1">
        Brand
      </label>
      <select
        value={activeFilters.brand ?? ""}
        onChange={(e) =>
          onFilterChange({ brand: e.target.value || undefined })
        }
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
      >
        <option value="">All Brands</option>
        {filterOptions.brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>
    </div>
  );
}
