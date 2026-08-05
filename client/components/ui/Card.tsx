"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animateHover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  animateHover = true,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={animateHover ? { scale: 1.02, y: -4 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow dark:shadow-slate-950/50 backdrop-blur-sm ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
