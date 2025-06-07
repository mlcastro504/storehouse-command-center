
// Tipos para el módulo de contabilidad

export interface Account {
  id: string;
  code: string;
  name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id?: string;
  is_active: boolean;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  transaction_number: string;
  description: string;
  transaction_date: string;
  reference?: string;
  total_amount: number;
  user_id: string;
  status: 'draft' | 'posted' | 'cancelled';
  created_at: Date;
  updated_at: Date;
  journal_entries?: JournalEntry[];
}

export interface JournalEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  created_at: Date;
  account?: Account;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  contact_type: 'customer' | 'supplier' | 'both';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  contact_id: string;
  invoice_type: 'sale' | 'purchase';
  invoice_date: string;
  due_date?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  contact?: Contact;
  invoice_lines?: InvoiceLine[];
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
  created_at: Date;
}
