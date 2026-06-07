"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

const data = [
  { name: "Mon", value: 420 },
  { name: "Tue", value: 560 },
  { name: "Wed", value: 480 },
  { name: "Thu", value: 680 },
  { name: "Fri", value: 620 },
  { name: "Sat", value: 720 },
  { name: "Sun", value: 840 },
];

export default function ViewsSmallArea() {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm text-text-secondary">Views (7d)</p>
          <p className="text-lg font-semibold text-text-primary">12.4k</p>
        </div>
        <div className="text-sm text-text-muted">+4.8%</div>
      </div>

      <div className="w-full h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradViews" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0070dc" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#0070dc" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="#0070dc" fill="url(#gradViews)" strokeWidth={2} />
            <Tooltip formatter={(v: any) => v} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
