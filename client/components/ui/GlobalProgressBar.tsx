"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";

export const GlobalProgressBar: React.FC = () => {
  const { isGlobalLoading } = useLoading();
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isGlobalLoading) {
      // 150ms debounce before showing to prevent flickering on instant cached/fast requests
      timer = setTimeout(() => {
        setVisible(true);
      }, 150);
    } else {
      setVisible(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isGlobalLoading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ originX: 0 }}
          className="fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] overflow-hidden"
        >
          {/* Animated glow shimmer line */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            className="w-1/2 h-full bg-white/40 blur-[1px]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalProgressBar;
