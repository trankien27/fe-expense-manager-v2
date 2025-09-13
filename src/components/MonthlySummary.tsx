import React, { useEffect, useState } from 'react';
import type { MonthlyBalance } from '../types';
import axiosInstance from '../services/axiosInstance';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const MonthlySummary: React.FC = () => {
  const [monthlyBalance, setMonthlyBalance] = useState<MonthlyBalance>({
    totalIncome: 0,
    totalExpense: 0,
    net: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchMonthlyBalance();
  }, []);

  const fetchMonthlyBalance = async () => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await axiosInstance.get<MonthlyBalance>(
        `/transactions/monthly-balance?year=${year}&month=${month}`
      );
      
      setMonthlyBalance(response.data);
    } catch (err) {
      setError('Không thể tải dữ liệu tháng này');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Thu nhập tháng này</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyBalance.totalIncome)}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Chi tiêu tháng này</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(Math.abs(monthlyBalance.totalExpense))}
            </p>
          </div>
          <TrendingDown className="h-8 w-8 text-red-600" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Số dư hiện tại</p>
            <p className={`text-2xl font-bold ${monthlyBalance.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthlyBalance.net)}
            </p>
          </div>
          <Wallet className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;