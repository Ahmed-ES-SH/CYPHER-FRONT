"use client";
import { useState, useEffect, useRef } from "react";
import type { ProductQuery } from "@/src/modules/products";

interface Props {
  activeFilters: ProductQuery;
  onFilterChange: (updates: Partial<ProductQuery>) => void;
}

export default function SearchBox({ activeFilters, onFilterChange }: Props) {
  const [value, setValue] = useState(activeFilters.search || "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(activeFilters.search || "");
  }, [activeFilters.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onFilterChange({ search: v || undefined });
    }, 300);
  };

  return (
    <div>
      <label className="font-medium text-sm text-gray-700 block mb-1">
        Search
      </label>
      <input
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
      />
    </div>
  );
}
