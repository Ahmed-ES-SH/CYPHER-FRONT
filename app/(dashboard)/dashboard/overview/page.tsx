"use client";

import Link from "next/link";
import { FiUserPlus, FiBell, FiShoppingBag, FiBarChart2, FiSettings, FiUsers, FiTrendingUp, FiDollarSign, FiPackage, FiSmartphone, FiHeadphones, FiWifi, FiMonitor } from "react-icons/fi";
import { useAdminOrders, formatMoney } from "@/src/modules/orders";
import { useUserStats } from "@/src/modules/user";

interface QuickAction {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  count?: number;
  countLoading?: boolean;
}

const SalesChartSVG = () => (
  <div className="flex-1 min-h-75 relative w-full flex items-end" role="img" aria-label="Sales performance chart showing an upward trend from January to June">
    <div className="absolute inset-0 flex flex-col justify-between pb-8">
      <div className="w-full h-px bg-border-subtle/50" />
      <div className="w-full h-px bg-border-subtle/50" />
      <div className="w-full h-px bg-border-subtle/50" />
      <div className="w-full h-px bg-border-subtle/50" />
      <div className="w-full h-px bg-border-subtle" />
    </div>

    <div className="absolute inset-0 pb-8 pl-8">
      <svg className="w-full h-full" preserveAspectRatio="xMidYMid meet" viewBox="0 0 800 300" aria-hidden="true">
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-blue)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--primary-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,250 C100,220 200,280 300,180 C400,80 500,150 600,100 C700,50 800,20 800,20 L800,300 L0,300 Z" fill="url(#chartGradient)" />
        <path d="M0,250 C100,220 200,280 300,180 C400,80 500,150 600,100 C700,50 800,20 800,20" fill="none" stroke="var(--primary-blue)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        <circle cx="300" cy="180" fill="#ffffff" r="6" stroke="var(--primary-blue)" strokeWidth="3" />
        <circle cx="600" cy="100" fill="#ffffff" r="6" stroke="var(--primary-blue)" strokeWidth="3" />
      </svg>
    </div>

    <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-text-muted">
      <span>$3M</span>
      <span>$2M</span>
      <span>$1M</span>
      <span>$500k</span>
      <span>0</span>
    </div>

    <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-text-muted pt-2">
      <span>Jan</span>
      <span>Feb</span>
      <span>Mar</span>
      <span>Apr</span>
      <span>May</span>
      <span>Jun</span>
    </div>
  </div>
);

