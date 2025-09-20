import React, { useEffect, useState } from 'react';
import type { Transaction } from '../types';
import axiosInstance from '../services/axiosInstance';
import { Clock } from 'lucide-react';

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      // API trả về PagedTransactionResponse
      const response = await axiosInstance.get(
        '/transactions/my-transactions?page=0&pageSize=7'
      );

      setTransactions(response.data.items || []);
    } catch (err) {
      setError('Không thể tải giao dịch gần đây');
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

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Giao dịch gần đây
        </h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 animate-pulse"
            >
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Giao dịch gần đây
        </h3>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Giao dịch gần đây
      </h3>

      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Chưa có giao dịch nào
        </p>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    transaction.amount < 0 ? 'bg-red-100' : 'bg-green-100'
                  }`}
                >
                  <Clock
                    className={`h-4 w-4 ${
                      transaction.amount < 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.categoryName}
                  </p>
                  <p className="text-sm text-gray-500">{transaction.note}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(transaction.occurredAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold ${
                    transaction.amount < 0
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-400">
                  {transaction.walletName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
