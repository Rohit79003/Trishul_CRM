"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  UserCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const notifications = [
    { id: "1", title: "New Enterprise Lead", desc: "Horizon Financial interested in AI suite", time: "10m ago" },
    { id: "2", title: "Task Due Soon", desc: "Prepare monthly revenue report for executive review", time: "1h ago" },
    { id: "3", title: "Contract Signed", desc: "Apex Global renewed enterprise package (₹4.5L)", time: "3h ago" },
  ];

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0 sticky top-0">
      {/* Global Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, customers, tasks or employees..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-colors"
          />
        </div>
      </div>

      {/* Right Action Icons & User Dropdown */}
      <div className="flex items-center gap-3">
        {/* Clock */}
        <div className="hidden md:flex items-center text-xs font-mono text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
          {currentTime}
        </div>

        {/* Active Authenticated Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 bg-brand-amber/10 text-amber-700 dark:text-brand-amber border border-brand-amber/30 rounded-xl capitalize">
          <UserCheck className="w-3.5 h-3.5" />
          Role: {user?.role || "user"}
        </div>

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-amber transition-colors shadow-sm"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand-amber ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Notifications
                  </h4>
                  <span className="text-[10px] bg-brand-amber/20 text-amber-700 dark:text-brand-amber font-semibold px-2 py-0.5 rounded-full">
                    3 New
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
              alt={user?.name || "User"}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-brand-amber/50"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name || "Vikramaditya"}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {user?.role || "admin"}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50"
              >
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || "user@trishul.com"}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-brand-amber">
                    <UserCheck className="w-3 h-3" />
                    <span className="capitalize">{user?.role} Role active</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
