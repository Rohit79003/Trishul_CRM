"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LeadsLineChart from "@/components/charts/LeadsLineChart";
import GrowthBarChart from "@/components/charts/GrowthBarChart";
import ReportsPieChart from "@/components/charts/ReportsPieChart";
import useFetch from "@/hooks/useFetch";
import { exportToPDF } from "@/lib/exportPDF";
import { exportToExcel } from "@/lib/exportExcel";
import {
  BarChart3,
  FileText,
  FileSpreadsheet,
  Calendar,
  Filter,
  PieChart as PieIcon,
  TrendingUp,
  Award,
} from "lucide-react";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("Q3-2026");
  const { data: analyticsData } = useFetch<any>("/reports/analytics");

  const pieData = analyticsData?.leadSourceBreakdown?.length
    ? analyticsData.leadSourceBreakdown.map((item: any) => ({
        name: item._id || "Direct",
        value: item.count || 1,
      }))
    : [
        { name: "Website Form Direct", value: 42 },
        { name: "LinkedIn Campaigns", value: 28 },
        { name: "Partner Referral", value: 18 },
        { name: "Cold Outreach", value: 12 },
      ];

  const handleExportPDF = () => {
    const headers = ["Metric Indicator", "Q1 Actual", "Q2 Actual", "Q3 Target", "Achieved %"];
    const rows = [
      ["Enterprise Revenue", "₹14,00,000", "₹18,50,000", "₹24,85,000", "118%"],
      ["Total Qualified Leads", "170", "223", "342", "105%"],
      ["Deals Won", "74", "105", "144", "112%"],
      ["Avg Sales Cycle (Days)", "18 Days", "15 Days", "12 Days", "125%"],
    ];
    exportToPDF({
      title: "Trishul CRM - Quarterly Performance Executive Report",
      filename: `Trishul_Executive_Report_${timeRange}`,
      headers,
      rows,
    });
  };

  const handleExportExcel = () => {
    const headers = ["Quarter", "Revenue (INR)", "Target (INR)", "Total Leads", "Conversion Rate"];
    const rows = [
      ["Q1 2026", 1400000, 1200000, 170, "43.5%"],
      ["Q2 2026", 1850000, 1600000, 223, "47.1%"],
      ["Q3 2026", 2485000, 2100000, 342, "52.4%"],
      ["Q4 2026 (Est)", 3100000, 2800000, 410, "55.0%"],
    ];
    exportToExcel({
      filename: `Trishul_Analytics_Data_${timeRange}`,
      sheetName: "Quarterly Analytics",
      headers,
      rows,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-brand-amber" /> Reports & Executive Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Generate custom data exports and visual breakdowns across revenue and channel performance
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            icon={<FileText className="w-4 h-4 text-rose-500" />}
          >
            Export PDF Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
          >
            Export Excel Sheet
          </Button>
        </div>
      </div>

      {/* Date Filter & Preset Controls */}
      <Card animateHover={false} className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Time Horizon:
            </span>
            <div className="flex items-center gap-1.5">
              {["Q1-2026", "Q2-2026", "Q3-2026", "YTD"].map((q) => (
                <button
                  key={q}
                  onClick={() => setTimeRange(q)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all border ${
                    timeRange === q
                      ? "bg-brand-amber text-slate-950 border-brand-amber font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Award className="w-4 h-4" /> Team Target Compliance: 118%
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card animateHover={false} className="p-6 lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-amber" /> Lead Conversion Growth
            </h3>
            <span className="text-xs text-slate-400 font-mono">{timeRange}</span>
          </div>
          <LeadsLineChart />
        </Card>

        <Card animateHover={false} className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-sky-400" /> Channel Breakdown
            </h3>
          </div>
          <ReportsPieChart data={pieData} />
        </Card>
      </div>

      <Card animateHover={false} className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Quarterly Revenue vs Target Performance
          </h3>
        </div>
        <GrowthBarChart />
      </Card>
    </div>
  );
}
