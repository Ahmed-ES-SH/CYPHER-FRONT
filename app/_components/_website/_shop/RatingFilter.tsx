"use client";
import type { ProductQuery } from "@/src/modules/products";

interface Props {
  activeFilters: ProductQuery;
  onFilterChange: (updates: Partial<ProductQuery>) => void;
}

export default function RatingFilter({
  activeFilters,
  onFilterChange,
}: Props) {
  const current = activeFilters.minRating ?? 0;

  return (
    <div>
      <label className="font-medium text-sm text-gray-700 block mb-1">
        Minimum Rating
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() =>
              onFilterChange({
                minRating: current === star ? undefined : star,
              })
            }
            className={`text-xl transition ${
              star <= current ? "text-yellow-400" : "text-gray-300"
            } hover:scale-110`}
          >
            {star <= current ? "\u2605" : "\u2606"}
          </button>
        ))}
      </div>
    </div>
  );
}
