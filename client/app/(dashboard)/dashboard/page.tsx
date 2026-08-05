"use client";

import React from "react";
import CountUp from "react-countup";
import useFetch from "@/hooks/useFetch";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LeadsLineChart from "@/components/charts/LeadsLineChart";
import GrowthBarChart from "@/components/charts/GrowthBarChart";
import {
  Users,
  Target,
  UserCheck,
  IndianRupee,
  CheckSquare,
  ArrowUpRight,
  Plus,
  Sparkles,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch<any>("/dashboard/summary");

  const metrics = data?.metrics || {
    totalCustomers: 0,
    totalLeads: 0,
    activeEmployees: 0,
    totalRevenue: 0,
    pendingTasks: 0,
  };

  const latestCustomers = data?.latestCustomers || [];
  const newLeads = data?.newLeads || [];

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-brand-amber/15 via-orange-500/10 to-transparent pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-brand-amber text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Welcome Back, {user?.name || "Executive"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Trishul CRM Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time pipeline analytics, team performance, and AI-driven growth metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link href="/leads">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Add Lead
            </Button>
          </Link>
          <Link href="/tasks">
            <Button variant="secondary" size="sm" icon={<CheckSquare className="w-4 h-4" />}>
              Tasks
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          Failed to load dashboard metrics from backend API. Please make sure backend server is running.
        </div>
      )}

      {/* 5 CountUp Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Customers */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              <CountUp end={metrics.totalCustomers} duration={1.2} />
            </div>
            <span className="text-xs font-medium text-emerald-500 flex items-center">
              Live API
            </span>
          </div>
        </Card>

        {/* Card 2: Total Leads */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Leads
            </span>
            <div className="p-2 rounded-xl bg-brand-amber/15 text-brand-amber">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              <CountUp end={metrics.totalLeads} duration={1.2} />
            </div>
            <span className="text-xs font-medium text-emerald-500 flex items-center">
              Live API
            </span>
          </div>
        </Card>

        {/* Card 3: Active Employees */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Team
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              <CountUp end={metrics.activeEmployees} duration={1.2} />
            </div>
            <span className="text-xs font-medium text-slate-400">Database</span>
          </div>
        </Card>

        {/* Card 4: Total Revenue */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Revenue (INR)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
              ₹<CountUp end={metrics.totalRevenue} duration={1.2} separator="," />
            </div>
          </div>
        </Card>

        {/* Card 5: Pending Tasks */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              <CountUp end={metrics.pendingTasks} duration={1.2} />
            </div>
            <span className="text-xs font-medium text-amber-500">Active</span>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Pipeline Trend Chart */}
        <Card animateHover={false} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-amber" /> Lead Conversion Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly inbound leads vs won opportunities
              </p>
            </div>
            <Badge variant="active" label="Live Sync" />
          </div>
          <LeadsLineChart data={data?.leadTrends} />
        </Card>

        {/* Revenue Growth Bar Chart */}
        <Card animateHover={false} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-400" /> Quarterly Revenue Growth
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target vs actual earnings performance
              </p>
            </div>
            <Badge variant="interested" label="Target Analytics" />
          </div>
          <GrowthBarChart data={data?.growthData} />
        </Card>
      </div>

      {/* Mini-Lists Section: Latest Customers & New Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Customers Mini-List */}
        <Card animateHover={false} className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-amber" /> Latest Customers
            </h3>
            <Link href="/customers" className="text-xs font-semibold text-brand-amber hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {latestCustomers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No customer records in database yet.</div>
            ) : (
              latestCustomers.map((c: any) => (
                <div key={c.id || c._id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.company}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-xs font-semibold text-emerald-500 font-mono">
                      ₹{(c.value || 0).toLocaleString("en-IN")}
                    </span>
                    <Badge variant={c.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* New Leads Mini-List */}
        <Card animateHover={false} className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-400" /> New Leads Pipeline
            </h3>
            <Link href="/leads" className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {newLeads.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No leads in database yet.</div>
            ) : (
              newLeads.map((l: any) => (
                <div key={l.id || l._id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{l.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {l.source} • {typeof l.assignedTo === "object" && l.assignedTo !== null ? (l.assignedTo.name || l.assignedTo.email || "Agent") : (l.assignedTo || "Agent")}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={l.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
