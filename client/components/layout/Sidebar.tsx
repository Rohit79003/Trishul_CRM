"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types";
import {
  LayoutDashboard,
  Users,
  Target,
  CheckSquare,
  UserCog,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Lock,
  LogOut,
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

const MENU_ITEMS: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "supervisor", "user"] },
  { name: "Customers", href: "/customers", icon: Users, roles: ["admin", "supervisor", "user"] },
  { name: "Leads Pipeline", href: "/leads", icon: Target, roles: ["admin", "supervisor", "user"] },
  { name: "Tasks", href: "/tasks", icon: CheckSquare, roles: ["admin", "supervisor", "user"] },
  { name: "Employees", href: "/employees", icon: UserCog, roles: ["admin", "supervisor"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["admin", "supervisor"] },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot, roles: ["admin"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const currentRole = user?.role || "admin";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen bg-slate-900 border-r border-slate-800 text-slate-300 z-30 select-none shrink-0"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-amber/20 to-orange-500/20 border border-brand-amber/40 text-brand-amber shrink-0 shadow-md">
            <Shield className="w-6 h-6 text-brand-amber" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col whitespace-nowrap"
            >
              <span className="font-bold text-white tracking-wider text-base">TRISHUL CRM</span>
              <span className="text-[10px] text-brand-amber font-mono tracking-widest uppercase">
                {currentRole} Access
              </span>
            </motion.div>
          )}
        </Link>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {MENU_ITEMS.filter((item) => item.roles.includes(currentRole)).map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const displayLabel = item.href === "/employees" ? (currentRole === "supervisor" ? "My Team" : "Employees") : item.name;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {/* Active Tab Pill Indicator with layoutId */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-brand-amber rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 z-10 ${
                  isActive ? "text-slate-950 font-extrabold" : "text-slate-400 group-hover:text-white"
                }`}
              />

              {!collapsed && (
                <span className="z-10 truncate font-semibold tracking-wide">{displayLabel}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer Role Badge & Logout */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="font-medium text-slate-200 truncate">{user?.name || "User"}</div>
            <div className="text-[10px] text-slate-500 capitalize">{user?.role || "guest"}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
