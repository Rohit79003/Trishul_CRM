"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { User, Role } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string, role?: Role) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Validate stored token against backend /api/auth/me on app mount
  const fetchCurrentUser = async (savedToken: string) => {
    try {
      const res = await api.get("/auth/me");
      if (res.data) {
        const u = res.data;
        const normalizedUser: User = {
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          role: u.role || "admin",
          department: u.department || "General",
          supervisorId: u.supervisorId,
          avatarUrl: u.avatarUrl,
        };
        setUser(normalizedUser);
        localStorage.setItem("trishul_user", JSON.stringify(normalizedUser));
        Cookies.set("role", normalizedUser.role, { expires: 7, path: "/" });
      }
    } catch (err) {
      // If token invalid, purge local session
      Cookies.remove("token", { path: "/" });
      Cookies.remove("role", { path: "/" });
      localStorage.removeItem("trishul_user");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = Cookies.get("token");
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    const savedToken = Cookies.get("token");
    if (savedToken) {
      await fetchCurrentUser(savedToken);
    }
  };

  const login = async (email: string, password?: string, role?: Role) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: apiToken, user: apiUser } = response.data;

      const loggedInUser: User = {
        id: apiUser.id || apiUser._id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role || role || "admin",
        supervisorId: apiUser.supervisorId,
        department: apiUser.department,
        avatarUrl: apiUser.avatarUrl,
      };

      Cookies.set("token", apiToken, { expires: 7, path: "/" });
      Cookies.set("role", loggedInUser.role, { expires: 7, path: "/" });
      localStorage.setItem("trishul_user", JSON.stringify(loggedInUser));

      setToken(apiToken);
      setUser(loggedInUser);
      setIsLoading(false);
      router.push("/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      const message =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK" ? "Cannot connect to server. Please verify your backend API URL." : null) ||
        "Invalid email or password.";
      throw new Error(message);
    }
  };

  const switchRole = (newRole: Role) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      Cookies.set("role", newRole, { expires: 7, path: "/" });
      localStorage.setItem("trishul_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      router.refresh();
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });
    localStorage.removeItem("trishul_user");
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, switchRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
