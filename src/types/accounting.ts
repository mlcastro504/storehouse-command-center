
// Tipos para el módulo de contabilidad completo

export interface Account {
  id: string;
  code: string;
  name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  account_nature: 'debit' | 'credit'; // naturaleza deudora o acreedora
  parent_id?: string;
  is_active: boolean;
  description?: string;
  level: number; // nivel jerárquico
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  description: string;
  entry_date: string;
  reference?: string;
  reference_type?: 'invoice' | 'payment' | 'adjustment' | 'manual';
  reference_id?: string;
  total_amount: number;
  status: 'draft' | 'posted' | 'cancelled';
  period_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  entry_lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  created_at: string;
  account?: Account;
}

export interface Contact {
  id: string;
  contact_number: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  contact_type: 'customer' | 'supplier' | 'both';
  payment_terms: string;
  credit_limit?: number;
  currency: string;
  associated_account_id?: string; // cuenta contable asociada
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  contact_id: string;
  invoice_type: 'sale' | 'purchase';
  invoice_date: string;
  due_date?: string;
  currency: string;
  exchange_rate: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  journal_entry_id?: string; // asiento contable asociado
  created_by: string;
  created_at: string;
  updated_at: string;
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
  tax_amount: number;
  line_total: number;
  account_id?: string; // cuenta de ingreso/gasto
  created_at: string;
}

export interface Payment {
  id: string;
  payment_number: string;
  payment_type: 'received' | 'made';
  contact_id: string;
  payment_date: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  payment_method: 'cash' | 'transfer' | 'card' | 'check' | 'other';
  reference?: string;
  notes?: string;
  journal_entry_id?: string; // asiento contable asociado
  status: 'pending' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
  contact?: Contact;
  payment_invoices?: PaymentInvoice[];
}

export interface PaymentInvoice {
  id: string;
  payment_id: string;
  invoice_id: string;
  amount_applied: number;
  created_at: string;
  invoice?: Invoice;
}

export interface TaxType {
  id: string;
  name: string;
  code: string;
  rate: number;
  tax_type: 'sales' | 'purchase' | 'withholding';
  account_id: string; // cuenta contable para el impuesto
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountingPeriod {
  id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed';
  closed_by?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BalanceTrial {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  opening_balance: number;
  debit_total: number;
  credit_total: number;
  closing_balance: number;
}

export interface FinancialReport {
  id: string;
  report_type: 'journal' | 'ledger' | 'trial_balance' | 'income_statement' | 'balance_sheet' | 'cash_flow';
  report_name: string;
  period_start: string;
  period_end: string;
  parameters: Record<string, any>;
  generated_by: string;
  generated_at: string;
  file_url?: string;
}

// Tipos para reportes específicos
export interface IncomeStatementLine {
  account_type: 'revenue' | 'expense';
  account_name: string;
  amount: number;
  percentage: number;
}

export interface BalanceSheetLine {
  account_type: 'asset' | 'liability' | 'equity';
  account_name: string;
  amount: number;
  percentage: number;
}

export interface CashFlowLine {
  category: 'operating' | 'investing' | 'financing';
  description: string;
  amount: number;
}

// Tipos para datos de creación
export interface CreateAccountData {
  code: string;
  name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  account_nature: 'debit' | 'credit';
  parent_id?: string;
  description?: string;
}

export interface CreateJournalEntryData {
  description: string;
  entry_date: string;
  reference?: string;
  reference_type?: 'invoice' | 'payment' | 'adjustment' | 'manual';
  reference_id?: string;
  entry_lines: {
    account_id: string;
    debit_amount: number;
    credit_amount: number;
    description?: string;
  }[];
}

export interface CreateInvoiceData {
  contact_id: string;
  invoice_type: 'sale' | 'purchase';
  invoice_date: string;
  due_date?: string;
  currency: string;
  notes?: string;
  invoice_lines: {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    account_id?: string;
  }[];
}

export interface CreatePaymentData {
  payment_type: 'received' | 'made';
  contact_id: string;
  payment_date: string;
  amount: number;
  currency: string;
  payment_method: 'cash' | 'transfer' | 'card' | 'check' | 'other';
  reference?: string;
  notes?: string;
  invoice_applications?: {
    invoice_id: string;
    amount_applied: number;
  }[];
}
