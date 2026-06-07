"use client";
import type { FilterOptions, ProductQuery } from "@/src/modules/products";

interface Props {
  filterOptions: FilterOptions;
  activeFilters: ProductQuery;
  onFilterChange: (updates: Partial<ProductQuery>) => void;
}

export default function CategoryTree({
  filterOptions,
  activeFilters,
  onFilterChange,
}: Props) {
  const selected = activeFilters.categoryIds
    ? activeFilters.categoryIds.split(",")
    : [];

  const handleToggle = (id: string) => {
    const updated = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onFilterChange({
      categoryIds: updated.length ? updated.join(",") : undefined,
      categorySlug: undefined,
    });
  };

  return (
    <div>
      <label className="font-medium text-sm text-gray-700 block mb-1">
        Categories
      </label>
      <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 rounded-md p-2">
        {filterOptions.categories.map((cat) => (
          <label
            key={cat.id}
            className="flex items-center gap-2 cursor-pointer py-1"
          >
            <input
              type="checkbox"
              checked={selected.includes(cat.id)}
              onChange={() => handleToggle(cat.id)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-800 flex-1">{cat.name}</span>
            <span className="text-xs text-gray-400">({cat.productCount})</span>
          </label>
        ))}
        {filterOptions.categories.length === 0 && (
          <p className="text-xs text-gray-400 py-2">No categories available</p>
        )}
      </div>
    </div>
  );
}
