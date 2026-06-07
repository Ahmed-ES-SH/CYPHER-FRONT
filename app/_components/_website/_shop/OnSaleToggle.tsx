"use client";
import type { ProductQuery } from "@/src/modules/products";

interface Props {
  activeFilters: ProductQuery;
  onFilterChange: (updates: Partial<ProductQuery>) => void;
}

export default function OnSaleToggle({
  activeFilters,
  onFilterChange,
}: Props) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <span className="font-medium text-sm text-gray-700">On Sale</span>
      <button
        type="button"
        role="switch"
        aria-checked={!!activeFilters.onSale}
        onClick={() =>
          onFilterChange({
            onSale: activeFilters.onSale ? undefined : true,
          })
        }
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          activeFilters.onSale ? "bg-primary-blue" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            activeFilters.onSale ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
