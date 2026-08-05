"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types";
import { Shield, Lock, Mail, ArrowRight, Sparkles, Play } from "lucide-react";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import OpeningAnimation from "@/components/intro/OpeningAnimation";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("admin@trishul.com");
  const [password, setPassword] = useState("password123");
  const [errorMsg, setErrorMsg] = useState("");
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [isCheckingIntro, setIsCheckingIntro] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const played = sessionStorage.getItem("trishul_intro_played");
      if (played !== "true") {
        setShowIntro(true);
      }
    }
    setIsCheckingIntro(false);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("trishul_intro_played", "true");
    }
  };

  const handleReplayIntro = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("trishul_intro_played");
    }
    setShowIntro(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please provide both email and password.");
      return;
    }
    setErrorMsg("");
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed. Please check credentials.");
    }
  };

  const handleQuickRole = (role: Role) => {
    const emails: Record<Role, string> = {
      admin: "admin@trishul.com",
      supervisor: "supervisor@trishul.com",
      user: "agent@trishul.com",
    };
    setEmail(emails[role]);
    setPassword("password123");
    setErrorMsg("");
  };

  if (isCheckingIntro) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden select-none">
      {/* Dynamic Cinematic Opening Sequence Overlay */}
      <AnimatePresence>
        {showIntro && (
          <OpeningAnimation onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-amber/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <button
          type="button"
          onClick={handleReplayIntro}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-brand-amber hover:border-brand-amber/40 backdrop-blur-md transition-all shadow-md group"
          title="Replay Cinematic Opening Animation"
        >
          <Play className="w-3.5 h-3.5 text-brand-amber fill-brand-amber group-hover:scale-110 transition-transform" />
          <span>Replay Intro</span>
        </button>

        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Spring physics curve for Phase 8
        className="w-full max-w-md z-10"
      >
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-brand-amber/20 to-orange-500/20 border border-brand-amber/30 text-brand-amber mb-3 shadow-lg shadow-brand-amber/10">
              <Shield className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Trishul CRM <span className="text-xs px-2 py-0.5 rounded-full bg-brand-amber/20 text-brand-amber font-mono border border-brand-amber/30">v1.0</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to access your AI-powered CRM dashboard
            </p>
          </div>

          {/* Quick Evaluator Role Selector Chips (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                <span className="flex items-center gap-1.5 text-brand-amber">
                  <Sparkles className="w-3.5 h-3.5" /> Dev Quick Autofill:
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(["admin", "supervisor", "user"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleQuickRole(r)}
                    className="py-1.5 px-2 rounded-xl capitalize font-medium transition-all text-center border bg-slate-900 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Trishul CRM Edge Protection Middleware Active
          </div>
        </div>
      </motion.div>
    </div>
  );
}
