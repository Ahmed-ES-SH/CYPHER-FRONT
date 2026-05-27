"use client";

import { useState } from "react";
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
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useUsers, useUserStats, useDeleteUser } from "../../hooks/useUser.hook";
import { useUserFilters } from "../../hooks/useUserFilters.hook";
import UserListTable from "../ui/UserListTable";
import UserStatsCards from "../ui/UserStatsCards";
import UserFilters from "../ui/UserFilters";
import EditUserModal from "../forms/EditUserModal";
import type { User } from "../../types/user.types";

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

const MONTHLY_REVENUE = [
  { month: "Jan", revenue: 4000, orders: 240 },
  { month: "Feb", revenue: 3000, orders: 198 },
  { month: "Mar", revenue: 5200, orders: 305 },
  { month: "Apr", revenue: 4800, orders: 275 },
  { month: "May", revenue: 6100, orders: 358 },
  { month: "Jun", revenue: 5800, orders: 340 },
  { month: "Jul", revenue: 7200, orders: 420 },
  { month: "Aug", revenue: 6900, orders: 398 },
  { month: "Sep", revenue: 8100, orders: 470 },
  { month: "Oct", revenue: 7500, orders: 435 },
  { month: "Nov", revenue: 9200, orders: 520 },
  { month: "Dec", revenue: 10500, orders: 600 },
];

const MONTHLY_SIGNUPS = [
  { month: "Jan", verified: 120, unverified: 45 },
  { month: "Feb", verified: 95, unverified: 38 },
  { month: "Mar", verified: 145, unverified: 52 },
  { month: "Apr", verified: 130, unverified: 41 },
  { month: "May", verified: 165, unverified: 55 },
  { month: "Jun", verified: 155, unverified: 48 },
  { month: "Jul", verified: 180, unverified: 62 },
  { month: "Aug", verified: 170, unverified: 58 },
  { month: "Sep", verified: 200, unverified: 70 },
  { month: "Oct", verified: 190, unverified: 65 },
  { month: "Nov", verified: 220, unverified: 78 },
  { month: "Dec", verified: 250, unverified: 90 },
];

const ROLE_DISTRIBUTION = [
  { name: "Admin", value: 15, color: "#0070dc" },
  { name: "User", value: 85, color: "#00b8db" },
];

const ORDER_STATUS = [
  { name: "Pending", value: 25, color: "#facc15" },
  { name: "Shipped", value: 35, color: "#0070dc" },
  { name: "Delivered", value: 30, color: "#16a34a" },
  { name: "Cancelled", value: 10, color: "#ef4444" },
];

function QuickActionsSection() {
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
}

function KPIsSection() {
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
}

function ChartsSection() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Analytics (Demo)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-5">
          <p className="text-sm font-medium text-text-secondary mb-4">Monthly Revenue & Orders</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MONTHLY_REVENUE}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0070dc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0070dc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0070dc"
                fill="url(#revenueGradient)"
                strokeWidth={2}
                name="Revenue ($)"
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#00b8db"
                fill="none"
                strokeWidth={2}
                strokeDasharray="4 4"
                name="Orders"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-5">
          <p className="text-sm font-medium text-text-secondary mb-4">Monthly User Signups</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MONTHLY_SIGNUPS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="verified" stackId="a" fill="#0070dc" name="Verified" />
              <Bar dataKey="unverified" stackId="a" fill="#facc15" name="Unverified" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-5">
          <p className="text-sm font-medium text-text-secondary mb-4">User Role Distribution</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={ROLE_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {ROLE_DISTRIBUTION.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-5">
          <p className="text-sm font-medium text-text-secondary mb-4">Order Status</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={ORDER_STATUS}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {ORDER_STATUS.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

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

      <ChartsSection />

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
