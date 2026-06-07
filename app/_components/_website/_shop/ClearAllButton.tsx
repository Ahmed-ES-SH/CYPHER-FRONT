"use client";
import { MdClearAll } from "react-icons/md";

interface Props {
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export default function ClearAllButton({
  hasActiveFilters,
  onClearAll,
}: Props) {
  if (!hasActiveFilters) return null;

  return (
    <button
      onClick={onClearAll}
      className="w-full flex items-center justify-center gap-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md py-2 hover:bg-red-100 transition"
    >
      <MdClearAll />
      Clear All Filters
    </button>
  );
}
