import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Edit, ToggleLeft } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Coupon } from '../../types/types';
import { ConfirmModal } from '../../ConfirmModal';

export const CouponsPage: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; code: string } | null>(null);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!editingCoupon.code || !editingCoupon.value) return;

    try {
      if (editingCoupon.id) {
        await updateCoupon(editingCoupon as Coupon);
      } else {
        const { id, ...newCoupon } = editingCoupon;
        await addCoupon({ ...newCoupon, active: true, usageCount: 0 } as Coupon);
      }
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      alert('Erro ao salvar cupom. Verifique se o código já existe.');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation) {
      await deleteCoupon(deleteConfirmation.id);
      setDeleteConfirmation(null);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/panel')} className="p-2 hover:bg-gray-200 rounded-lg"><ChevronLeft /></button>
          <h1 className="text-xl font-bold">Cupons</h1>
        </div>
        <button onClick={() => { setEditingCoupon({ type: 'percent' }); setIsModalOpen(true); }} className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
          <Plus />
        </button>
      </div>

      <div className="space-y-3">
        {coupons.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-lg flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-lg">{c.code}</p>
              <p className="text-sm text-gray-500">{c.type === 'percent' ? `${c.value}% OFF` : `R$ ${c.value} OFF`}</p>
              {c.minOrderValue && <p className="text-xs text-gray-400">Pedido mín: R$ {c.minOrderValue.toFixed(2)}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateCoupon({ ...c, active: !c.active })} className={`transition-colors ${c.active ? 'text-green-500' : 'text-gray-300'}`}>
                <ToggleLeft size={28} className={`transition-transform ${c.active ? 'rotate-180' : ''}`} />
              </button>
              <button onClick={() => { setEditingCoupon(c); setIsModalOpen(true); }} className="text-gray-400 hover:text-gray-600"><Edit size={18} /></button>
              <button onClick={() => setDeleteConfirmation({ id: c.id, code: c.code })} className="text-red-400 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4 shadow-2xl animate-fade-in">
            <h3 className="font-bold text-lg">{editingCoupon.id ? 'Editar' : 'Novo'} Cupom</h3>
            <input
              className="w-full border p-2 rounded uppercase text-gray-800 focus:ring-2 focus:ring-purple-400 outline-none" placeholder="CÓDIGO"
              value={editingCoupon.code || ''} onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
            />
            <div className="flex gap-2">
              <button onClick={() => setEditingCoupon({ ...editingCoupon, type: 'percent' })} className={`flex-1 py-2 border rounded font-medium transition-colors ${editingCoupon.type === 'percent' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'text-gray-500'}`}>%</button>
              <button onClick={() => setEditingCoupon({ ...editingCoupon, type: 'fixed' })} className={`flex-1 py-2 border rounded font-medium transition-colors ${editingCoupon.type === 'fixed' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'text-gray-500'}`}>R$</button>
            </div>
            <input
              type="number" className="w-full border p-2 rounded text-gray-800 focus:ring-2 focus:ring-purple-400 outline-none" placeholder="Valor"
              value={editingCoupon.value || ''} onChange={e => setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) })}
            />
            <input
              type="number"
              className="w-full border p-2 rounded text-gray-800 focus:ring-2 focus:ring-purple-400 outline-none"
              placeholder="Valor Mínimo do Pedido (opcional)"
              value={editingCoupon.minOrderValue || ''}
              onChange={e => setEditingCoupon({ ...editingCoupon, minOrderValue: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
            <div className="flex gap-2 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 text-gray-500 py-3 font-semibold hover:bg-gray-50 rounded-lg">Cancelar</button>
                <button onClick={handleSave} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 shadow-md">Salvar</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirmation}
        title="Excluir Cupom"
        message={`Tem certeza que deseja excluir o cupom "${deleteConfirmation?.code}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmation(null)}
        isDestructive
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};
