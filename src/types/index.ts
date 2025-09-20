export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  birthDate: string;
}

export interface Transaction {
  id: string;
  walletName: string;
  categoryName: string;
  amount: number;
  occurredAt: string;
  note: string;
  currency: string;
}

export interface MonthlyStats {
  totalTransactionToday: number;
  averageMonthlyExpense: number;
  topCategory: string;
}

export interface MonthlyBalance {
  totalIncome: number;
  totalExpense: number;
  net: number;
}
export interface Wallet {
  id: string;
  name: string;
  icon: string;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: number; // 0 = Expense, 1 = Income
}