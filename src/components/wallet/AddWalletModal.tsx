import React, { useState } from 'react';
import axiosInstance from '../../services/axiosInstance';
import type { Wallet } from '../../types';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddWalletModal: React.FC<AddWalletModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [currency, setCurrency] = useState('VND');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setIcon('');
    setCurrency('VND');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const newWallet: Omit<Wallet, 'id'> = { name, icon, currency };
      await axiosInstance.post('/wallets', newWallet);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error(err);
      alert('Thêm ví thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg transform transition-all scale-100">
        <h2 className="text-lg font-semibold mb-4">Thêm Ví Mới</h2>

        {/* Input name */}
        <input
          type="text"
          placeholder="Tên ví"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
        />

        {/* Input icon */}
        <input
          type="text"
          placeholder="Icon (emoji hoặc text)"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full mb-3 border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
        />

        {/* Input currency */}
        <input
          type="text"
          placeholder="Tiền tệ"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full mb-3 border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWalletModal;
