"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card" | "table-row" | "stat-card";
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "text",
  count = 1,
}) => {
  const baseClasses =
    "animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-lg transition-colors";

  if (variant === "card") {
    return (
      <div className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse" />
      </div>
    );
  }

  if (variant === "stat-card") {
    return (
      <div className={`p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    );
  }

  if (variant === "table-row") {
    return (
      <>
        {Array.from({ length: count }).map((_, idx) => (
          <tr key={idx} className="border-b border-slate-200/60 dark:border-slate-800/60 animate-pulse">
            <td className="px-4 py-4"><div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded" /></td>
            <td className="px-4 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" /></td>
            <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
            <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
            <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" /></td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`${baseClasses} ${
            variant === "circular"
              ? "rounded-full"
              : variant === "rectangular"
              ? "rounded-xl"
              : "h-4"
          } ${className}`}
        />
      ))}
    </div>
  );
};

export default Skeleton;
