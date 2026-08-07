import { User } from "@/types";

export function canViewTeam(user: User | null): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "supervisor";
}

export function canManageEmployees(user: User | null): boolean {
  if (!user) return false;
  return user.role === "admin";
}

export function canFilterTeamScope(user: User | null): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "supervisor";
}

export function canAssignLead(user: User | null): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "supervisor";
}
