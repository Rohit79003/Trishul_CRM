"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useBackendStatus } from "@/hooks/useBackendStatus";

export const ConnectionOverlay: React.FC = () => {
  const { isReady, isSleeping, isChecking, retry } = useBackendStatus();

  // Only render overlay if backend was confirmed down after initial check
  if (isReady || !isSleeping) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pointer-events-auto"
      >
        <div className="bg-amber-950/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex items-center justify-between text-amber-200 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <p className="font-semibold text-amber-100">Backend Server Reconnecting...</p>
              <p className="text-amber-300/80 text-[11px]">
                Render instance is waking up. Your requests will retry automatically.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => retry()}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-all text-xs disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
            <span>{isChecking ? "Pinging..." : "Retry"}</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionOverlay;
