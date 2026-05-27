"use client";

import { useCallback, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { UserRole, UserStatus } from "../../types/user.types";

interface UserFiltersProps {
  search: string;
  role: string;
  status: string;
  onFilterChange: (key: string, value: string) => void;
}

const ROLES: { label: string; value: UserRole | "" }[] = [
  { label: "All Roles", value: "" },
  { label: "User", value: UserRole.USER },
  { label: "Admin", value: UserRole.ADMIN },
];

const STATUSES: { label: string; value: UserStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: UserStatus.ACTIVE },
  { label: "Inactive", value: UserStatus.INACTIVE },
  { label: "Banned", value: UserStatus.BANNED },
];

export default function UserFilters({ search, role, status, onFilterChange }: UserFiltersProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFilterChange("search", value);
      }, 400);
    },
    [onFilterChange],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
        <input
          type="text"
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <select
        value={role}
        onChange={(e) => onFilterChange("role", e.target.value)}
        className="rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => onFilterChange("status", e.target.value)}
        className="rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
