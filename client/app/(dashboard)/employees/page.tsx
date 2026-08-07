"use client";

import React, { useState } from "react";
import useFetch from "@/hooks/useFetch";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { User, Role } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table, { Column } from "@/components/ui/Table";
import DataState from "@/components/ui/DataState";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { canManageEmployees, canViewTeam } from "@/lib/permissions";
import {
  UserCog,
  Plus,
  ShieldAlert,
  Edit2,
  Trash2,
  Mail,
  Users,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Activity,
  Briefcase,
} from "lucide-react";

interface TeamMetrics {
  totalMembers: number;
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalOpenTasks: number;
}

interface TeamResponse {
  teamMembers: Array<User & { activeLeads?: number; openTasks?: number; workloadStatus?: string }>;
  metrics: TeamMetrics;
}

export default function EmployeesPage() {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const isAdmin = canManageEmployees(currentUser);
  const isSupervisor = currentUser?.role === "supervisor";
  const isAllowed = canViewTeam(currentUser);

  // Endpoint logic: Supervisor calls /users/my-team, Admin calls /users
  const { data: initialUsers, loading: usersLoading, error: usersError, refetch: refetchUsers } = useFetch<User[]>(
    isAdmin ? "/users" : null
  );

  const { data: teamData, loading: teamLoading, error: teamError, refetch: refetchTeam } = useFetch<TeamResponse>(
    isSupervisor ? "/users/my-team" : null
  );

  const [employees, setEmployees] = useState<User[]>([]);
  const [actionError, setActionError] = useState<string>("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempPasswordAlert, setTempPasswordAlert] = useState<{ email: string; pass: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as Role,
    supervisorId: "",
    department: "Field Sales",
  });

  React.useEffect(() => {
    if (isAdmin && initialUsers) setEmployees(initialUsers);
  }, [isAdmin, initialUsers]);

  // Show clean spinner during initial auth hydration
  if (isAuthLoading) {
    return (
      <DataState loading={true} loadingMessage="Verifying permissions...">
        <div className="h-48" />
      </DataState>
    );
  }

  // Guard check for Standard Agents (who have no team oversight or admin rights)
  if (!currentUser || !isAllowed) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 w-16 h-16 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Access Restricted to Managers & Admins
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The Team & Employee module is restricted to users with <strong className="text-brand-amber">Admin</strong> or <strong className="text-sky-400">Supervisor</strong> roles. Your current role is <strong className="capitalize text-slate-300">{currentUser?.role || "user"}</strong>.
        </p>
        <p className="text-[11px] text-slate-400">
          Use the Topbar role switcher to switch your active role to Admin or Supervisor to view team member workloads.
        </p>
      </Card>
    );
  }

  const handleOpenAdd = () => {
    setActionError("");
    setEditingEmployee(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
      supervisorId: "",
      department: "Field Sales",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: User) => {
    setActionError("");
    setEditingEmployee(emp);
    const supId =
      typeof emp.supervisorId === "object" && emp.supervisorId !== null
        ? (emp.supervisorId as any)._id || (emp.supervisorId as any).id || ""
        : emp.supervisorId || "";
    setFormData({
      name: emp.name,
      email: emp.email,
      password: "",
      role: emp.role,
      supervisorId: supId,
      department: emp.department || "Sales",
    });
    setIsModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const generated = "Trishul#" + Math.random().toString(36).substring(2, 7) + "!";
    setFormData((prev) => ({ ...prev, password: generated }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        const id = editingEmployee.id || (editingEmployee as any)._id;
        const res = await api.put(`/users/${id}`, formData);
        setEmployees((prev) =>
          prev.map((emp) => ((emp.id || (emp as any)._id) === id ? res.data : emp))
        );
      } else {
        const res = await api.post("/users", formData);
        setEmployees((prev) => [res.data, ...prev]);
        if (res.data.initialPassword) {
          setTempPasswordAlert({
            email: res.data.email,
            pass: res.data.initialPassword,
          });
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to save employee profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (employeeToDelete) {
      const id = employeeToDelete.id || (employeeToDelete as any)._id;
      setActionError("");
      setIsSubmitting(true);
      try {
        await api.delete(`/users/${id}`);
        setEmployees((prev) => prev.filter((e) => (e.id || (e as any)._id) !== id));
        setEmployeeToDelete(null);
        setIsDeleteOpen(false);
      } catch (err: any) {
        setActionError(err.response?.data?.message || "Failed to delete employee profile.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const columns: Column<User>[] = [
    {
      header: "Employee Name",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
            alt={row.name}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
          />
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
            <div className="text-xs text-slate-400">{row.department || "Sales"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Email Address",
      cell: (row) => (
        <div className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Mail className="w-3.5 h-3.5 text-brand-amber" /> {row.email}
        </div>
      ),
    },
    {
      header: "Role Permission",
      cell: (row) => <Badge variant={row.role} />,
    },
    {
      header: "Supervisor",
      cell: (row) => {
        let supervisorName = "";
        if (typeof row.supervisorId === "object" && row.supervisorId !== null) {
          supervisorName = (row.supervisorId as any).name || (row.supervisorId as any).email || "";
        } else if (row.supervisorId) {
          const supervisor = employees.find((e) => (e.id || (e as any)._id) === row.supervisorId);
          supervisorName = supervisor?.name || "";
        }
        
        return supervisorName ? (
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {supervisorName}
          </span>
        ) : (
          <span className="text-xs text-slate-400 italic">
            Unassigned
          </span>
        );
      },
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-brand-amber hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {(row.id || (row as any)._id) !== (currentUser.id || (currentUser as any)._id) && (
            <button
              onClick={() => {
                setActionError("");
                setEmployeeToDelete(row);
                setIsDeleteOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const supervisorColumns: Column<any>[] = [
    {
      header: "Team Member",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
            alt={row.name}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
          />
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
            <div className="text-xs text-slate-400">{row.department || "Sales"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Email Address",
      cell: (row) => (
        <div className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Mail className="w-3.5 h-3.5 text-brand-amber" /> {row.email}
        </div>
      ),
    },
    {
      header: "Role Permission",
      cell: (row) => <Badge variant={row.role} />,
    },
    {
      header: "Active Leads",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <Briefcase className="w-3.5 h-3.5 text-sky-400" />
          <span>{row.activeLeads ?? 0}</span>
        </div>
      ),
    },
    {
      header: "Open Tasks",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <ListTodo className="w-3.5 h-3.5 text-amber-400" />
          <span>{row.openTasks ?? 0}</span>
        </div>
      ),
    },
    {
      header: "Workload Status",
      cell: (row) => {
        const status = row.workloadStatus || "Available";
        if (status === "Overloaded") {
          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/30">
              🔴 Overloaded
            </span>
          );
        }
        if (status === "Busy") {
          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30">
              🟡 Busy
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            🟢 Available
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            {isAdmin ? (
              <>
                <UserCog className="w-7 h-7 text-brand-amber" /> Employee & Role Management
              </>
            ) : (
              <>
                <Users className="w-7 h-7 text-brand-amber" /> My Team Roster & Workload Overview
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isAdmin
              ? "Configure system accounts, assign supervisors, and manage role boundaries (Admin Only)"
              : "Monitor direct report workloads, active lead pipelines, and open task distribution"}
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Employee
          </Button>
        )}
      </div>

      {/* Supervisor Team Metric Cards Header */}
      {isSupervisor && teamData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-amber/10 text-brand-amber">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Team Members</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                {teamData.metrics?.totalMembers || 0}
              </div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Active Leads</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                {teamData.metrics?.activeLeads || 0}
              </div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Conversion Rate</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                {teamData.metrics?.conversionRate || 0}%
              </div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Open Tasks</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                {teamData.metrics?.totalOpenTasks || 0}
              </div>
            </div>
          </Card>
        </div>
      )}

      {tempPasswordAlert && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-between gap-4">
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-400">⚡ Employee Account Created! Temporary Credentials:</span>
            <div className="font-mono text-slate-200">
              User: <strong>{tempPasswordAlert.email}</strong> | Temp Password: <code className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-brand-amber select-all">{tempPasswordAlert.pass}</code>
            </div>
          </div>
          <button
            onClick={() => setTempPasswordAlert(null)}
            className="text-xs text-amber-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Table: Admin Employee Table vs Supervisor Team Workload Table */}
      {isAdmin ? (
        <DataState
          loading={usersLoading}
          error={usersError ? "Failed to load system employees list." : null}
          onRetry={refetchUsers}
        >
          <Table
            columns={columns}
            data={employees}
            isLoading={usersLoading}
            emptyMessage="No employees registered in system."
            keyExtractor={(item) => item.id || (item as any)._id}
          />
        </DataState>
      ) : (
        <DataState
          loading={teamLoading}
          error={teamError ? "Failed to load team workload data." : null}
          onRetry={refetchTeam}
        >
          {teamData?.teamMembers && teamData.teamMembers.length > 0 ? (
            <Table
              columns={supervisorColumns}
              data={teamData.teamMembers}
              isLoading={teamLoading}
              emptyMessage="No team members assigned."
              keyExtractor={(item) => item.id || (item as any)._id}
            />
          ) : (
            <Card className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-amber/10 text-brand-amber flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Team Members Assigned Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                You do not have any employees linked to your supervisor profile in the system yet. Ask your System Administrator to assign team members to your account.
              </p>
            </Card>
          )}
        </DataState>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? "Update Employee Profile" : "Register New Employee"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {actionError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {editingEmployee ? "New Password (Optional)" : "Temporary Password"}
                </label>
                {!editingEmployee && (
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-brand-amber hover:underline font-medium"
                  >
                    🎲 Auto-Generate
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingEmployee ? "Leave blank to keep existing password" : "e.g. Trishul#9x2K! (auto-generated if empty)"}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role Boundary *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none capitalize"
              >
                <option value="admin">Admin (Full Control)</option>
                <option value="supervisor">Supervisor (Team Oversight)</option>
                <option value="user">User / Agent (Standard Workflows)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Supervisor / Manager
              </label>
              <select
                value={formData.supervisorId}
                onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              >
                <option value="">None (Unassigned / Independent)</option>
                {employees
                  .filter((emp) => {
                    const empId = emp.id || (emp as any)._id;
                    const editId = editingEmployee ? editingEmployee.id || (editingEmployee as any)._id : null;
                    return empId !== editId;
                  })
                  .map((emp) => (
                    <option key={emp.id || (emp as any)._id} value={emp.id || (emp as any)._id}>
                      {emp.name} ({emp.role.toUpperCase()})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingEmployee ? "Update Record" : "Save Employee"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Employee Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {actionError}
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to remove employee{" "}
            <strong className="text-slate-900 dark:text-white">
              {employeeToDelete?.name}
            </strong>
            ?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isSubmitting}>
              Delete Employee
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
