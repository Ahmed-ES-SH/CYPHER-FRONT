"use client";

import React from "react";
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend } from "recharts";

const data = [
  { name: "Engagement", value: 72, fill: "#facc15" },
];

export default function EngagementRadial() {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm text-text-secondary">Engagement</p>
          <p className="text-lg font-semibold text-text-primary">72%</p>
        </div>
        <div className="text-sm text-text-muted">+0.6%</div>
      </div>

      <div className="w-full h-20 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={80}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" barSize={10} data={data} startAngle={180} endAngle={-180}>
            <RadialBar minAngle={15} background clockWise dataKey="value" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
