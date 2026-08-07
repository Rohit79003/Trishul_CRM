"use client";

import React, { useState } from "react";
import useFetch from "@/hooks/useFetch";
import api from "@/lib/api";
import { Lead } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table, { Column } from "@/components/ui/Table";
import DataState from "@/components/ui/DataState";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { exportToPDF } from "@/lib/exportPDF";
import { exportToExcel } from "@/lib/exportExcel";
import {
  Target,
  Search,
  Plus,
  FileText,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";

import useAuth from "@/hooks/useAuth";
import { canFilterTeamScope } from "@/lib/permissions";

export default function LeadsPage() {
  const { user: currentUser } = useAuth();

  const [leadScope, setLeadScope] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const paramScope = urlParams.get("scope");
      if (paramScope === "mine" || paramScope === "team") return paramScope;
      const saved = localStorage.getItem("trishul_lead_scope");
      if (saved === "mine" || saved === "team") return saved;
    }
    return "team";
  });

  const isAdmin = currentUser?.role === "admin";
  const isSupervisor = currentUser?.role === "supervisor";

  const { data: initialLeads, loading, error: fetchError, refetch } = useFetch<Lead[]>(
    `/leads?scope=${leadScope}`
  );
  const { data: allUsers } = useFetch<User[]>(isAdmin ? "/users" : null);
  const { data: teamData } = useFetch<{ teamMembers: User[] }>(isSupervisor ? "/users/my-team" : null);

  const availableAssignees = React.useMemo(() => {
    if (isAdmin) return allUsers || [];
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

  const handleScopeChange = (newScope: string) => {
    setLeadScope(newScope);
    if (typeof window !== "undefined") {
      localStorage.setItem("trishul_lead_scope", newScope);
      const url = new URL(window.location.href);
      url.searchParams.set("scope", newScope);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionError, setActionError] = useState<string>("");

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "Website Form",
    status: "new" as Lead["status"],
    value: 350000,
    assignedTo: "",
  });

  React.useEffect(() => {
    if (initialLeads) {
      setLeads(initialLeads);
    }
  }, [initialLeads]);

  const filteredLeads = leads.filter((l) => {
    const assigneeStr = typeof l.assignedTo === "object" && l.assignedTo !== null ? ((l.assignedTo as any).name || (l.assignedTo as any).email || "") : (l.assignedTo || "");
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assigneeStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setActionError("");
    setEditingLead(null);
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      source: "Website Form",
      status: "new",
      value: 350000,
      assignedTo: "",
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setActionError("");
    setEditingLead(lead);
    const assignedStr = typeof lead.assignedTo === "object" && lead.assignedTo !== null ? ((lead.assignedTo as any).name || (lead.assignedTo as any)._id) : (lead.assignedTo || "");
    setFormData({
      name: lead.name,
      company: lead.company || "",
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      value: lead.value || 350000,
      assignedTo: assignedStr,
    });
    setIsAddEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setIsSubmitting(true);
    try {
      if (editingLead) {
        const id = editingLead.id || (editingLead as any)._id;
        const res = await api.put(`/leads/${id}`, formData);
        setLeads((prev) =>
          prev.map((l) => ((l.id || (l as any)._id) === id ? res.data : l))
        );
      } else {
        const res = await api.post("/leads", formData);
        setLeads((prev) => [res.data, ...prev]);
      }
      setIsAddEditOpen(false);
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to save lead opportunity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (leadToDelete) {
      const id = leadToDelete.id || (leadToDelete as any)._id;
      setActionError("");
      setIsSubmitting(true);
      try {
        await api.delete(`/leads/${id}`);
        setLeads((prev) => prev.filter((l) => (l.id || (l as any)._id) !== id));
        setLeadToDelete(null);
        setIsDeleteOpen(false);
      } catch (err: any) {
        setActionError(err.response?.data?.message || "Failed to delete lead opportunity.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleQuickStatusChange = async (leadId: string, nextStatus: Lead["status"]) => {
    try {
      const res = await api.put(`/leads/${leadId}`, { status: nextStatus });
      setLeads((prev) =>
        prev.map((l) => ((l.id || (l as any)._id) === leadId ? res.data : l))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update lead status");
    }
  };

  const handleExportPDF = () => {
    const headers = ["Lead Name", "Source", "Assigned Agent", "Status", "Estimated Value"];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.source,
      typeof l.assignedTo === "object" && l.assignedTo !== null ? ((l.assignedTo as any).name || (l.assignedTo as any).email) : (l.assignedTo || "Unassigned"),
      l.status.toUpperCase(),
      `₹${(l.value || 0).toLocaleString("en-IN")}`,
    ]);
    exportToPDF({
      title: "Trishul CRM - Leads Pipeline Summary",
      filename: `Leads_Pipeline_${Date.now()}`,
      headers,
      rows,
    });
  };

  const handleExportExcel = () => {
    const headers = ["ID", "Name", "Company", "Email", "Phone", "Source", "Status", "Assigned Agent", "Est. Value", "Created Date"];
    const rows = filteredLeads.map((l) => [
      l.id || (l as any)._id,
      l.name,
      l.company || "",
      l.email,
      l.phone,
      l.source,
      l.status,
      typeof l.assignedTo === "object" && l.assignedTo !== null ? ((l.assignedTo as any).name || (l.assignedTo as any).email) : (l.assignedTo || "Unassigned"),
      l.value || 0,
      l.createdAt,
    ]);
    exportToExcel({
      filename: `Leads_Export_${Date.now()}`,
      sheetName: "Leads",
      headers,
      rows,
    });
  };

  const columns: Column<Lead>[] = [
    {
      header: "Lead Contact",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
          <div className="text-xs text-slate-400">{row.company || "Independent"}</div>
        </div>
      ),
    },
    {
      header: "Contact Details",
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <Mail className="w-3 h-3 text-sky-400" /> {row.email}
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Phone className="w-3 h-3 text-slate-400" /> {row.phone}
          </div>
        </div>
      ),
    },
    {
      header: "Channel Source",
      cell: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.source}
        </span>
      ),
    },
    {
      header: "Assigned Agent",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
          <User className="w-3.5 h-3.5 text-brand-amber" />
          <span>{typeof row.assignedTo === "object" && row.assignedTo !== null ? ((row.assignedTo as any).name || (row.assignedTo as any).email || "Unassigned") : (row.assignedTo || "Unassigned")}</span>
        </div>
      ),
    },
    {
      header: "Pipeline Status",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.status} />
          <select
            value={row.status}
            onChange={(e) => handleQuickStatusChange(row.id || (row as any)._id, e.target.value as any)}
            className="text-[11px] py-0.5 px-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
            title="Advance lead status"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      ),
    },
    {
      header: "Est. Deal Value",
      cell: (row) => (
        <span className="font-mono font-semibold text-brand-amber text-xs">
          ₹{(row.value || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-brand-amber hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit Lead"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {currentUser?.role !== "user" && (
            <button
              onClick={() => {
                setActionError("");
                setLeadToDelete(row);
                setIsDeleteOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Delete Lead"
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Target className="w-7 h-7 text-sky-400" /> Leads Pipeline Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track inbound lead qualification, stage progress, and conversion milestones
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            icon={<FileText className="w-4 h-4 text-rose-500" />}
          >
            PDF Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
          >
            Excel Export
          </Button>
          {currentUser?.role !== "user" && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              icon={<Plus className="w-4 h-4" />}
            >
              New Lead
            </Button>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          Failed to load leads from backend API. Please verify server connection.
        </div>
      )}

      {/* Filter Controls Bar */}
      <Card animateHover={false} className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads, agent or source..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-amber"
              />
            </div>

            {canFilterTeamScope(currentUser) && (
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleScopeChange("team")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-xs w-1/2 sm:w-auto ${
                    leadScope === "team"
                      ? "bg-white dark:bg-slate-900 text-brand-amber shadow-sm font-semibold border border-brand-amber/30"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>All My Team's Leads</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeChange("mine")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-xs w-1/2 sm:w-auto ${
                    leadScope === "mine"
                      ? "bg-white dark:bg-slate-900 text-brand-amber shadow-sm font-semibold border border-brand-amber/30"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Assigned to Me Only</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              Stage:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {["all", "new", "contacted", "interested", "won", "lost"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all border ${
                    statusFilter === st
                      ? "bg-brand-amber text-slate-950 border-brand-amber font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <DataState loading={loading} error={fetchError} onRetry={refetch}>
        <Table
          columns={columns}
          data={filteredLeads}
          isLoading={loading}
          emptyMessage="No matching lead opportunities found."
          keyExtractor={(item) => item.id || (item as any)._id}
        />
      </DataState>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingLead ? "Edit Lead Details" : "Create New Lead Entry"}
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
                Lead Full Name *
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
                Company / Organization
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Acquisition Channel / Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              >
                <option value="Website Form">Website Form</option>
                <option value="LinkedIn Campaign">LinkedIn Campaign</option>
                <option value="Referral">Partner Referral</option>
                <option value="Cold Call">Cold Outreach</option>
                <option value="Trade Expo">Trade Expo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pipeline Stage
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none capitalize"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Agent
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              >
                <option value="">Select Lead Assignee...</option>
                {availableAssignees.map((u) => {
                  const uId = u.id || (u as any)._id;
                  const isSelf = uId === (currentUser?.id || (currentUser as any)?._id);
                  return (
                    <option key={uId} value={uId}>
                      {u.name} {isSelf ? "(You)" : `(${u.department || u.role.toUpperCase()})`}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Deal Value (INR)
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsAddEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingLead ? "Update Lead" : "Save Lead"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Lead Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {actionError}
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to remove lead{" "}
            <strong className="text-slate-900 dark:text-white">
              {leadToDelete?.name}
            </strong>
            ?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isSubmitting}>
              Delete Lead
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
