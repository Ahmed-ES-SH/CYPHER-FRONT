"use client";
import type { FilterOptions, ProductQuery } from "@/src/modules/products";

interface Props {
  filterOptions: FilterOptions;
  activeFilters: ProductQuery;
  onFilterChange: (updates: Partial<ProductQuery>) => void;
}

export default function TagCloud({
  filterOptions,
  activeFilters,
  onFilterChange,
}: Props) {
  if (filterOptions.tags.length === 0) return null;

  const selectedTags = activeFilters.tags
    ? activeFilters.tags.split(",")
    : [];

  const handleToggle = (tag: string) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    onFilterChange({
      tags: updated.length ? updated.join(",") : undefined,
    });
  };

  return (
    <div>
      <label className="font-medium text-sm text-gray-700 block mb-1">
        Tags
      </label>
      <div className="flex flex-wrap gap-1.5">
        {filterOptions.tags.slice(0, 20).map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleToggle(tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${
                isSelected
                  ? "bg-primary-blue text-white border-primary-blue"
                  : "bg-white text-gray-600 border-gray-300 hover:border-primary-blue"
              }`}
            >
              {tag}
            </button>
          );
        })}
        {filterOptions.tags.length > 20 && (
          <p className="text-xs text-gray-400 w-full pt-1">
            +{filterOptions.tags.length - 20} more
          </p>
        )}
      </div>
    </div>
  );
}
