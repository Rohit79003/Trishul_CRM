export type Role = 'admin' | 'supervisor' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  supervisorId?: string;
  avatarUrl?: string;
  department?: string;
  mustChangePassword?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  status: 'new' | 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  value?: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: 'new' | 'contacted' | 'interested' | 'won' | 'lost';
  assignedTo: string;
  createdAt: string;
  value?: number;
  company?: string;
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category?: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'customer' | 'lead' | 'task' | 'system';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  codeSnippet?: string;
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalLeads: number;
  activeEmployees: number;
  totalRevenue: number;
  pendingTasks: number;
}
