"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Server, RefreshCw, Sparkles, ShieldAlert, Cpu } from "lucide-react";
import { useBackendStatus } from "@/hooks/useBackendStatus";

interface BackendLoaderProps {
  fullScreen?: boolean;
}

export const BackendLoader: React.FC<BackendLoaderProps> = ({ fullScreen = true }) => {
  const { isReady, isSleeping, isChecking, retryCount, retry } = useBackendStatus();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRetryingManual, setIsRetryingManual] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isReady) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isReady]);

  const handleManualRetry = async () => {
    setIsRetryingManual(true);
    try {
      await retry();
    } finally {
      setIsRetryingManual(false);
    }
  };

  if (isReady) return null;

  const content = (
    <div className="w-full max-w-lg mx-auto p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center relative overflow-hidden"
      >
        {/* Glow ambient background elements */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-brand-amber/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Dynamic Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-amber/30 to-orange-500/20 animate-ping opacity-30" />
          <div className="relative p-4 rounded-2xl bg-slate-950 border border-brand-amber/40 text-brand-amber shadow-lg shadow-brand-amber/20">
            <Server className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2 flex items-center justify-center gap-2">
          <span>Starting Server</span>
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-brand-amber/20 text-brand-amber font-mono border border-brand-amber/30">
            <Cpu className="w-3 h-3" /> Cold Start
          </span>
        </h2>

        <p className="text-sm text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
          Your workspace backend is waking up from inactivity. This usually takes <strong className="text-brand-amber font-semibold">30 to 60 seconds</strong>.
        </p>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-3 mb-4 p-0.5 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full"
            initial={{ width: "10%" }}
            animate={{ width: isChecking ? "85%" : "40%" }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        </div>

        {/* Stats & Status Badges */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-left">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Elapsed Time</span>
            <span className="text-lg font-mono font-semibold text-white">{elapsedSeconds}s</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-left">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Health Checks</span>
            <span className="text-lg font-mono font-semibold text-brand-amber">Attempt #{retryCount || 1}</span>
          </div>
        </div>

        {/* Status indicator message */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6 px-1">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            {isChecking ? "Pinging health endpoint..." : "Retrying automatically..."}
          </span>
          <span className="font-mono text-slate-400 text-[11px]">Auto-retry: 3s</span>
        </div>

        {/* Manual Retry Button */}
        <button
          type="button"
          onClick={handleManualRetry}
          disabled={isChecking || isRetryingManual}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking || isRetryingManual ? "animate-spin" : ""}`} />
          <span>{isChecking || isRetryingManual ? "Checking Backend..." : "Check Connection Now"}</span>
        </button>
      </motion.div>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 overflow-y-auto">
      {content}
    </div>
  );
};

export default BackendLoader;
