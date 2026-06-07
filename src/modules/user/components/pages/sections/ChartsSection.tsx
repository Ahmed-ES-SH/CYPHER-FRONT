"use client";

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
import type { UserStats } from "../../../types/user.types";

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

const ORDER_STATUS = [
  { name: "Pending", value: 25, color: "#facc15" },
  { name: "Shipped", value: 35, color: "#0070dc" },
  { name: "Delivered", value: 30, color: "#16a34a" },
  { name: "Cancelled", value: 10, color: "#ef4444" },
];

interface ChartsSectionProps {
  stats?: UserStats;
}

export function ChartsSection({ stats }: ChartsSectionProps) {
  const roleDistribution = stats
    ? [
        { name: "Admin", value: stats.adminsNumber, color: "#0070dc" },
        {
          name: "User",
          value: stats.verifiedUsersNumber + stats.unverifiedUsersNumber - stats.adminsNumber,
          color: "#00b8db",
        },
      ]
    : [];

  return (
    <section>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Analytics</h2>
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
                data={roleDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {roleDistribution.map((entry) => (
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
