import React, { useEffect, useState } from 'react';
import type { Category, Wallet } from '../../types';
import axiosInstance from '../../services/axiosInstance';
import SearchableSelect from '../common/SearchableSelect';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_ICON = 'default-icon';
const DEFAULT_TYPE = 0;

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [loading, setLoading] = useState(false);

  // Load wallets + categories khi mở modal
  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchWallets();
      fetchCategories();
    }
  }, [isOpen]);

  const fetchWallets = async () => {
    try {
      const res = await axiosInstance.get('/wallets');
      setWallets(res.data.items || []);
    } catch (err) {
      console.error('Error fetching wallets:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories');
      setCategories(res.data.items || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/transactions', {
        walletId,
        categoryId,
        amount,
        note,
        occurredAt,
      });

      onSuccess();
      onClose(); // chỉ đóng, không reset ngay
    } catch (err) {
      console.error('Error adding transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setWalletId('');
    setCategoryId('');
    setAmount(0);
    setNote('');
    setOccurredAt('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Thêm Giao Dịch</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Wallet */}
          <div>
            <label className="block text-sm font-medium mb-1">Ví</label>
<SearchableSelect
  options={wallets.map((w) => ({ id: w.id, label: w.name }))}
  value={walletId}
  onChange={(val) => setWalletId(val)}
  placeholder="Chọn ví..."
/>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Danh mục</label>
<SearchableSelect
  options={categories.map((c) => ({ id: c.id, label: c.name }))}
  value={categoryId}
  onChange={(val) => setCategoryId(val)}
  placeholder="Chọn danh mục..."
/>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">Số tiền</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập số tiền..."
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập ghi chú..."
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

export default AddTransactionModal;
