import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Wallet,
  DollarSign,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import type { Transaction } from '../../types';
import axiosInstance from '../../services/axiosInstance';
import AddTransactionModal from './AddTransactionModal';
import UpdateTransactionModal from './UpdateTransactionModal';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

interface PaginationInfo {
  currentPage: number; // zero-based
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const TransactionPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state (zero-based)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [noteSearch, setNoteSearch] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Debounce
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedNoteSearch = useDebounce(noteSearch, 500);

  // Fetch API
  const fetchTransactions = useCallback(
    async (
      page: number = 0,
      pageSize: number = 10,
      search: string = '',
      wallet: string = '',
      category: string = '',
      startDate: string = '',
      endDate: string = '',
      note: string = ''
    ) => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(search && { search }),
          ...(wallet && { wallet }),
          ...(category && { category }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          ...(note && { note }),
        });

        const response = await axiosInstance.get(
          `/transactions/my-transactions?${params}`
        );

        // API trả về PagedTransactionResponse
        const {
          items,
          currentPage,
          pageSize: resPageSize,
          totalItems,
          totalPages,
        } = response.data;

        setTransactions(items || []);
        setPagination({
          currentPage: currentPage ?? page,
          pageSize: resPageSize ?? pageSize,
          totalItems: totalItems ?? items?.length ?? 0,
          totalPages:
            totalPages ??
            Math.ceil((items?.length ?? 0) / (resPageSize ?? pageSize)),
        });
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Không thể tải danh sách giao dịch. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    },
    []
  );
  const handleOpenUpdate = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsUpdateOpen(true);
  };

  const handleCloseUpdate = () => {
    setIsUpdateOpen(false);
    setSelectedTransaction(null);
  };
  // Fetch khi filters thay đổi
  useEffect(() => {
    fetchTransactions(
      0, // reset về page 0 khi filter thay đổi
      pagination.pageSize,
      debouncedSearchTerm,
      selectedWallet,
      selectedCategory,
      dateRange.startDate,
      dateRange.endDate,
      debouncedNoteSearch
    );
  }, [
    debouncedSearchTerm,
    debouncedNoteSearch,
    selectedWallet,
    selectedCategory,
    dateRange.startDate,
    dateRange.endDate,
    fetchTransactions,
  ]);

  // Fetch khi đổi page
  useEffect(() => {
    fetchTransactions(
      pagination.currentPage,
      pagination.pageSize,
      debouncedSearchTerm,
      selectedWallet,
      selectedCategory,
      dateRange.startDate,
      dateRange.endDate,
      debouncedNoteSearch
    );
  }, [pagination.currentPage]);

  // Fetch khi đổi pageSize
  useEffect(() => {
    fetchTransactions(
      0,
      pagination.pageSize,
      debouncedSearchTerm,
      selectedWallet,
      selectedCategory,
      dateRange.startDate,
      dateRange.endDate,
      debouncedNoteSearch
    );
  }, [pagination.pageSize]);

  // Reload
  const reloadTransactions = useCallback(() => {
    fetchTransactions(
      pagination.currentPage,
      pagination.pageSize,
      debouncedSearchTerm,
      selectedWallet,
      selectedCategory,
      dateRange.startDate,
      dateRange.endDate,
      debouncedNoteSearch
    );
  }, [
    pagination.currentPage,
    pagination.pageSize,
    debouncedSearchTerm,
    debouncedNoteSearch,
    selectedWallet,
    selectedCategory,
    dateRange,
    fetchTransactions,
  ]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setNoteSearch('');
    setSelectedWallet('');
    setSelectedCategory('');
    setDateRange({ startDate: '', endDate: '' });
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination({
      currentPage: 0,
      pageSize: newPageSize,
      totalItems: 0,
      totalPages: 0,
    });
  };

  // Dropdown values
  const uniqueWallets = useMemo(
    () => [...new Set(transactions.map((t) => t.walletName))].filter(Boolean),
    [transactions]
  );
  const uniqueCategories = useMemo(
    () =>
      [...new Set(transactions.map((t) => t.categoryName))].filter(Boolean),
    [transactions]
  );

  // Utils
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));

  const getTransactionTypeColor = (amount: number) =>
    amount >= 0 ? 'text-green-600' : 'text-red-600';
  const getTransactionTypeBg = (amount: number) =>
    amount >= 0 ? 'bg-green-100' : 'bg-red-100';

  const getAllPaginationNumbers = () =>
    Array.from({ length: pagination.totalPages }, (_, i) => i); // zero-based array [0..n-1]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản Lý Giao Dịch
            </h1>
            <p className="text-gray-600 mt-1">
              Tổng cộng {pagination.totalItems} giao dịch
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={reloadTransactions}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                size={20}
                className={loading ? 'animate-spin' : ''}
              />{' '}
              Làm mới
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} /> Thêm Giao Dịch
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search chung */}
            <div className="relative lg:col-span-2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm chung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search theo note */}
            <div className="relative lg:col-span-2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo ghi chú..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Wallet */}
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả ví</option>
              {uniqueWallets.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {uniqueCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm text-gray-600">Từ ngày</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Đến ngày</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Clear filters */}
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter size={16} /> Xóa lọc
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">
                    Giao Dịch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium">
                    Ví / Danh Mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium">
                    Số Tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium">
                    Thời Gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6">
                      Đang tải...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-gray-500"
                    >
                      Không có giao dịch
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`h-10 w-10 rounded-full ${getTransactionTypeBg(
                              t.amount
                            )} flex items-center justify-center`}
                          >
                            <DollarSign
                              className={`h-5 w-5 ${getTransactionTypeColor(
                                t.amount
                              )}`}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">{t.note}</div>
                            <div className="text-sm text-gray-500">
                              ID: {t.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{t.walletName}</div>
                        <div className="text-sm text-gray-500">
                          {t.categoryName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`font-semibold ${getTransactionTypeColor(
                            t.amount
                          )}`}
                        >
                          {t.amount >= 0 ? '+' : ''}
                          {formatCurrency(t.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 flex items-center">
                        <Calendar size={16} className="mr-1" />{' '}
                        {formatDate(t.occurredAt)}
                      </td>
                      <td className="px-6 py-4 gap-8">
                        <div className="flex items-center gap-4">
                        <button className="text-green-600 hover:text-green-800" onClick={() => handleOpenUpdate(t)}>
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </button>
                        </div>
                       
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              onClick={() => handlePageChange(0)}
              disabled={pagination.currentPage === 0}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              « Đầu
            </button>

            {getAllPaginationNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 border rounded ${
                  pagination.currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {pageNum + 1}
              </button>
            ))}

            <button
              onClick={() =>
                handlePageChange(pagination.totalPages - 1)
              }
              disabled={
                pagination.currentPage === pagination.totalPages - 1
              }
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Cuối »
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={reloadTransactions}
      />
            <UpdateTransactionModal
        isOpen={isUpdateOpen}
        onClose={handleCloseUpdate}
        onSuccess={fetchTransactions}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default TransactionPage;
