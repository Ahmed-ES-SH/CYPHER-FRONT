"use client";

import React, { useMemo, useState } from "react";
import PaymentsTable from "@/app/_components/_dashboard/Payments/PaymentsTable";
import PaymentDetailPanel from "@/app/_components/_dashboard/Payments/PaymentDetailPanel";
import { useAdminPaymentHistory, getAdminPaymentHistoryApi, PaymentStatus, PaymentMethod } from "@/src/modules/payments";
import { FiDownload } from "react-icons/fi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export default function PaymentsPage() {
  // Filters applied to the real data query
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const { data, isLoading } = useAdminPaymentHistory(filters as any);

  // UI state for filter controls (apply/clear)
  const [status, setStatus] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const handleExport = async () => {
    try {
      const res = await getAdminPaymentHistoryApi(filters as any);
      const rows = res.data || [];
      const csv = ["id,orderNumber,method,status,amount,createdAt"].concat(
        rows.map((r: any) => `${r.id},${r.orderNumber},${r.method},${r.status},${r.amount?.amount ?? 0},${r.createdAt}`),
      ).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payments-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // noop — keep simple for now
    }
  };

  const applyFilters = () => {
    const next: Record<string, any> = {};
    if (status) next.status = status;
    if (method) next.method = method;
    if (dateFrom) next.dateFrom = dateFrom;
    if (dateTo) next.dateTo = dateTo;
    setFilters(next);
  };

  const resetFilters = () => {
    setStatus("");
    setMethod("");
    setDateFrom("");
    setDateTo("");
    setFilters({});
  };

  // Static KPI data (placeholder)
  const kpis = useMemo(
    () => [
      { label: "Total Volume", value: "$24,500" },
      { label: "Total Transactions", value: "1,234" },
      { label: "Refunds", value: "12" },
      { label: "Avg. Transaction", value: "$19.86" },
    ],
    [],
  );

  // Static chart data (placeholder)
  const chartSeries = useMemo(
    () => ({
      last7: [120, 200, 150, 220, 180, 240, 200],
      avg7: [22, 18, 25, 19, 23, 20, 24],
      methods: [
        { name: "Stripe", value: 60 },
        { name: "PayPal", value: 25 },
        { name: "Bank", value: 15 },
      ],
      status: [
        { name: "Succeeded", value: 75 },
        { name: "Failed", value: 15 },
        { name: "Pending", value: 10 },
      ],
    }),
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Payments</h2>
          <p className="text-sm text-text-secondary">Transaction history and management</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="rounded-lg border border-border-subtle px-3 py-2 flex items-center gap-2">
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border-subtle bg-surface-elevated p-4">
            <div className="text-xs text-text-secondary">{k.label}</div>
            <div className="text-xl font-semibold mt-2">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Charts (new design using Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Volume area chart */}
        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Volume (last 7 days)</div>
              <div className="text-xs text-text-secondary">Transactions per day</div>
            </div>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartSeries.last7.map((v, i) => ({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] ?? `D${i + 1}`, value: v }))}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0070dc" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0070dc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#0070dc" fill="url(#volGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payments by Method (donut + legend) */}
        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4">
          <div>
            <div className="text-sm font-medium">Payments by Method</div>
            <div className="text-xs text-text-secondary">Share by payment provider</div>
          </div>
          <div className="mt-4 h-56 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartSeries.methods}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent ?? 0) * 100 | 0}%`}
                  >
                    {chartSeries.methods.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={["#0070dc", "#00b8db", "#facc15", "#16a34a"][i % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 pl-4">
              {chartSeries.methods.map((m, i) => (
                <div key={m.name} className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span style={{ width: 12, height: 12, backgroundColor: ["#0070dc", "#00b8db", "#facc15", "#16a34a"][i % 4] }} className="rounded-sm inline-block" />
                    <div className="text-sm">{m.name}</div>
                  </div>
                  <div className="font-medium">{m.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Avg transaction line chart */}
        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4">
          <div>
            <div className="text-sm font-medium">Avg. Transaction (last 7 days)</div>
            <div className="text-xs text-text-secondary">Average order value</div>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSeries.avg7.map((v, i) => ({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], avg: v }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payments by Status (horizontal bars) */}
        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4">
          <div>
            <div className="text-sm font-medium">Payments by Status</div>
            <div className="text-xs text-text-secondary">Distribution by status</div>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSeries.status} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip />
                <Bar dataKey="value" barSize={16}>
                  {chartSeries.status.map((entry, idx) => (
                    <Cell key={`cell-status-${idx}`} fill={["#16a34a", "#ef4444", "#f59e0b"][idx % 3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border-subtle px-3 py-2 text-sm">
              <option value="">All</option>
              {Object.values(PaymentStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-lg border border-border-subtle px-3 py-2 text-sm">
              <option value="">All</option>
              {Object.values(PaymentMethod).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-border-subtle px-3 py-2 text-sm" />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-border-subtle px-3 py-2 text-sm" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={resetFilters} className="rounded-lg border border-border-subtle px-3 py-2 text-sm">Reset</button>
            <button onClick={applyFilters} className="rounded-lg bg-primary-blue text-white px-3 py-2 text-sm">Apply</button>
          </div>
        </div>
      </div>

      <PaymentsTable
        transactions={data?.data ?? []}
        onSelect={(id) => setSelectedId(id)}
        loading={isLoading}
      />

      <PaymentDetailPanel id={selectedId} onClose={() => setSelectedId(undefined)} />
    </div>
  );
}
