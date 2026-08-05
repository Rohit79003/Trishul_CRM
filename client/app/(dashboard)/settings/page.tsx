"use client";

import React, { useState } from "react";
import useFetch from "@/hooks/useFetch";
import api from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  Settings,
  Building,
  Lock,
  Moon,
  Sun,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  const [companyName, setCompanyName] = useState("Trishul Global Enterprise");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [savedError, setSavedError] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { data: initialSettings } = useFetch<any>("/settings");

  React.useEffect(() => {
    if (initialSettings?.companyName) {
      setCompanyName(initialSettings.companyName);
    }
    if (initialSettings?.logoUrl) {
      setLogoPreview(initialSettings.logoUrl);
    }
  }, [initialSettings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg("");
    setSavedError("");
    try {
      await api.put("/settings", { companyName, logoUrl: logoPreview || "" });
      setSavedMsg("Company settings & branding successfully saved!");
    } catch (err: any) {
      setSavedError(err.response?.data?.message || "Failed to update company settings.");
    }
    setTimeout(() => {
      setSavedMsg("");
      setSavedError("");
    }, 4000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg("");
    setPwdError("");
    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match!");
      return;
    }
    try {
      const res = await api.put("/settings/password", { oldPassword, newPassword });
      setPwdMsg(res.data?.message || "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdError(err.response?.data?.message || "Failed to update password. Please verify current password.");
    }
    setTimeout(() => {
      setPwdMsg("");
      setPwdError("");
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-brand-amber" /> System & Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage organizational metadata, security settings, and interface themes
        </p>
      </div>

      {/* Company Branding & Logo Card */}
      <Card animateHover={false} className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Building className="w-5 h-5 text-brand-amber" /> Company Branding Profile
        </h3>

        {savedMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {savedMsg}
          </div>
        )}

        {savedError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {savedError}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Logo (Preview Upload)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium transition-colors">
                  <Upload className="w-4 h-4 text-brand-amber" /> Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-9 h-9 rounded-lg object-cover ring-1 ring-brand-amber"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Save Branding Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* Theme Preference Card */}
      <Card animateHover={false} className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          {theme === "dark" ? (
            <Moon className="w-5 h-5 text-brand-amber" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500" />
          )}{" "}
          Visual Theme Preferences
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Active Color Theme Mode: <span className="capitalize text-brand-amber font-mono">{theme} Mode</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Persisted across browser sessions using cookies and localStorage
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={toggleTheme}>
            Toggle to {theme === "dark" ? "Light" : "Dark"} Mode
          </Button>
        </div>
      </Card>

      {/* Security & Password Card */}
      <Card animateHover={false} className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Lock className="w-5 h-5 text-rose-500" /> Security & Password Update
        </h3>

        {pwdMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {pwdMsg}
          </div>
        )}

        {pwdError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {pwdError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
            />
          </div>

          <Button type="submit" variant="secondary" size="sm">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
