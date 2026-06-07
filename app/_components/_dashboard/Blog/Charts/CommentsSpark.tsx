"use client";

import React from "react";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

const data = [
  { name: "D1", v: 3 },
  { name: "D2", v: 6 },
  { name: "D3", v: 4 },
  { name: "D4", v: 9 },
  { name: "D5", v: 7 },
  { name: "D6", v: 8 },
  { name: "D7", v: 11 },
];

export default function CommentsSpark() {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm text-text-secondary">Comments (7d)</p>
          <p className="text-lg font-semibold text-text-primary">68</p>
        </div>
        <div className="text-sm text-text-muted">-1.2%</div>
      </div>

      <div className="w-full h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Line type="monotone" dataKey="v" stroke="#041e42" strokeWidth={2} dot={false} />
            <Tooltip formatter={(v: any) => v} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
