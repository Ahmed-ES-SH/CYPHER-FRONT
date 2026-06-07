"use client";

import React, { useState } from "react";

interface Props {
  search: string;
  sortBy: string;
  sortOrder: string;
  limit: number;
  updateFilter: (key: string, value: string | number | null) => void;
}

export default function CategoryFilters({ search, sortBy, sortOrder, limit, updateFilter }: Props) {
  const [q, setQ] = useState(search || "");

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
      <div className="flex-1">
        <input
          placeholder="Search categories"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") updateFilter("search", q); }}
          className="w-full rounded-md border border-border-subtle p-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <select value={String(limit)} onChange={(e) => updateFilter("limit", Number(e.target.value))} className="rounded-md border border-border-subtle p-2">
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>

        <select value={sortBy || ""} onChange={(e) => updateFilter("sortBy", e.target.value)} className="rounded-md border border-border-subtle p-2">
          <option value="">Sort</option>
          <option value="name">Name</option>
          <option value="order">Order</option>
          <option value="createdAt">Created</option>
        </select>

        <select value={sortOrder || ""} onChange={(e) => updateFilter("sortOrder", e.target.value)} className="rounded-md border border-border-subtle p-2">
          <option value="">Order</option>
          <option value="ASC">ASC</option>
          <option value="DESC">DESC</option>
        </select>

        <button onClick={() => updateFilter("search", q)} className="rounded-md bg-primary-blue text-white px-3 py-2">Search</button>
      </div>
    </div>
  );
}
