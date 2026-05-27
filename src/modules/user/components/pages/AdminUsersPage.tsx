"use client";

import { useUsers, useUserStats, useDeleteUser } from "../../hooks/useUser.hook";
import { useUserFilters } from "../../hooks/useUserFilters.hook";
import UserListTable from "../ui/UserListTable";
import UserStatsCards from "../ui/UserStatsCards";
import UserFilters from "../ui/UserFilters";
import type { User } from "../../types/user.types";

export function AdminUsersPage() {
  const { page, search, role, status, updateFilter } = useUserFilters();

  const filters: Record<string, string> = {};
  if (search) filters.search = search;
  if (role) filters.role = role;
  if (status) filters.status = status;
  if (page > 1) filters.page = String(page);

  const { data: usersData, isLoading: usersLoading } = useUsers(filters);
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { mutateAsync: deleteUser } = useDeleteUser();

  const handleDelete = async (user: User) => {
    if (window.confirm(`Delete user ${user.name || user.email}?`)) {
      await deleteUser(user.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all registered users, their roles, and account statuses.
        </p>
      </div>

      <UserStatsCards stats={stats} isLoading={statsLoading} />

      <UserFilters
        search={search}
        role={role}
        status={status}
        onFilterChange={updateFilter}
      />

      {usersLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <UserListTable
          users={usersData?.data ?? []}
          onDelete={handleDelete}
        />
      )}

      {usersData && usersData.lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => updateFilter("page", String(page - 1))}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {usersData.page} of {usersData.lastPage}
          </span>
          <button
            disabled={page >= usersData.lastPage}
            onClick={() => updateFilter("page", String(page + 1))}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
