"use client";

import React, { useState } from "react";
import useFetch from "@/hooks/useFetch";
import api from "@/lib/api";
import { Task, User } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import DataState from "@/components/ui/DataState";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  Circle,
  Filter,
  Trash2,
  Edit2,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function TasksPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const isSupervisor = currentUser?.role === "supervisor";

  const { data: initialTasks, loading, error: fetchError, refetch } = useFetch<Task[]>("/tasks");
  const { data: allUsers } = useFetch<User[]>(isAdmin ? "/users" : null);
  const { data: teamData } = useFetch<{ teamMembers: User[] }>(isSupervisor ? "/users/my-team" : null);

  const availableAssignees = React.useMemo(() => {
    if (isAdmin) {
      return allUsers || [];
    }
    if (isSupervisor) {
      const supervisees = teamData?.teamMembers || [];
      const list = [...supervisees];
      const curId = currentUser?.id || (currentUser as any)?._id;
      if (currentUser && !list.some((m) => (m.id || (m as any)._id) === curId)) {
        list.unshift(currentUser);
      }
      return list;
    }
    return currentUser ? [currentUser] : [];
  }, [isAdmin, isSupervisor, allUsers, teamData, currentUser]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [actionError, setActionError] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    assignedTo: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium" as Task["priority"],
    category: "Sales",
    status: "pending" as "pending" | "in-progress" | "completed",
  });

  React.useEffect(() => {
    if (initialTasks) setTasks(initialTasks);
  }, [initialTasks]);

  const toggleTaskComplete = async (id: string) => {
    const target = tasks.find((t) => (t.id || (t as any)._id) === id);
    if (!target) return;
    const newCompleted = !target.completed;
    const newStatus = newCompleted ? "completed" : "pending";
    setTasks((prev) =>
      prev.map((t) =>
        (t.id || (t as any)._id) === id
          ? { ...t, completed: newCompleted, status: newStatus }
          : t
      )
    );
    try {
      await api.put(`/tasks/${id}`, { completed: newCompleted, status: newStatus });
    } catch (err) {
      refetch();
    }
  };

  const handleQuickStatusChange = async (
    taskId: string,
    newStatus: "pending" | "in-progress" | "completed"
  ) => {
    const isComp = newStatus === "completed";
    setTasks((prev) =>
      prev.map((t) =>
        (t.id || (t as any)._id) === taskId
          ? { ...t, status: newStatus, completed: isComp }
          : t
      )
    );
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      refetch();
    }
  };

  const handleOpenAdd = () => {
    setActionError("");
    setEditingTask(null);
    setFormData({
      title: "",
      assignedTo: currentUser?.id || (currentUser as any)?._id || "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
      category: "Sales",
      status: "pending",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setActionError("");
    setEditingTask(task);
    const assignedId =
      typeof task.assignedTo === "object" && task.assignedTo !== null
        ? (task.assignedTo as any)._id || (task.assignedTo as any).id || ""
        : task.assignedTo || "";

    const taskStatus = task.status || (task.completed ? "completed" : "pending");

    setFormData({
      title: task.title,
      assignedTo: assignedId,
      dueDate: task.dueDate ? String(task.dueDate).split("T")[0] : new Date().toISOString().split("T")[0],
      priority: task.priority || "medium",
      category: task.category || "Sales",
      status: taskStatus,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setIsSubmitting(true);
    try {
      if (editingTask) {
        const id = editingTask.id || (editingTask as any)._id;
        const res = await api.put(`/tasks/${id}`, formData);
        setTasks((prev) =>
          prev.map((t) => ((t.id || (t as any)._id) === id ? res.data : t))
        );
      } else {
        const res = await api.post("/tasks", formData);
        setTasks((prev) => [res.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to save task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => (t.id || (t as any)._id) !== id));
    try {
      await api.delete(`/tasks/${id}`);
    } catch (err) {
      refetch();
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-brand-amber" /> Task & Activity Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Assign, track, and complete SLA action items across team workflows
          </p>
        </div>

        {currentUser?.role !== "user" && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
          >
            Create New Task
          </Button>
        )}
      </div>

      {fetchError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          Failed to fetch tasks from backend API. Please verify server connection.
        </div>
      )}

      {/* Filter Bar */}
      <Card animateHover={false} className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Priority:
            </span>
            <div className="flex items-center gap-1.5">
              {["all", "high", "medium", "low"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium capitalize transition-all border ${
                    filterPriority === p
                      ? "bg-brand-amber text-slate-950 border-brand-amber font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Animated Task List */}
      <DataState loading={loading} error={fetchError} onRetry={refetch}>
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <Card animateHover={false} className="p-8 text-center text-slate-500">
                No tasks match your selected filter criteria.
              </Card>
            ) : (
              filteredTasks.map((t) => {
                const taskId = t.id || (t as any)._id;
                const currentStatus = t.status || (t.completed ? "completed" : "pending");

                return (
                  <motion.div
                    key={taskId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      animateHover={false}
                      className={`p-4 transition-all ${
                        t.completed
                          ? "bg-slate-50/50 dark:bg-slate-900/40 opacity-75 border-slate-200/50 dark:border-slate-800/40"
                          : "hover:border-brand-amber/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Left Checkbox & Title */}
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <button
                            onClick={() => toggleTaskComplete(taskId)}
                            className="text-brand-amber hover:scale-110 transition-transform shrink-0"
                            title={t.completed ? "Mark incomplete" : "Mark completed"}
                          >
                            {t.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-400 hover:text-brand-amber" />
                            )}
                          </button>

                          <div className="truncate">
                            <h4
                              className={`text-sm font-semibold truncate ${
                                t.completed
                                  ? "line-through text-slate-400 dark:text-slate-500"
                                  : "text-slate-900 dark:text-slate-100"
                              }`}
                            >
                              {t.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <UserIcon className="w-3 h-3 text-brand-amber" />{" "}
                                {typeof t.assignedTo === "object" && t.assignedTo !== null
                                  ? (t.assignedTo as any).name || (t.assignedTo as any).email || "Unassigned"
                                  : t.assignedTo || "Unassigned"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-sky-400" /> Due:{" "}
                                {t.dueDate ? String(t.dueDate).split("T")[0] : "No date"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Badges & Controls */}
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Quick Status Dropdown (Accessible to all roles) */}
                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              handleQuickStatusChange(taskId, e.target.value as any)
                            }
                            className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:border-brand-amber focus:outline-none cursor-pointer capitalize"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In-Progress</option>
                            <option value="completed">Completed</option>
                          </select>

                          <Badge variant={t.priority} />

                          {currentUser?.role !== "user" && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(t)}
                                className="p-1.5 text-slate-400 hover:text-brand-amber hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Edit Task"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTask(taskId)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </DataState>

      {/* Modal Add / Edit Task */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? "Edit Task Record" : "Assign New Task"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {actionError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title / Description *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Schedule product demo with Horizon Financial"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assignee (Team Member)
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              >
                <option value="">Select an Assignee...</option>
                {availableAssignees.length > 0 ? (
                  availableAssignees.map((u) => {
                    const uId = u.id || (u as any)._id;
                    const isSelf = uId === (currentUser?.id || (currentUser as any)?._id);
                    return (
                      <option key={uId} value={uId}>
                        {u.name} {isSelf ? "(You)" : `(${u.department || u.role.toUpperCase()})`}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>
                    No team members available
                  </option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none capitalize"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none capitalize"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In-Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingTask ? "Update Task" : "Assign Task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
