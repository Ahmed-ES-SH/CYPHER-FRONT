"use client";

import { useState, memo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  FiUserPlus,
  FiBell,
  FiShoppingBag,
  FiBarChart2,
  FiSettings,
  FiDollarSign,
  FiUsers,
  FiActivity,
  FiTrendingUp,
} from "react-icons/fi";
import { useUsers, useUserStats, useDeleteUser } from "../../hooks/useUser.hook";
import { useUserFilters } from "../../hooks/useUserFilters.hook";
import UserListTable from "../ui/UserListTable";
import UserStatsCards from "../ui/UserStatsCards";
import UserFilters from "../ui/UserFilters";
import EditUserModal from "../forms/EditUserModal";
import type { User } from "../../types/user.types";

const LazyChartsSection = dynamic(
  () => import("./sections/ChartsSection").then((mod) => mod.ChartsSection),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] w-full rounded-xl bg-gray-100 animate-pulse flex items-center justify-center text-text-muted">
        Loading Analytics Dashboard...
      </div>
    ),
  }
);

const QUICK_ACTIONS = [
  { label: "Add New User", description: "Create a new account", icon: FiUserPlus, href: "/admin/users", color: "bg-blue-100 text-primary-blue" },
  { label: "Send Notification", description: "Broadcast to users", icon: FiBell, href: "/admin/notifications", color: "bg-purple-100 text-purple-600" },
  { label: "View Orders", description: "Check recent orders", icon: FiShoppingBag, href: "#", color: "bg-green-100 text-green-600" },
  { label: "View Reports", description: "Analytics overview", icon: FiBarChart2, href: "#", color: "bg-amber-100 text-amber-600" },
  { label: "Site Settings", description: "Configure platform", icon: FiSettings, href: "#", color: "bg-slate-100 text-slate-600" },
];

const DUMMY_KPIS = [
  { label: "Total Revenue", value: "$124,592", change: "+12.5%", trend: "up", icon: FiDollarSign, color: "bg-green-100 text-green-600" },
  { label: "Total Users", value: "8,430", change: "+8.2%", trend: "up", icon: FiUsers, color: "bg-blue-100 text-primary-blue" },
  { label: "Active Sessions", value: "342", change: "+0.5%", trend: "neutral", icon: FiActivity, color: "bg-amber-100 text-amber-600" },
  { label: "Conversion Rate", value: "3.2%", change: "+1.2%", trend: "up", icon: FiTrendingUp, color: "bg-purple-100 text-purple-600" },
];

const QuickActionsSection = memo(function QuickActionsSection() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-4 rounded-xl border border-border-subtle bg-surface-elevated p-5 hover:shadow-md transition-shadow group"
          >
            <div className={`rounded-lg p-3 ${action.color}`}>
              <action.icon className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary-blue transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
});

const KPIsSection = memo(function KPIsSection() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Key Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DUMMY_KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border-subtle bg-surface-elevated p-5 flex items-center gap-4"
          >
            <div className={`rounded-lg p-3 ${kpi.color}`}>
              <kpi.icon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold text-text-primary mt-0.5">
                {kpi.value}
              </p>
              <p
                className={`text-xs font-medium mt-0.5 ${
                  kpi.trend === "up"
                    ? "text-green-600"
                    : kpi.trend === "down"
                      ? "text-red-600"
                      : "text-text-muted"
                }`}
              >
                {kpi.change} {kpi.trend === "up" ? "↑" : kpi.trend === "down" ? "↓" : "→"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

export function AdminDashboardPage() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">
          Overview and quick actions for your store.
        </p>
      </div>

      <QuickActionsSection />

      <KPIsSection />

      <LazyChartsSection stats={stats} />

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Live Data</h2>
        <UserStatsCards stats={stats} isLoading={statsLoading} />

        <div className="mt-4">
          <UserFilters
            search={search}
            role={role}
            status={status}
            onFilterChange={updateFilter}
          />
        </div>

        <div className="mt-4">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <UserListTable
              users={usersData?.data ?? []}
              onEdit={setEditingUser}
              onDelete={handleDelete}
            />
          )}
        </div>

        {usersData && usersData.lastPage > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              disabled={page <= 1}
              onClick={() => updateFilter("page", String(page - 1))}
              className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">
              Page {usersData.page} of {usersData.lastPage}
            </span>
            <button
              disabled={page >= usersData.lastPage}
              onClick={() => updateFilter("page", String(page + 1))}
              className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}
