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

interface LeadTrendPoint {
  month: string;
  leads: number;
  won: number;
}

interface LeadsLineChartProps {
  data?: LeadTrendPoint[];
}

const DEFAULT_DATA: LeadTrendPoint[] = [
  { month: "Jan", leads: 42, won: 18 },
  { month: "Feb", leads: 58, won: 24 },
  { month: "Mar", leads: 70, won: 32 },
  { month: "Apr", leads: 65, won: 28 },
  { month: "May", leads: 88, won: 45 },
  { month: "Jun", leads: 95, won: 52 },
  { month: "Jul", leads: 110, won: 64 },
];

export const LeadsLineChart: React.FC<LeadsLineChartProps> = ({ data = DEFAULT_DATA }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
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
          <Line
            type="monotone"
            dataKey="leads"
            name="Total Leads Received"
            stroke="#f2a93b"
            strokeWidth={3}
            dot={{ r: 4, fill: "#f2a93b" }}
            activeDot={{ r: 6, fill: "#ff6b00" }}
          />
          <Line
            type="monotone"
            dataKey="won"
            name="Deals Won"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, fill: "#10b981" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadsLineChart;
