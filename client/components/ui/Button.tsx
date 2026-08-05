"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-amber disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-brand-amber via-amber-500 to-brand-blaze text-slate-950 font-semibold hover:opacity-95 shadow-amber-500/20 shadow-md border border-amber-400/30",
    secondary:
      "bg-slate-800 text-slate-100 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700",
    outline:
      "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 shadow-rose-600/20 shadow-md",
    ghost:
      "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none border-0",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
