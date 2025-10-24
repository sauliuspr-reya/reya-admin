"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export type HistogramDatum = {
  bucket: string; // e.g., '2025-08-01'
  [series: string]: number | string;
};

export interface VolumeHistogramProps {
  data: HistogramDatum[];
  seriesKeys?: string[]; // e.g., ['total'] or ['discordA','discordB'] for stacked
  height?: number;
}

const formatNumber = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return `${v}`;
};

export function VolumeHistogram({ data, seriesKeys = ["total"], height = 320 }: VolumeHistogramProps) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => formatNumber(v as number)} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: any) => formatNumber(Number(value))} />
          {seriesKeys.length > 1 && <Legend />}
          {seriesKeys.map((k, i) => (
            <Bar
              key={k}
              dataKey={k}
              stackId={seriesKeys.length > 1 ? "stack" : undefined}
              fill={BAR_COLORS[i % BAR_COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const BAR_COLORS = [
  "#6366F1", // indigo-500
  "#22C55E", // green-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#3B82F6", // blue-500
  "#14B8A6", // teal-500
  "#A855F7", // purple-500
  "#F97316", // orange-500
];
