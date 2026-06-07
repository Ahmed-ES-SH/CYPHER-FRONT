"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";

const data = [
  { name: "Week 1", value: 60 },
  { name: "Week 2", value: 80 },
  { name: "Week 3", value: 50 },
  { name: "Week 4", value: 130 },
];

export default function NewSubsBar() {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm text-text-secondary">New Subs (4w)</p>
          <p className="text-lg font-semibold text-text-primary">320</p>
        </div>
        <div className="text-sm text-text-muted">+2.1%</div>
      </div>

      <div className="w-full h-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" hide />
            <Tooltip formatter={(v: any) => v} />
            <Bar dataKey="value" fill="#00b8db" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