export default function OverviewPage() {
  const { data, isLoading } = useAdminOrders({ page: 1, limit: 5 });
  const orders = data?.data ?? [];
  const { data: userStats, isLoading: userStatsLoading } = useUserStats();

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-display font-semibold text-text-primary">Dashboard Overview</h2>
          <p className="text-sm text-text-secondary mt-1">Welcome back. Here's what's happening with your store today.</p>
        </div>

        <div className="flex items-center gap-3">
          <select className="bg-surface-elevated border border-border-subtle rounded-md px-3 py-2 text-sm">
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(
            [
              {
                label: "Add New User",
                description: "Create a new account",
                icon: FiUserPlus,
                href: "/dashboard/users/new",
                color: "bg-blue-100 text-primary-blue",
              },
              {
                label: "Users",
                description: "Manage users",
                icon: FiUsers,
                href: "/dashboard/users",
                color: "bg-blue-100 text-primary-blue",
                count:
                  (userStats?.verifiedUsersNumber ?? 0) + (userStats?.unverifiedUsersNumber ?? 0),
                countLoading: userStatsLoading,
              },
              {
                label: "Send Notification",
                description: "Broadcast to users",
                icon: FiBell,
                href: "/dashboard/notifications",
                color: "bg-purple-100 text-purple-600",
              },
              {
                label: "View Orders",
                description: "Check recent orders",
                icon: FiShoppingBag,
                href: "/dashboard/orders",
                color: "bg-green-100 text-green-600",
              },
              {
                label: "View Reports",
                description: "Analytics overview",
                icon: FiBarChart2,
                href: "/dashboard/reports",
                color: "bg-amber-100 text-amber-600",
              },
              {
                label: "Site Settings",
                description: "Configure platform",
                icon: FiSettings,
                href: "/dashboard/settings",
                color: "bg-slate-100 text-slate-600",
              },
            ] as QuickAction[]
          ).map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface-elevated p-5 transition-shadow group"
            >
              <div className={`rounded-lg p-3 ${action.color}`}>
                <action.icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-text-primary group-hover:text-primary-blue transition-colors">{action.label}</p>
                  {action.count !== undefined && (
                    <div className="text-sm font-bold text-text-primary">
                      {action.countLoading ? "..." : action.count}
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-elevated border border-border-subtle rounded-lg p-6 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="text-sm text-text-secondary">Total Sales</span>
            <div className="p-2 bg-primary-cyan/10 rounded-lg text-primary-cyan">
              <FiTrendingUp className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold">$2.4M</div>
          <div className="flex items-center gap-2 mt-auto pt-2 text-sm text-text-secondary">
            <span className="text-green-600">+12.5%</span>
            <span className="text-text-muted">vs last month</span>
          </div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-lg p-6 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="text-sm text-text-secondary">Monthly Orders</span>
            <div className="p-2 bg-primary-cyan/10 rounded-lg text-primary-cyan">
              <FiShoppingBag className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold">12.5k</div>
          <div className="flex items-center gap-2 mt-auto pt-2 text-sm text-text-secondary">
            <span className="text-green-600">+8.2%</span>
            <span className="text-text-muted">vs last month</span>
          </div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-lg p-6 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="text-sm text-text-secondary">Average Order Value</span>
            <div className="p-2 bg-primary-cyan/10 rounded-lg text-primary-cyan">
              <FiDollarSign className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold">$192</div>
          <div className="flex items-center gap-2 mt-auto pt-2 text-sm text-text-secondary">
            <span className="text-green-600">+3.1%</span>
            <span className="text-text-muted">vs last month</span>
          </div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-lg p-6 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="text-sm text-text-secondary">Active Inventory</span>
            <div className="p-2 bg-primary-cyan/10 rounded-lg text-primary-cyan">
              <FiPackage className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold">842</div>
          <div className="flex items-center gap-2 mt-auto pt-2 text-sm text-text-secondary">
            <span className="text-red-600">-12 items</span>
            <span className="text-text-muted">vs last week</span>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-surface-elevated border border-border-subtle rounded-lg p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Sales Performance</h3>
            <button className="p-2 rounded-md hover:bg-surface-container-low transition-colors text-text-muted" aria-label="More options">⋮</button>
          </div>
          <SalesChartSVG />
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-lg p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top Selling Categories</h3>
          <div className="flex flex-col gap-4">
            {[
              { name: "Laptops & Computers", pct: 45, icon: "laptop_mac" },
              { name: "Audio & Headphones", pct: 32, icon: "headphones" },
              { name: "Smart Home", pct: 18, icon: "smart_toy" },
              { name: "Wearables", pct: 5, icon: "watch" },
            ].map((c) => (
              <div key={c.name}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-primary text-lg">●</span>
                    <span className="text-sm font-medium text-text-primary">{c.name}</span>
                  </div>
                  <span className="font-semibold">{c.pct}%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-elevated border border-border-subtle rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Recent Orders</h3>
            <Link className="text-sm text-primary hover:underline" href="/dashboard/orders">View All Orders</Link>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-sm text-text-secondary pb-2 border-b border-border-subtle font-medium">Order ID</th>
                  <th className="text-sm text-text-secondary pb-2 border-b border-border-subtle font-medium">Customer</th>
                  <th className="text-sm text-text-secondary pb-2 border-b border-border-subtle font-medium">Date</th>
                  <th className="text-sm text-text-secondary pb-2 border-b border-border-subtle font-medium">Amount</th>
                  <th className="text-sm text-text-secondary pb-2 border-b border-border-subtle font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-text-primary">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">Loading...</td>
                  </tr>
                ) : (
                  orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                      <td className="py-3 border-b border-border-subtle font-semibold group-hover:text-primary">{order.orderNumber ?? order.id}</td>
                      <td className="py-3 border-b border-border-subtle">{order.customerName ?? order.customer?.name ?? "—"}</td>
                      <td className="py-3 border-b border-border-subtle text-text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 border-b border-border-subtle font-semibold">{formatMoney(order.total ?? order.amount ?? 0)}</td>
                      <td className="py-3 border-b border-border-subtle">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold tracking-wide bg-primary-fixed text-on-primary-fixed">{order.status ?? "Delivered"}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-lg p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">Inventory Alerts</h3>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { title: "CYPHER Phone Pro", note: "Only 4 left in stock", Icon: FiSmartphone },
              { title: "Noise Cancelling Earbuds", note: "Only 12 left in stock", Icon: FiHeadphones },
              { title: "Mesh Wi-Fi System", note: "Low stock: 24 remaining", Icon: FiWifi },
              { title: "Mechanical Keyboard V2", note: "Low stock: 30 remaining", Icon: FiMonitor },
            ].map((it) => (
              <div key={it.title} className="flex items-center gap-4 p-3 rounded-lg border border-border-subtle bg-surface hover:border-primary transition-colors">
                <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center text-icon-color">
                  <it.Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-primary truncate">{it.title}</h4>
                  <p className="text-sm text-red-600 font-medium">{it.note}</p>
                </div>
                <button className="text-primary text-sm font-medium">Restock</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
