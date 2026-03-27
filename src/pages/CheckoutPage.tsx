import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { DeliveryMethod, OrderRecord } from '../types/types';
import { PAYMENT_METHODS } from '../types/constants';

export const CheckoutPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { cart, settings, clearCart, addOrder, appliedCoupon, removeCoupon, groups, isStoreOpen } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.DELIVERY);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isStoreOpen) {
      navigate(`/${slug}`);
    }
  }, [isStoreOpen, navigate, slug]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
  const discount = appliedCoupon ? (appliedCoupon.type === 'percent' ? subtotal * (appliedCoupon.value / 100) : appliedCoupon.value) : 0;
  const total = Math.max(0, subtotal - discount) + (deliveryMethod === DeliveryMethod.DELIVERY ? settings.deliveryFee : 0);

  const handleFinish = () => {
    if (!customerName) return alert('Preencha o nome');
    if (deliveryMethod === DeliveryMethod.DELIVERY && !address) return alert('Preencha o endereço');

    const newOrder: OrderRecord = {
      id: Math.floor(Math.random() * 10000).toString(),
      date: new Date().toISOString(),
      customerName,
      whatsapp: phone,
      method: deliveryMethod,
      address,
      paymentMethod,
      total,
      itemsSummary: `${cart.length} itens`,
      status: 'pending',
      fullDetails: cart
    };

    addOrder(newOrder);

    const itemsText = cart.map(i => {
      let txt = `${i.quantity}x ${i.product.name}`;
      const selectedOptionsText: string[] = [];
      Object.entries(i.selectedOptions).forEach(([optionId, qty]) => {
        if ((qty as number) > 0) {
          for (const group of groups) {
            const option = group.options.find(opt => opt.id === optionId);
            if (option) {
              selectedOptionsText.push(`${option.name} ${qty}x`);
              break;
            }
          }
        }
      });

      if (selectedOptionsText.length > 0) {
        txt += `\n   (${selectedOptionsText.join(', ')})`;
      }
      if (i.note) txt += `\n   Obs: ${i.note}`;
      return txt;
    }).join('\n');

    const msg = `*Novo Pedido*\nCliente: ${customerName}\nTel: ${phone}\nTipo: ${deliveryMethod}\nEndereço: ${address}\nPagamento: ${paymentMethod}\n\nItens:\n${itemsText}${appliedCoupon ? `\n\nCupom: ${appliedCoupon.code} (-${formatCurrency(discount)})` : ''}\n\n*Total: ${formatCurrency(total)}*`;

    const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    clearCart();
    removeCoupon();
    navigate(`/${slug}`);
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #f0f0f5 0%, #e8e5f5 100%)' }}>
      <div className="sticky top-0 z-10 flex items-center px-4 h-14 header-glass" style={{ backgroundColor: 'var(--color-header-bg)' }}>
        <button onClick={() => navigate(`/${slug}/cart`)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 btn-press mr-3">
          <ChevronLeft size={22} className="text-white" />
        </button>
        <h1 className="font-heading font-bold text-white text-base">Finalizar Pedido</h1>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Seus dados</p>
          </div>
          <div className="px-4 pb-4 space-y-3">
            <input className="w-full py-3 px-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-purple-400" placeholder="Nome completo *" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            <input className="w-full py-3 px-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-purple-400" placeholder="WhatsApp (opcional)" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Método de entrega</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDeliveryMethod(DeliveryMethod.DELIVERY)} className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all btn-press flex flex-col items-center gap-1 ${deliveryMethod === DeliveryMethod.DELIVERY ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
              <span className="text-lg">🚲</span>
              <span>Entregar</span>
            </button>
            <button onClick={() => setDeliveryMethod(DeliveryMethod.PICKUP)} className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all btn-press flex flex-col items-center gap-1 ${deliveryMethod === DeliveryMethod.PICKUP ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
              <span className="text-lg">🛋️</span>
              <span>Retirar</span>
            </button>
          </div>

          {deliveryMethod === DeliveryMethod.DELIVERY && (
            <div className="mt-3 space-y-2">
              <select className="w-full py-3 px-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm outline-none focus:ring-2 focus:ring-purple-400">
                <option>Canaã dos Carajás</option>
              </select>
              <input className="w-full py-3 px-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-purple-400" placeholder="Rua / Logradouro *" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pagamento</p>
          <select className="w-full py-3 px-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 text-sm outline-none focus:ring-2 focus:ring-purple-400" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Desconto ({appliedCoupon.code})</span>
                <span>- {formatCurrency(discount)}</span>
              </div>
            )}
            {deliveryMethod === DeliveryMethod.DELIVERY && (
              <div className="flex justify-between text-gray-500">
                <span>Taxa de entrega</span>
                <span>{formatCurrency(settings.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-heading font-bold text-lg text-gray-800 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <button onClick={handleFinish} className="w-full py-4 rounded-2xl text-white font-heading font-bold text-base flex items-center justify-center gap-3 btn-press shadow-lg" style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}>
          Enviar via WhatsApp
        </button>
      </div>
    </div>
  );
};
