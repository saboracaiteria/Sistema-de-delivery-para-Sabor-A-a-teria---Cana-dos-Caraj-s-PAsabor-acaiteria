import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Minus, Plus, Trash2, Edit, Tag } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const CartPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { cart, updateCartQuantity, removeFromCart, updateCartNote, settings, appliedCoupon, applyCoupon, removeCoupon, groups, isStoreOpen } = useApp();
  const navigate = useNavigate();
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <ShoppingCart size={40} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-heading font-bold text-gray-700 mb-2">Carrinho vazio</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Adicione itens do cardápio para continuar</p>
        <button
          onClick={() => navigate(`/${slug}`)}
          className="px-8 py-3 rounded-2xl text-white font-bold btn-press shadow-lg"
          style={{ backgroundColor: 'var(--color-button-primary)' }}
        >
          Ver Cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center px-4 h-14 header-glass"
        style={{ backgroundColor: 'var(--color-header-bg)' }}
      >
        <button onClick={() => navigate(`/${slug}`)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 btn-press mr-3">
          <ChevronLeft size={22} className="text-white" />
        </button>
        <h1 className="font-heading font-bold text-white text-base">Meu Pedido</h1>
        <span className="ml-auto text-white/70 text-sm">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</span>
      </div>

      {/* Cart Items */}
      <div className="p-4 space-y-3">
        {cart.map(item => {
          const selectedOptionsText: string[] = [];
          Object.entries(item.selectedOptions).forEach(([optionId, qty]) => {
            if ((qty as number) > 0) {
              for (const group of groups) {
                const option = group.options.find(opt => opt.id === optionId);
                if (option) {
                  selectedOptionsText.push(`${option.name} (${qty}x)`);
                  break;
                }
              }
            }
          });

          return (
            <div key={item.cartId} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex">
                {item.product.image && (
                  <div className="w-20 h-20 flex-shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 p-3">
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-1">{item.product.name}</h3>
                  <p className="text-emerald-600 font-bold text-sm mt-0.5">
                    {formatCurrency(item.totalPrice)}
                  </p>
                  {selectedOptionsText.length > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                      {selectedOptionsText.join(' • ')}
                    </p>
                  )}
                  {item.note && (
                    <p className="text-[10px] text-blue-500 mt-1 italic">“{item.note}”</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-50 px-3 py-2 flex items-center justify-between">
                <button
                  onClick={() => handleEditNote(item.cartId, item.note)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <Edit size={12} />
                  <span>{item.note ? 'Editar obs.' : 'Adicionar obs.'}</span>
                </button>

                <span className="text-xs text-gray-500 font-medium">
                  Subtotal: <strong className="text-gray-700">{formatCurrency(item.totalPrice * item.quantity)}</strong>
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-2 shadow-inner border border-gray-100">
                    <button
                      onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-red-600 bg-white hover:bg-red-50 transition-all shadow-sm active:scale-90 border border-gray-200"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-black text-gray-900 w-6 text-center tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-600 bg-white hover:bg-emerald-50 transition-all shadow-sm active:scale-90 border border-gray-200"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors active:scale-90"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingNote && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="text-base font-heading font-bold mb-4 text-gray-800">Observação</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={settings.notePlaceholder || "Digite aqui sua observação..."}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none text-sm bg-gray-50 resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setEditingNote(null); setNoteText(''); }}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 btn-press"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 py-3 rounded-xl font-bold text-white btn-press"
                style={{ backgroundColor: 'var(--color-header-bg)' }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] p-4">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 bg-gray-50">
              <Tag size={14} className="text-gray-400 flex-shrink-0" />
              <input
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="Cupom de desconto"
                className="flex-1 py-2.5 text-sm uppercase bg-transparent outline-none text-gray-700"
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              className="px-4 rounded-xl font-bold text-sm btn-press"
              style={{ backgroundColor: 'var(--color-header-bg)', color: 'white' }}
            >
              Aplicar
            </button>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">🎉</span>
                <span className="text-emerald-700 text-sm font-bold">{appliedCoupon.code} aplicado!</span>
              </div>
              <button onClick={removeCoupon} className="text-red-400 text-xs font-bold hover:text-red-600">Remover</button>
            </div>
          )}

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Desconto</span>
                <span>- {formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Taxa de entrega</span>
              <span>{formatCurrency(settings.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-heading font-bold text-base text-gray-800 pt-1.5 border-t border-gray-100">
              <span>Total</span>
              <span>{formatCurrency(finalTotal + settings.deliveryFee)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/${slug}`)}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl text-sm btn-press"
            >
              + Adicionar
            </button>
            {!isStoreOpen ? (
              <button
                disabled
                className="flex-2 flex-grow-[2] py-3 bg-gray-300 text-white font-bold rounded-xl text-sm cursor-not-allowed"
              >
                Loja Fechada
              </button>
            ) : (
              <button
                onClick={() => navigate(`/${slug}/checkout`)}
                className="flex-2 flex-grow-[2] py-3 text-white font-bold rounded-xl text-sm btn-press shadow-lg"
                style={{ backgroundColor: 'var(--color-button-primary)' }}
              >
                Finalizar Pedido
              </button>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};
