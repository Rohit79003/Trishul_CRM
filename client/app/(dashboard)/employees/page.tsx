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
import {
  UserCog,
  Plus,
  ShieldAlert,
  Edit2,
  Trash2,
  Mail,
} from "lucide-react";

export default function EmployeesPage() {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const { data: initialUsers, loading, error: fetchError, refetch } = useFetch<User[]>("/users");
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
    department: "Field Sales",
  });

  React.useEffect(() => {
    if (initialUsers) setEmployees(initialUsers);
  }, [initialUsers]);

  // Show clean spinner during initial auth hydration
  if (isAuthLoading) {
    return (
      <DataState loading={true} loadingMessage="Verifying permissions...">
        <div className="h-48" />
      </DataState>
    );
  }

  // Client guard check for non-admin evaluators (only shown when auth loading is finished and user is not admin)
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 w-16 h-16 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Admin Access Boundary Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The Employees module is restricted strictly to users with the <strong className="text-brand-amber">Admin</strong> role. Your current role is <strong className="capitalize text-slate-300">{currentUser?.role || "unassigned"}</strong>.
        </p>
        <p className="text-[11px] text-slate-400">
          Use the Topbar dropdown or Login page to switch your active role to Admin to view and manage team members.
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
      department: "Field Sales",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: User) => {
    setActionError("");
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: "",
      role: emp.role,
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
        let supervisorName = "Root System";
        if (typeof row.supervisorId === "object" && row.supervisorId !== null) {
          supervisorName = (row.supervisorId as any).name || (row.supervisorId as any).email || "Supervisor";
        } else if (row.supervisorId) {
          const supervisor = employees.find((e) => (e.id || (e as any)._id) === row.supervisorId);
          supervisorName = supervisor?.name || "Supervisor";
        } else if (row.role !== "admin") {
          supervisorName = "Assigned Lead";
        }
        return (
          <span className="text-xs text-slate-500">
            {supervisorName}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCog className="w-7 h-7 text-brand-amber" /> Employee & Role Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure system accounts, assign supervisors, and manage role boundaries (Admin Only)
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Employee
        </Button>
      </div>

      {tempPasswordAlert && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-between gap-4">
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-400">⚡ Employee Account Created! Temporary Credentials:</span>
            <div className="font-mono text-slate-200">
              User: <strong>{tempPasswordAlert.email}</strong> | Temp Password: <code className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-brand-amber select-all">{tempPasswordAlert.pass}</code>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(`Email: ${tempPasswordAlert.email}\nPassword: ${tempPasswordAlert.pass}`);
              alert("Credentials copied to clipboard!");
            }}
          >
            Copy Credentials
          </Button>
        </div>
      )}

      {/* Table */}
      <DataState loading={loading} error={fetchError} onRetry={refetch}>
        <Table
          columns={columns}
          data={employees}
          isLoading={loading}
          emptyMessage="No employees registered in system."
          keyExtractor={(item) => item.id || (item as any)._id}
        />
      </DataState>

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
