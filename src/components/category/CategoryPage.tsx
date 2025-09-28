import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Edit, Trash2 } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
// import AddCategoryModal from './AddCategoryModal';
// import EditCategoryModal from './EditCategoryModal';
import type { Category } from '../../types';
import AddCategoryModal from './AddCategoryModal';
import EditCategoryModal from './EditCategoryModal';

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Fetch categories
  const fetchCategories = useCallback(
    async (page: number = 0, pageSize: number = 10) => {
      try {
        setLoading(true);
        setError('');
        const res = await axiosInstance.get(`/categories?page=${page}&pageSize=${pageSize}`);
        const { items, currentPage, pageSize: resPageSize, totalItems, totalPages } = res.data;
        setCategories(items || []);
        setPagination({
          currentPage: currentPage ?? page,
          pageSize: resPageSize ?? pageSize,
          totalItems: totalItems ?? items?.length ?? 0,
          totalPages: totalPages ?? 1,
        });
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh mục. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCategories(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage, pagination.pageSize, fetchCategories]);

  const reload = () => fetchCategories(pagination.currentPage, pagination.pageSize);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá danh mục này?')) return;
    try {
      await axiosInstance.delete(`/categories/${id}`);
      reload();
    } catch (err) {
      console.error(err);
      alert('Xoá thất bại.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản Lý Danh Mục</h1>
          <div className="flex gap-3">
            <button
              onClick={reload}
              disabled={loading}
              className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={18} /> Thêm Danh Mục
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
                <th className="px-6 py-3 text-left text-sm font-medium">Tên</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Loại</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Icon</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">Đang tải...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">Không có danh mục</td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{c.name}</td>
                    <td className="px-6 py-4">{c.type}</td>
                    <td className="px-6 py-4 text-2xl">{c.icon}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button
                        className="text-green-600 hover:text-green-800"
                        onClick={() => {
                          setSelectedCategory(c);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 size={16} />
                      </button>
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

      {/* Modals */}
      <AddCategoryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={reload}
      />
      {selectedCategory && (
        <EditCategoryModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
          onSuccess={reload}
        />
      )}
    </div>
  );
};

export default CategoryPage;
