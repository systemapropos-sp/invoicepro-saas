export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  company_name?: string;
  company_logo?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  created_at?: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface Client {
  id: number;
  user_id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  profileImage?: string;
  documents?: ClientDocument[];
  total_invoiced?: number;
  balance?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Vendor {
  id: number;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  profileImage?: string;
  documents?: ClientDocument[];
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Service {
  id?: number;
  description: string;
  rate: number;
  quantity: number;
  amount: number;
}

export interface Invoice {
  id?: number;
  user_id?: number;
  client_id: number;
  client?: Client;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_city?: string;
  client_state?: string;
  client_zip?: string;
  client_country?: string;
  invoice_number?: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_type?: 'fixed' | 'percentage' | null;
  discount_value?: number;
  discount_amount: number;
  total: number;
  notes?: string;
  terms?: string;
  items: InvoiceItem[];
  created_at?: string;
  updated_at?: string;
}

export interface EstimateItem {
  id?: number;
  estimate_id?: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Estimate {
  id?: number;
  user_id?: number;
  client_id: number;
  client?: Client;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_city?: string;
  client_state?: string;
  client_zip?: string;
  client_country?: string;
  estimate_number?: string;
  issue_date: string;
  valid_until?: string;
  status: 'draft' | 'sent' | 'approved' | 'declined' | 'converted';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes?: string;
  terms?: string;
  items: EstimateItem[];
  created_at?: string;
  updated_at?: string;
}

export interface SavedItem {
  id: number;
  user_id?: number;
  name: string;
  description?: string;
  rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_invoices: number;
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  invoice_counts: {
    draft: number;
    sent: number;
    viewed: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
  total_clients: number;
  total_estimates: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, string | number>;
}
