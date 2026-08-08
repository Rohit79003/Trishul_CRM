"use client";

import React from "react";

type BadgeVariant =
  | "new"
  | "active"
  | "inactive"
  | "contacted"
  | "interested"
  | "won"
  | "lost"
  | "high"
  | "medium"
  | "low"
  | "admin"
  | "supervisor"
  | "user"
  | "default";

interface BadgeProps {
  variant?: BadgeVariant | string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  label,
  children,
  className = "",
}) => {
  const normalizedVariant = (variant || "default").toLowerCase();

  const styles: Record<string, string> = {
    // Lead & Customer statuses
    new: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    inactive: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
    contacted: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    interested: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    won: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-semibold",
    lost: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",

    // Priority & Task statuses
    high: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold",
    medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    low: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
    pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    "in-progress": "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 font-medium",
    completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold",

    // Roles
    admin: "bg-amber-500/20 text-amber-700 dark:text-brand-amber border-amber-500/40 font-semibold",
    supervisor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    user: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",

    default: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };

  const selectedStyle = styles[normalizedVariant] || styles.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${selectedStyle} ${className}`}
    >
      {label || children || variant}
    </span>
  );
};

export default Badge;
