"use client";
import { useShopContext } from "@/app/(pathes)/shop/ShopProvider";
import React from "react";
import { FaTimes } from "react-icons/fa";

export default function SelectedCategories() {
  const { activeFilters, onFilterChange } = useShopContext();

  const chips: { label: string; remove: () => void }[] = [];

  if (activeFilters.search) {
    chips.push({
      label: `Search: "${activeFilters.search}"`,
      remove: () => onFilterChange({ search: undefined }),
    });
  }

  if (activeFilters.brand) {
    chips.push({
      label: `Brand: ${activeFilters.brand}`,
      remove: () => onFilterChange({ brand: undefined }),
    });
  }

  if (activeFilters.categoryIds) {
    activeFilters.categoryIds.split(",").forEach((id) => {
      chips.push({
        label: `Category: ${id.slice(0, 8)}...`,
        remove: () => {
          const remaining = (activeFilters.categoryIds ?? "")
            .split(",")
            .filter((c) => c !== id)
            .join(",");
          onFilterChange({
            categoryIds: remaining || undefined,
          });
        },
      });
    });
  }

  if (activeFilters.minPrice !== undefined) {
    chips.push({
      label: `Min Price: $${activeFilters.minPrice}`,
      remove: () => onFilterChange({ minPrice: undefined }),
    });
  }

  if (activeFilters.maxPrice !== undefined) {
    chips.push({
      label: `Max Price: $${activeFilters.maxPrice}`,
      remove: () => onFilterChange({ maxPrice: undefined }),
    });
  }

  if (activeFilters.minDiscount !== undefined) {
    chips.push({
      label: `Min Discount: ${activeFilters.minDiscount}%`,
      remove: () => onFilterChange({ minDiscount: undefined }),
    });
  }

  if (activeFilters.maxDiscount !== undefined) {
    chips.push({
      label: `Max Discount: ${activeFilters.maxDiscount}%`,
      remove: () => onFilterChange({ maxDiscount: undefined }),
    });
  }

  if (activeFilters.minRating !== undefined) {
    chips.push({
      label: `Min Rating: ${activeFilters.minRating}\u2605`,
      remove: () => onFilterChange({ minRating: undefined }),
    });
  }

  if (activeFilters.onSale) {
    chips.push({
      label: "On Sale",
      remove: () => onFilterChange({ onSale: undefined }),
    });
  }

  if (activeFilters.inStockOnly) {
    chips.push({
      label: "In Stock Only",
      remove: () => onFilterChange({ inStockOnly: undefined }),
    });
  }

  if (activeFilters.tags) {
    activeFilters.tags.split(",").forEach((tag) => {
      chips.push({
        label: tag,
        remove: () => {
          const remaining = (activeFilters.tags ?? "")
            .split(",")
            .filter((t) => t !== tag)
            .join(",");
          onFilterChange({
            tags: remaining || undefined,
          });
        },
      });
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="w-[97%] m-auto h-fit py-4 px-2">
      <ul className="flex items-center gap-2 flex-wrap">
        {chips.map((chip, index) => (
          <li
            key={index}
            onClick={chip.remove}
            className="cursor-pointer whitespace-nowrap text-[14px] font-light flex items-center gap-2 rounded-md px-2 py-1 border border-gray-200 hover:bg-gray-200 duration-300"
          >
            <FaTimes className="text-red-200" />
            <p>{chip.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
