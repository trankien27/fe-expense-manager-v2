import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import type { Category } from '../../types';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setType('expense');
    setIcon('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/categories', {
        name,
        type,
        icon: icon || '📂', // icon mặc định
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Thêm danh mục thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Thêm Danh Mục</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên danh mục</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên danh mục..."
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Loại</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'income' | 'expense')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="income">Thu nhập</option>
              <option value="expense">Chi tiêu</option>
            </select>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium mb-1">Icon</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập emoji hoặc tên icon..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
