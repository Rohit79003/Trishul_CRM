"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface PiePoint {
  name: string;
  value: number;
}

interface ReportsPieChartProps {
  data?: PiePoint[];
  title?: string;
}

const DEFAULT_DATA: PiePoint[] = [
  { name: "Website Direct", value: 42 },
  { name: "LinkedIn Ads", value: 28 },
  { name: "Partner Referral", value: 18 },
  { name: "Outreach Cold Call", value: 12 },
];

const COLORS = ["#f2a93b", "#38bdf8", "#10b981", "#8b5cf6", "#f43f5e"];

export const ReportsPieChart: React.FC<ReportsPieChartProps> = ({
  data = DEFAULT_DATA,
}) => {
  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
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
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: "16px", fontSize: "12px", color: "#94a3b8" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReportsPieChart;
