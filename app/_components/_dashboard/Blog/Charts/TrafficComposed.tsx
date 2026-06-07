"use client";

import React from "react";
import { ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, Tooltip, CartesianGrid, Legend } from "recharts";

const data = [
  { name: 'Day 1', visits: 4000, unique: 2400, bounce: 240 },
  { name: 'Day 2', visits: 3000, unique: 1398, bounce: 221 },
  { name: 'Day 3', visits: 2000, unique: 9800, bounce: 229 },
  { name: 'Day 4', visits: 2780, unique: 3908, bounce: 200 },
  { name: 'Day 5', visits: 1890, unique: 4800, bounce: 218 },
  { name: 'Day 6', visits: 2390, unique: 3800, bounce: 250 },
  { name: 'Day 7', visits: 3490, unique: 4300, bounce: 210 },
];

export default function TrafficComposed() {
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="tcGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0070dc" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#0070dc" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fill: '#475569' }} />
          <Tooltip formatter={(v: any) => v} />
          <Area type="monotone" dataKey="visits" fill="url(#tcGrad)" stroke="#0070dc" strokeWidth={2} />
          <Bar dataKey="unique" barSize={14} fill="#00b8db" radius={[6, 6, 0, 0]} />
          <Line type="monotone" dataKey="bounce" stroke="#facc15" strokeWidth={2} dot={{ r: 3 }} />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
