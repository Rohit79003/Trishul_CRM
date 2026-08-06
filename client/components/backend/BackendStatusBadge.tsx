"use client";

import React from "react";
import { useBackendStatus } from "@/hooks/useBackendStatus";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface BackendStatusBadgeProps {
  showText?: boolean;
  className?: string;
}

export const BackendStatusBadge: React.FC<BackendStatusBadgeProps> = ({
  showText = true,
  className = "",
}) => {
  const { isReady, isSleeping, isChecking, retry } = useBackendStatus();

  let dotColor = "bg-emerald-400";
  let pulseColor = "bg-emerald-400/40";
  let label = "Backend Online";
  let textColor = "text-emerald-400";
  let borderColor = "border-emerald-500/30";
  let bgColor = "bg-emerald-500/10";
  let icon = <Wifi className="w-3.5 h-3.5 text-emerald-400" />;

  if (isChecking) {
    dotColor = "bg-amber-400";
    pulseColor = "bg-amber-400/40";
    label = "Connecting...";
    textColor = "text-amber-400";
    borderColor = "border-amber-500/30";
    bgColor = "bg-amber-500/10";
    icon = <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />;
  } else if (isSleeping || !isReady) {
    dotColor = "bg-amber-500";
    pulseColor = "bg-amber-500/40";
    label = "Waking Up...";
    textColor = "text-amber-400";
    borderColor = "border-amber-500/30";
    bgColor = "bg-amber-500/10";
    icon = <WifiOff className="w-3.5 h-3.5 text-amber-400" />;
  }

  return (
    <button
      type="button"
      onClick={() => retry()}
      title="Click to verify backend connection"
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${borderColor} ${bgColor} text-xs font-medium ${textColor} transition-all hover:scale-105 cursor-pointer backdrop-blur-md ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      {icon}
      {showText && <span>{label}</span>}
    </button>
  );
};

export default BackendStatusBadge;
