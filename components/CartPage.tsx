import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Edit, Plus, Minus, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../storeUtils';

export const CartPage = () => {
  const { store, cart, updateCartQuantity, removeFromCart, updateCartNote, settings, checkStoreStatus, appliedCoupon, applyCoupon, removeCoupon, groups, isStoreOpen } = useApp();
  const navigate = useNavigate();
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const activeItems = cart.filter(item => item.quantity > 0);
  const subtotal = activeItems.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
  const discount = appliedCoupon ? (appliedCoupon.type === 'percent' ? subtotal * (appliedCoupon.value / 100) : appliedCoupon.value) : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponCode);
    if (result.success) {
      setCouponCode('');
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleEditNote = (cartId: string, currentNote?: string) => {
    setEditingNote(cartId);
    setNoteText(currentNote || '');
  };

  const handleSaveNote = () => {
    if (editingNote) {
      updateCartNote(editingNote, noteText);
      setEditingNote(null);
      setNoteText('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f6f6f6]">
        <ShoppingCart size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600">Seu carrinho está vazio</h2>
        <button onClick={() => navigate(`/${store?.slug || ''}`)} className="mt-6 px-6 py-2 bg-brand-red text-white rounded-lg font-bold">Voltar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] pb-32">
      {/* Custom Cart Header */}
      <div className="bg-brand-purple text-white p-4 text-center font-bold sticky top-0 z-10">
        CONFIRA SEU PEDIDO!
      </div>

      <div className="p-4 space-y-3">
        {cart.map(item => {
          // Get option names for this item
          const selectedOptionsText: string[] = [];
          Object.entries(item.selectedOptions).forEach(([optionId, qty]) => {
            if ((qty as number) > 0) {
              for (const group of groups) {
                const option = group.options.find(opt => opt.id === optionId);
                if (option) {
                  selectedOptionsText.push(`+ ${option.name} (${qty}x)`);
                  break;
                }
              }
            }
          });

          return (
            <div key={item.cartId} className="bg-white p-3 rounded shadow-sm border border-gray-200 flex justify-between">
              <div className="flex flex-col justify-between items-start flex-1 pr-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm uppercase">{item.product.name}</h3>
                  <p className="text-gray-500 text-xs">R$ {item.totalPrice.toFixed(2)}</p>
                  {selectedOptionsText.length > 0 && (
                    <div className="mt-1">
                      {selectedOptionsText.map((opt, idx) => (
                        <p key={idx} className="text-[10px] text-gray-600">{opt}</p>
                      ))}
                    </div>
                  )}
                  {item.note && <p className="text-[10px] text-blue-600 mt-1 italic">Obs: {item.note}</p>}
                </div>

                <div className="mt-2">
                  <p className="font-bold text-sm mb-2">Subtotal: R$ {(item.totalPrice * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => handleEditNote(item.cartId, item.note)}
                    className="bg-red-600 text-white text-[10px] font-bold px-4 py-1 rounded flex items-center gap-1 hover:bg-red-700"
                  >
                    <Edit size={10} /> OBSERVAÇÃO
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <button 
                  onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)} 
                  className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center shadow-md active:scale-95 transition-transform"
                >
                  <Plus size={18} />
                </button>
                
                <div className="flex flex-col items-center">
                  <input 
                    type="number"
                    min="0"
                    value={item.quantity === 0 ? "" : item.quantity}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                      if (!isNaN(val)) {
                        updateCartQuantity(item.cartId, val);
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="font-bold text-lg w-12 h-10 text-center bg-gray-50 border-2 border-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent outline-none transition-all shadow-inner"
                  />
                </div>

                <button 
                  onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)} 
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center shadow-sm active:scale-95 transition-transform ${item.quantity > 1 ? 'bg-white text-red-600 border-gray-200' : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'}`}
                  disabled={item.quantity <= 1}
                >
                  <Minus size={18} />
                </button>

                <button 
                  onClick={() => {
                    if (confirm('Deseja remover este item do carrinho?')) {
                      removeFromCart(item.cartId);
                    }
                  }} 
                  className="mt-1 p-2 text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note Edit Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Adicionar Observação</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ex: Sem cebola, caprichar no molho..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setEditingNote(null); setNoteText(''); }}
                className="flex-1 py-3 bg-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )
      }

      {/* Cart Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f6f6f6] border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <div className="mb-4 bg-white p-3 rounded shadow-sm">
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="Cupom de desconto"
                className="flex-1 border p-2 rounded text-sm uppercase"
              />
              <button onClick={handleApplyCoupon} className="bg-purple-600 text-white px-4 rounded font-bold text-sm">
                APLICAR
              </button>
            </div>
            {appliedCoupon && (
              <div className="mt-2 flex justify-between items-center bg-green-50 p-2 rounded border border-green-200">
                <span className="text-green-700 text-sm font-bold">Cupom: {appliedCoupon.code}</span>
                <button onClick={removeCoupon} className="text-red-500 text-xs font-bold">REMOVER</button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 mb-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600 font-bold">
                <span>Desconto</span>
                <span>- {formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Taxa de Entrega</span>
              <span>{formatCurrency(settings.deliveryFee)}</span>
            </div>
          </div>

          <div className="flex justify-center mb-2">
            <span className="bg-black text-white px-4 py-1 rounded font-bold text-sm">TOTAL {formatCurrency(finalTotal)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/${store?.slug || ''}`)} className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded text-xs uppercase">
              CONTINUAR COMPRANDO
            </button>
            {!isStoreOpen ? (
              <button disabled className="flex-1 py-3 bg-gray-400 text-white font-bold rounded text-xs uppercase cursor-not-allowed flex flex-col items-center justify-center leading-tight">
                <span>LOJA FECHADA</span>
                <span className="text-[9px]">Não aceitamos pedidos</span>
              </button>
            ) : (
            <button 
              onClick={() => navigate(`/${store?.slug}/checkout`)} 
              disabled={activeItems.length === 0}
              className={`flex-1 py-3 text-white font-bold rounded text-xs uppercase transition-colors ${activeItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
            >
              FINALIZAR PEDIDO
            </button>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};
