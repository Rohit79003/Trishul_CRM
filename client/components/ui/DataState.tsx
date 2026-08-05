"use client";

import React from "react";
import { motion } from "framer-motion";
import Spinner from "./Spinner";
import Button from "./Button";
import Skeleton from "./Skeleton";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface DataStateProps {
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  loadingMessage?: string;
  skeletonType?: "none" | "card" | "table" | "stat-grid" | "list";
  children: React.ReactNode;
  className?: string;
}

export const DataState: React.FC<DataStateProps> = ({
  loading,
  error,
  onRetry,
  loadingMessage = "Fetching data...",
  skeletonType = "none",
  children,
  className = "",
}) => {
  if (loading) {
    if (skeletonType === "stat-grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="stat-card" />
          ))}
        </div>
      );
    }

    if (skeletonType === "card") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      );
    }

    return (
      <div className={`p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-col items-center justify-center space-y-4 my-4 shadow-sm min-h-[180px] ${className}`}>
        <Spinner size="lg" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase animate-pulse">
          {loadingMessage}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex flex-col sm:flex-row items-center justify-between gap-4 my-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">
              Unable to load data
            </h4>
            <p className="text-xs text-rose-500/90 dark:text-rose-400/80 mt-0.5">
              {error || "A network error occurred while fetching live data."}
            </p>
          </div>
        </div>

        {onRetry && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            icon={<RefreshCw className="w-4 h-4" />}
            className="whitespace-nowrap shrink-0 border-rose-500/30 hover:bg-rose-500/10"
          >
            Retry Fetch
          </Button>
        )}
      </motion.div>
    );
  }

  return <>{children}</>;
};

export default DataState;
