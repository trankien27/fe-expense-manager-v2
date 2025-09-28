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
  TrendingUp,
  TrendingDown,
  X,
  ChevronLeft,
  ChevronRight,
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
  const [showFilters, setShowFilters] = useState(false);
const [isDeleteOpen, setIsDeleteOpen] = useState(false);
const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
const [successMessage, setSuccessMessage] = useState('');
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
  const handleOpenDelete = (transaction: Transaction) => {
  setTransactionToDelete(transaction);
  setIsDeleteOpen(true);
};

const handleCloseDelete = () => {
  setTransactionToDelete(null);
  setIsDeleteOpen(false);
};
const handleDelete = async () => {
  if (!transactionToDelete) return;
  try {
    setLoading(true);
    await axiosInstance.delete(`/transactions/${transactionToDelete.id}`);
    reloadTransactions();
    handleCloseDelete();
     setSuccessMessage('Đã xoá giao dịch thành công!');
    setTimeout(() => setSuccessMessage(''), 3000); // tự tắt sau 3s
  } catch (err) {
    console.error('Error deleting transaction:', err);
    setError('Không thể xoá giao dịch. Vui lòng thử lại.');
  } finally {
    setLoading(false);
  }
};
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
    amount >= 0 ? 'text-emerald-600' : 'text-rose-600';
  const getTransactionTypeBg = (amount: number) =>
    amount >= 0 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' : 'bg-gradient-to-br from-rose-50 to-rose-100';

  const getPaginationNumbers = () => {
    const current = pagination.currentPage;
    const total = pagination.totalPages;
    const delta = 2;
    
    let pages: (number | string)[] = [];
    
    if (total <= 7) {
      pages = Array.from({ length: total }, (_, i) => i);
    } else {
      const left = Math.max(0, current - delta);
      const right = Math.min(total - 1, current + delta);
      
      if (left > 0) pages.push(0);
      if (left > 1) pages.push('...');
      
      for (let i = left; i <= right; i++) {
        pages.push(i);
      }
      
      if (right < total - 2) pages.push('...');
      if (right < total - 1) pages.push(total - 1);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-700">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header với animation slide in */}
        <div className="mb-8 animate-[slideDown_0.6s_ease-out] opacity-0 [animation-fill-mode:forwards]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Quản Lý Giao Dịch
              </h1>
              <p className="text-slate-600 flex items-center gap-2">
                <Wallet size={16} className="text-blue-500" />
                Tổng cộng {pagination.totalItems.toLocaleString()} giao dịch
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={reloadTransactions}
                disabled={loading}
                className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <RefreshCw
                  size={20}
                  className={`transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}
                />
                Làm mới
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                Thêm Giao Dịch
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toggle Button */}
        <div className="mb-6 animate-[slideUp_0.7s_ease-out_0.1s] opacity-0 [animation-fill-mode:forwards]">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-md"
          >
            <Filter size={20} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </button>
        </div>

        {/* Filters với animation collapse */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 p-6 border border-white/50 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search chung */}
              <div className="relative lg:col-span-2 group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm chung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-slate-300"
                />
              </div>

              {/* Search theo note */}
              <div className="relative lg:col-span-2 group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo ghi chú..."
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-slate-300"
                />
              </div>

              {/* Wallet */}
              <select
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
                className="px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-slate-300"
              >
                <option value="">Tất cả ví</option>
                {uniqueWallets.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>

              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-slate-300"
              >
                <option value="">Tất cả danh mục</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Từ ngày</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Đến ngày</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-slate-300"
                />
              </div>
            </div>

            {/* Clear filters */}
            <div className="mt-6">
              <button
                onClick={clearFilters}
                className="group px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl hover:border-slate-300 flex items-center gap-2 transition-all duration-300 hover:shadow-md"
              >
                <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {/* Error với animation */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4 rounded-xl mb-6 text-red-700 animate-[slideUp_0.3s_ease-out] shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              {error}
            </div>
          </div>
        )}

        {/* Table với animation stagger */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-white/50 animate-[slideUp_0.8s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Giao Dịch
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Ví / Danh Mục
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Số Tiền
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Thời Gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <span className="ml-3 text-slate-600">Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center space-y-2">
                        <Wallet size={48} className="text-slate-300" />
                        <span>Không có giao dịch</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, index) => (
                    <tr 
                      key={t.id} 
                      className="group hover:bg-slate-50 transition-all duration-200 animate-[fadeInUp_0.4s_ease-out] opacity-0 [animation-fill-mode:forwards]"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`h-12 w-12 rounded-full ${getTransactionTypeBg(
                              t.amount
                            )} flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-110`}
                          >
                            {t.amount >= 0 ? (
                              <TrendingUp
                                className={`h-5 w-5 ${getTransactionTypeColor(
                                  t.amount
                                )}`}
                              />
                            ) : (
                              <TrendingDown
                                className={`h-5 w-5 ${getTransactionTypeColor(
                                  t.amount
                                )}`}
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-slate-900 group-hover:text-slate-700 transition-colors duration-200">
                              {t.note}
                            </div>
                            <div className="text-sm text-slate-500">
                              ID: {t.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{t.walletName}</div>
                        <div className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-md inline-block mt-1">
                          {t.categoryName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`font-bold text-lg ${getTransactionTypeColor(
                            t.amount
                          )} transition-colors duration-200`}
                        >
                          {t.amount >= 0 ? '+' : ''}
                          {formatCurrency(t.amount)}
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                          {t.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                          <Calendar size={16} className="mr-2 text-blue-500" />
                          <span className="text-sm font-medium">{formatDate(t.occurredAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button 
                            className="group/btn p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:shadow-sm"
                            onClick={() => handleOpenUpdate(t)}
                          >
                            <Edit size={16} className="group-hover/btn:scale-110 transition-transform duration-200" />
                          </button>
                          <button onClick={() => handleOpenDelete(t)} className="group/btn p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                            <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform duration-200" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination với animation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Hiển thị {((pagination.currentPage) * pagination.pageSize) + 1} đến {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalItems)} trong tổng số {pagination.totalItems} giao dịch
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, pagination.currentPage - 1))}
                disabled={pagination.currentPage === 0}
                className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all duration-200 group"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
              </button>

              <div className="flex items-center gap-1">
                {getPaginationNumbers().map((pageNum, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : undefined}
                    disabled={typeof pageNum === 'string'}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      pagination.currentPage === pageNum
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                        : typeof pageNum === 'string'
                        ? 'cursor-default text-slate-400'
                        : 'hover:bg-white hover:shadow-sm border border-slate-200'
                    }`}
                  >
                    {typeof pageNum === 'number' ? pageNum + 1 : pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.currentPage + 1))}
                disabled={pagination.currentPage === pagination.totalPages - 1}
                className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all duration-200 group"
              >
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>
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
{isDeleteOpen && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-[slideUp_0.3s_ease-out]">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Xác nhận xoá giao dịch
      </h2>
      <p className="text-slate-600 mb-6">
        Bạn có chắc chắn muốn xoá giao dịch{' '}
        <span className="font-medium text-slate-800">
          "{transactionToDelete?.note}"
        </span>{' '}
        không?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={handleCloseDelete}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
        >
          Huỷ
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Đang xoá...' : 'Xoá'}
        </button>
      </div>
    </div>
  </div>
)}
{successMessage && (
  <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg animate-[slideUp_0.3s_ease-out]">
    {successMessage}
  </div>
)}
      {/* CSS cho custom animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionPage;