"use client";

import React, { useState } from "react";
import useFetch from "@/hooks/useFetch";
import api from "@/lib/api";
import { Task } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  Circle,
  Filter,
  Trash2,
} from "lucide-react";

export default function TasksPage() {
  const { data: initialTasks, loading, error: fetchError } = useFetch<Task[]>("/tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [actionError, setActionError] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    assignedTo: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium" as Task["priority"],
    category: "Sales Follow-up",
  });

  React.useEffect(() => {
    if (initialTasks) setTasks(initialTasks);
  }, [initialTasks]);

  const toggleTaskComplete = async (taskId: string) => {
    const target = tasks.find((t) => (t.id || (t as any)._id) === taskId);
    if (!target) return;
    const newCompleted = !target.completed;
    try {
      const res = await api.put(`/tasks/${taskId}`, { completed: newCompleted });
      setTasks((prev) =>
        prev.map((t) => ((t.id || (t as any)._id) === taskId ? res.data : t))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update task completion");
    }
  };

  const handleOpenAdd = () => {
    setActionError("");
    setEditingTask(null);
    setFormData({
      title: "",
      assignedTo: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
      category: "Sales Follow-up",
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

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => (t.id || (t as any)._id) !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete task.");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    const assigneeName = typeof t.assignedTo === "object" && t.assignedTo !== null ? ((t.assignedTo as any).name || (t.assignedTo as any).email) : t.assignedTo;
    const matchesAssignee = filterAssignee === "all" || assigneeName === filterAssignee;
    return matchesPriority && matchesAssignee;
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

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          Create New Task
        </Button>
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
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <Card animateHover={false} className="p-8 text-center text-slate-500">
              No tasks match your selected filter criteria.
            </Card>
          ) : (
            filteredTasks.map((t) => {
              const taskId = t.id || (t as any)._id;
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
                              <User className="w-3 h-3 text-brand-amber" /> {typeof t.assignedTo === "object" && t.assignedTo !== null ? ((t.assignedTo as any).name || (t.assignedTo as any).email || "Unassigned") : (t.assignedTo || "Unassigned")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-sky-400" /> Due: {t.dueDate ? String(t.dueDate).split("T")[0] : "No date"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Badges & Controls */}
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={t.priority} />
                        <button
                          onClick={() => deleteTask(taskId)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Modal Add Task */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign New Task"
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
                Assignee
              </label>
              <input
                type="text"
                placeholder="Agent Name or ID"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              />
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

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Assign Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
