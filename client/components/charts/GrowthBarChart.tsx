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

interface GrowthPoint {
  quarter: string;
  revenue: number;
  target: number;
}

interface GrowthBarChartProps {
  data?: GrowthPoint[];
}

const DEFAULT_DATA: GrowthPoint[] = [
  { quarter: "Q1", revenue: 1400000, target: 1200000 },
  { quarter: "Q2", revenue: 1850000, target: 1600000 },
  { quarter: "Q3", revenue: 2485000, target: 2100000 },
  { quarter: "Q4 (Est)", revenue: 3100000, target: 2800000 },
];

export const GrowthBarChart: React.FC<GrowthBarChartProps> = ({ data = DEFAULT_DATA }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="quarter"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
          />
          <Tooltip
            formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "12px",
              color: "#f8fafc",
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "12px", fontSize: "12px", color: "#94a3b8" }}
          />
          <Bar
            dataKey="revenue"
            name="Actual Revenue (INR)"
            fill="#f2a93b"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="target"
            name="Target Benchmark"
            fill="#38bdf8"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthBarChart;
