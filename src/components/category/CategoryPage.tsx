import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Edit, Trash2 } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
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
  const [successMessage, setSuccessMessage] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);

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

  // Delete flow
  const handleOpenDelete = (category: Category) => {
    setCategoryToDelete(category);
    setConfirmDeleteChecked(false);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setCategoryToDelete(null);
    setConfirmDeleteChecked(false);
    setIsDeleteOpen(false);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/categories/${categoryToDelete.id}`);
      reload();
      handleCloseDelete();
      setSuccessMessage('Đã xoá danh mục thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Xoá thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out]">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Quản Lý Danh Mục
          </h1>
          <div className="flex gap-3">
            <button
              onClick={reload}
              disabled={loading}
              className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-md transition-all duration-300"
            >
              <Plus size={18} /> Thêm Danh Mục
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden animate-[fadeInUp_0.5s_ease-out]">
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
                  <td colSpan={4} className="text-center py-6">Đang tải...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">Không có danh mục</td>
                </tr>
              ) : (
                categories.map((c, index) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 transition-all duration-200 animate-[fadeInUp_0.4s_ease-out] opacity-0 [animation-fill-mode:forwards]"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4">{c.name}</td>
                    <td className="px-6 py-4">{c.type === 0 ? 'Chi tiêu' : 'Thu nhập'}</td>
                    <td className="px-6 py-4 text-2xl">{c.icon}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button
                        className="text-green-600 hover:text-green-800 hover:scale-110 transition-all duration-200"
                        onClick={() => {
                          setSelectedCategory(c);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 hover:scale-110 transition-all duration-200"
                        onClick={() => handleOpenDelete(c)}
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
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`px-3 py-1 border rounded ${pagination.currentPage === i ? 'bg-blue-600 text-white' : 'bg-white'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={reload}
      />

      {/* Edit Category Modal */}
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

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md transform transition-all scale-95 animate-[scaleIn_0.3s_ease-out]">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Xác nhận xoá danh mục</h2>
            <p className="text-slate-600 mb-4">
              Bạn có chắc chắn muốn xoá danh mục{' '}
              <span className="font-medium text-slate-800">"{categoryToDelete?.name}"</span> không?
            </p>

            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg p-3 mb-4 flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Khi xoá danh mục này, <strong>các giao dịch liên quan</strong> cũng có thể bị ảnh hưởng và không thể khôi phục.
              </span>
            </div>

            {/* Checkbox confirm */}
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-6">
              <input
                type="checkbox"
                checked={confirmDeleteChecked}
                onChange={(e) => setConfirmDeleteChecked(e.target.checked)}
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              Tôi hiểu rủi ro này và vẫn muốn xoá danh mục.
            </label>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseDelete}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                Huỷ
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || !confirmDeleteChecked}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Đang xoá...' : 'Xoá'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg animate-[slideUp_0.4s_ease-out]">
          {successMessage}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default CategoryPage;
