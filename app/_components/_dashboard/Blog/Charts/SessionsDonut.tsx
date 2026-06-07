"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const data = [
  { name: "Direct", value: 45 },
  { name: "Organic", value: 30 },
  { name: "Referral", value: 15 },
  { name: "Social", value: 10 },
];

const COLORS = ["#0070dc", "#00b8db", "#facc15", "#041e42"];

export default function SessionsDonut() {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-text-secondary">Sessions By Source</p>
          <p className="text-2xl font-semibold text-text-primary">82,400</p>
        </div>
        <div className="text-sm text-text-muted">+6.2% vs last 30d</div>
      </div>

      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={80} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: any) => `${v}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
