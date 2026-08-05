"use client";

import React, { useState } from "react";
import useFetch from "@/hooks/useFetch";
import api from "@/lib/api";
import { Customer } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table, { Column } from "@/components/ui/Table";
import DataState from "@/components/ui/DataState";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { exportToPDF } from "@/lib/exportPDF";
import { exportToExcel } from "@/lib/exportExcel";
import {
  Users,
  Search,
  Plus,
  FileText,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
} from "lucide-react";

import useAuth from "@/hooks/useAuth";

export default function CustomersPage() {
  const { user: currentUser } = useAuth();
  const { data: initialCustomers, loading, error: fetchError, refetch } = useFetch<Customer[]>("/customers");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionError, setActionError] = useState<string>("");

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    status: "active" as "new" | "active" | "inactive",
    value: 500000,
    notes: "",
  });

  // Sync initial customers from live API
  React.useEffect(() => {
    if (initialCustomers) {
      setCustomers(initialCustomers);
    }
  }, [initialCustomers]);

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setActionError("");
    setEditingCustomer(null);
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
      value: 500000,
      notes: "",
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setActionError("");
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      status: customer.status,
      value: customer.value || 500000,
      notes: customer.notes || "",
    });
    setIsAddEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        const id = editingCustomer.id || (editingCustomer as any)._id;
        const res = await api.put(`/customers/${id}`, formData);
        setCustomers((prev) =>
          prev.map((c) => ((c.id || (c as any)._id) === id ? res.data : c))
        );
      } else {
        const res = await api.post("/customers", formData);
        setCustomers((prev) => [res.data, ...prev]);
      }
      setIsAddEditOpen(false);
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to save customer record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (customerToDelete) {
      const id = customerToDelete.id || (customerToDelete as any)._id;
      setActionError("");
      setIsSubmitting(true);
      try {
        await api.delete(`/customers/${id}`);
        setCustomers((prev) => prev.filter((c) => (c.id || (c as any)._id) !== id));
        setCustomerToDelete(null);
        setIsDeleteOpen(false);
      } catch (err: any) {
        setActionError(err.response?.data?.message || "Failed to delete customer record.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleExportPDF = () => {
    const headers = ["Name", "Company", "Email", "Phone", "Status", "Contract Value"];
    const rows = filteredCustomers.map((c) => [
      c.name,
      c.company,
      c.email,
      c.phone,
      c.status.toUpperCase(),
      `₹${(c.value || 0).toLocaleString("en-IN")}`,
    ]);
    exportToPDF({
      title: "Trishul CRM - Customer Directory",
      filename: `Customers_Report_${Date.now()}`,
      headers,
      rows,
    });
  };

  const handleExportExcel = () => {
    const headers = ["ID", "Name", "Company", "Email", "Phone", "Address", "Status", "Contract Value", "Created Date"];
    const rows = filteredCustomers.map((c) => [
      c.id || (c as any)._id,
      c.name,
      c.company,
      c.email,
      c.phone,
      c.address,
      c.status,
      c.value || 0,
      c.createdAt,
    ]);
    exportToExcel({
      filename: `Customers_Data_${Date.now()}`,
      sheetName: "Customers",
      headers,
      rows,
    });
  };

  const columns: Column<Customer>[] = [
    {
      header: "Customer Name",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <Building className="w-3 h-3" /> {row.company}
          </div>
        </div>
      ),
    },
    {
      header: "Contact Info",
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <Mail className="w-3 h-3 text-brand-amber" /> {row.email}
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Phone className="w-3 h-3 text-slate-400" /> {row.phone}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => <Badge variant={row.status} />,
    },
    {
      header: "Contract Value",
      cell: (row) => (
        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
          ₹{(row.value || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Created Date",
      accessorKey: "createdAt",
      cell: (row) => <span className="text-xs text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}</span>,
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-brand-amber hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit Customer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {currentUser?.role !== "user" && (
            <button
              onClick={() => {
                setActionError("");
                setCustomerToDelete(row);
                setIsDeleteOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Delete Customer"
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
            <Users className="w-7 h-7 text-brand-amber" /> Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage enterprise accounts, contacts, and contract values
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
              Add Customer
            </Button>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          Failed to fetch customer list from backend API. Please verify server connection.
        </div>
      )}

      {/* Filter Controls Bar */}
      <Card animateHover={false} className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, company or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-amber"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status:
            </span>
            <div className="flex items-center gap-1.5">
              {["all", "active", "new", "inactive"].map((st) => (
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

      {/* Customer Data Table */}
      <DataState loading={loading} error={fetchError} onRetry={refetch}>
        <Table
          columns={columns}
          data={filteredCustomers}
          isLoading={loading}
          emptyMessage="No matching customer records found."
          keyExtractor={(item) => item.id || (item as any)._id}
        />
      </DataState>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingCustomer ? "Edit Customer Record" : "Add New Customer Account"}
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
                Company Name *
              </label>
              <input
                type="text"
                required
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
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none capitalize"
              >
                <option value="active">Active</option>
                <option value="new">New</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contract Value (INR)
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address & Location
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="City, State"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Strategic Details
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-brand-amber focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsAddEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingCustomer ? "Update Customer" : "Save Customer"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {actionError}
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete customer{" "}
            <strong className="text-slate-900 dark:text-white">
              {customerToDelete?.name}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isSubmitting}>
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
