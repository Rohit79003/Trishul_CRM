"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import ChatWidget from "@/components/ai/ChatWidget";
import { Bot, ShieldAlert } from "lucide-react";

export default function AIAssistantPage() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 w-16 h-16 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Admin Access Boundary Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The AI Assistant co-pilot module is restricted strictly to users with the <strong className="text-brand-amber">Admin</strong> role. Your current role is <strong className="capitalize text-slate-300">{user?.role}</strong>.
        </p>
        <p className="text-[11px] text-slate-400">
          Use the Topbar role toggle or Login page to switch your active role to Admin to interact with Trishul AI.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Bot className="w-7 h-7 text-brand-amber" /> AI Assistant Co-Pilot
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Interactive AI workflow assistant for summarizing activity, generating follow-ups, and identifying inactive accounts
        </p>
      </div>

      {/* Main Chat Interface */}
      <ChatWidget />
    </div>
  );
}
