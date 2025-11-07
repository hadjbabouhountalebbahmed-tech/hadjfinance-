
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // ISO string
  description: string;
  isRecurring?: boolean;
}

export enum DebtType {
  LENT = 'LENT',
  BORROWED = 'BORROWED'
}

export interface Debt {
  id: string;
  type: DebtType;
  person: string;
  amount: number;
  dueDate?: string; // ISO string
  interestRate?: number; // For structured loans
  description: string;
}

export interface Investment {
  id: string;
  name: string;
  country: string;
  sector: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  amount: number;
  shariaComplianceNotes: string;
}

export interface ZakatAssets {
  cash: number;
  goldInGrams: number;
}

export interface AppData {
  transactions: Transaction[];
  debts: Debt[];
  investments: Investment[];
  zakatAssets: ZakatAssets;
  settings: {
    goldPricePerGram: number;
  };
}

export type NavItem = 'dashboard' | 'transactions' | 'debts' | 'investments' | 'zakat' | 'taxes' | 'ai_space' | 'settings';
