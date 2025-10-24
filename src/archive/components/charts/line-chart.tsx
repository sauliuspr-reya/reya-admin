"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export type LineDatum = {
  bucket: string; // label
  [series: string]: number | string;
};

export interface LineChartProps {
  data: LineDatum[];
  seriesKeys?: string[]; // default ['value']
  height?: number;
}

const formatNumber = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return `${v}`;
};

export function SimpleLineChart({ data, seriesKeys = ["value"], height = 320 }: LineChartProps) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => formatNumber(v as number)} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: any) => formatNumber(Number(value))} />
          {seriesKeys.length > 1 && <Legend />}
          {seriesKeys.map((k, i) => (
            <Line
              key={k}
              type="monotone"
              dataKey={k}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const LINE_COLORS = [
  "#6366F1", // indigo-500
  "#22C55E", // green-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#3B82F6", // blue-500
  "#14B8A6", // teal-500
  "#A855F7", // purple-500
  "#F97316", // orange-500
];
