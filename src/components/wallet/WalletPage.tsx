import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Edit, Trash2 } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import AddWalletModal from './AddWalletModal';
import type { Wallet } from '../../types'; // lấy từ index.ts

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const WalletPage: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Fetch wallets
  const fetchWallets = useCallback(
    async (page: number = 0, pageSize: number = 10) => {
      try {
        setLoading(true);
        setError('');
        const response = await axiosInstance.get(`/wallets?page=${page}&pageSize=${pageSize}`);
        const { items, currentPage, pageSize: resPageSize, totalItems, totalPages } = response.data;
        setWallets(items || []);
        setPagination({
          currentPage: currentPage ?? page,
          pageSize: resPageSize ?? pageSize,
          totalItems: totalItems ?? items?.length ?? 0,
          totalPages: totalPages ?? 1,
        });
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách ví. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchWallets(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage, pagination.pageSize, fetchWallets]);

  const reloadWallets = () => fetchWallets(pagination.currentPage, pagination.pageSize);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản Lý Ví</h1>
          <div className="flex gap-3">
            <button
              onClick={reloadWallets}
              disabled={loading}
              className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={18} /> Thêm Ví
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Tên ví</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Icon</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Tiền tệ</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">Đang tải...</td>
                </tr>
              ) : wallets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">Không có ví nào</td>
                </tr>
              ) : (
                wallets.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{w.name}</td>
                    <td className="px-6 py-4 text-2xl">{w.icon}</td>
                    <td className="px-6 py-4">{w.currency}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button className="text-green-600 hover:text-green-800"><Edit size={16} /></button>
                      <button className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`px-3 py-1 border rounded ${pagination.currentPage === i ? 'bg-blue-600 text-white' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AddWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={reloadWallets}
      />
    </div>
  );
};

export default WalletPage;
