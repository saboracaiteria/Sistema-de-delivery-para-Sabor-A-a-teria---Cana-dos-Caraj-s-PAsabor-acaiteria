import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Info, AlertCircle, Phone, CheckCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { DeliveryMethod, OrderRecord } from '../types';
import { formatCurrency } from '../storeUtils';
import { PAYMENT_METHODS } from '../constants';

export const CheckoutPage = () => {
  const { store, cart, settings, clearCart, addOrder, appliedCoupon, removeCoupon, groups, isStoreOpen } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.DELIVERY);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isStoreOpen) {
      navigate(`/${store?.slug || ''}`);
    }
  }, [isStoreOpen, navigate]);

  const activeItems = cart.filter(item => item.quantity > 0);
  const subtotal = activeItems.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
  const discount = appliedCoupon ? (appliedCoupon.type === 'percent' ? subtotal * (appliedCoupon.value / 100) : appliedCoupon.value) : 0;
  const total = Math.max(0, subtotal - discount) + (deliveryMethod === DeliveryMethod.DELIVERY ? settings.deliveryFee : 0);

  const storeName = settings.storeName || store?.name || 'Loja';

  const buildItemsText = () => {
    return cart.filter(i => i.quantity > 0).map(i => {
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
  };

  const createOrder = (isQuote: boolean) => {
    const activeCart = cart.filter(i => i.quantity > 0);
    const newOrder: OrderRecord = {
      id: Math.floor(Math.random() * 10000).toString(),
      date: new Date().toISOString(),
      customerName,
      whatsapp: phone,
      method: deliveryMethod,
      address,
      paymentMethod,
      total,
      itemsSummary: `${activeCart.length} itens`,
      status: 'pending',
      fullDetails: activeCart,
      isQuote,
    };
    addOrder(newOrder);
    return newOrder;
  };

  const handleSendOrder = () => {
    if (!customerName) return alert('Preencha o nome');
    if (deliveryMethod === DeliveryMethod.DELIVERY && !address) return alert('Preencha o endereço');

    createOrder(false);
    const itemsText = buildItemsText();
    const msg = `*Novo Pedido - ${storeName}*\nCliente: ${customerName}\nTel: ${phone}\nTipo: ${deliveryMethod}\nEndereço: ${address}\nPagamento: ${paymentMethod}\n\nItens:\n${itemsText}${appliedCoupon ? `\n\nCupom: ${appliedCoupon.code} (-${formatCurrency(discount)})` : ''}\n\n*Total: ${formatCurrency(total)}*\n\n_⚠️ Pedido sujeito a revisão. Você poderá receber um desconto especial!_`;

    const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    clearCart();
    removeCoupon();
    setShowConfirmation(true);
  };

  const handleSendQuoteWhatsApp = () => {
    if (!customerName) return alert('Preencha o nome');

    createOrder(true);
    const itemsText = buildItemsText();
    const msg = `*📋 ORÇAMENTO - ${storeName}*\n\nCliente: ${customerName}\nTel: ${phone}\n\nItens:\n${itemsText}${appliedCoupon ? `\n\nCupom: ${appliedCoupon.code} (-${formatCurrency(discount)})` : ''}\n\n*Subtotal: ${formatCurrency(subtotal)}*\n${deliveryMethod === DeliveryMethod.DELIVERY ? `Taxa de Entrega: ${formatCurrency(settings.deliveryFee)}\n` : ''}*Total Estimado: ${formatCurrency(total)}*\n\n_⚠️ Orçamento sujeito a revisão. Você poderá receber um desconto especial!_\n_📅 Válido por 24 horas_`;

    const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    clearCart();
    removeCoupon();
    setShowConfirmation(true);
  };

  const handleDownloadQuotePDF = async () => {
    if (!customerName) return alert('Preencha o nome');

    createOrder(true);

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`ORÇAMENTO`, 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(storeName, 105, 30, { align: 'center' });

    // Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const today = new Date();
    doc.text(`Data: ${today.toLocaleDateString('pt-BR')}`, 14, 45);
    doc.text(`Cliente: ${customerName}`, 14, 52);
    if (phone) doc.text(`Telefone: ${phone}`, 14, 59);

    // Separator
    doc.setDrawColor(200);
    doc.line(14, 65, 196, 65);

    // Items header
    let y = 75;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Qtd', 14, y);
    doc.text('Item', 30, y);
    doc.text('Preço Un.', 130, y);
    doc.text('Subtotal', 165, y);
    doc.line(14, y + 2, 196, y + 2);

    // Items
    y += 10;
    doc.setFont('helvetica', 'normal');
    cart.filter(item => item.quantity > 0).forEach(item => {
      doc.text(`${item.quantity}x`, 14, y);
      doc.text(item.product.name.substring(0, 40), 30, y);
      doc.text(`R$ ${item.totalPrice.toFixed(2)}`, 130, y);
      doc.text(`R$ ${(item.totalPrice * item.quantity).toFixed(2)}`, 165, y);
      y += 7;

      // Options
      const options: string[] = [];
      Object.entries(item.selectedOptions).forEach(([optionId, qty]) => {
        if ((qty as number) > 0) {
          for (const group of groups) {
            const opt = group.options.find(o => o.id === optionId);
            if (opt) { options.push(`${opt.name} (${qty}x)`); break; }
          }
        }
      });
      if (options.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`   → ${options.join(', ')}`, 30, y);
        doc.setFontSize(10);
        doc.setTextColor(0);
        y += 6;
      }
      if (item.note) {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`   Obs: ${item.note}`, 30, y);
        doc.setFontSize(10);
        doc.setTextColor(0);
        y += 6;
      }
    });

    // Totals
    y += 5;
    doc.line(14, y, 196, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, 130, y);
    doc.text(`R$ ${subtotal.toFixed(2)}`, 165, y);
    if (appliedCoupon) {
      y += 7;
      doc.setTextColor(0, 128, 0);
      doc.text(`Desconto (${appliedCoupon.code}):`, 130, y);
      doc.text(`- R$ ${discount.toFixed(2)}`, 165, y);
      doc.setTextColor(0);
    }
    if (deliveryMethod === DeliveryMethod.DELIVERY) {
      y += 7;
      doc.text(`Taxa de Entrega:`, 130, y);
      doc.text(`R$ ${settings.deliveryFee.toFixed(2)}`, 165, y);
    }
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL ESTIMADO:`, 110, y);
    doc.text(`R$ ${total.toFixed(2)}`, 165, y);

    // Footer
    y += 20;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120);
    doc.text('⚠️ Orçamento sujeito a revisão. Você poderá receber um desconto especial!', 14, y);
    doc.text('Válido por 24 horas.', 14, y + 6);

    doc.save(`orcamento_${storeName.replace(/\s+/g, '_')}_${today.toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);

    clearCart();
    removeCoupon();
    setShowConfirmation(true);
  };

  // Confirmation screen after sending
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-700 flex flex-col items-center justify-center p-6 text-white text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <CheckCircle size={80} className="mb-6" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-3">Enviado com Sucesso!</h2>
        <p className="text-green-100 mb-2 text-sm max-w-sm">
          Seu pedido/orçamento foi enviado e será revisado pela loja.
        </p>
        <div className="bg-white/20 rounded-xl p-4 mt-4 max-w-sm backdrop-blur-sm">
          <p className="text-sm font-medium">
            🎉 Você poderá receber um <strong>desconto especial</strong> após a revisão!
          </p>
        </div>
        <button
          onClick={() => navigate(`/${store?.slug}`)}
          className="mt-8 bg-white text-green-700 font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          Voltar para a Loja
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#333] p-4 text-white">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(`/${store?.slug}/cart`)}><ChevronLeft /></button>
          <h2 className="ml-4 font-bold">PREENCHA OS CAMPOS</h2>
        </div>

        <div className="bg-white rounded-lg p-4 text-gray-800 space-y-4 shadow-lg">
          <input className="w-full border p-2 rounded bg-white" placeholder="Nome completo" value={customerName} onChange={e => setCustomerName(e.target.value)} />
          <input className="w-full border p-2 rounded bg-white" placeholder="WhatsApp (Opcional)" value={phone} onChange={e => setPhone(e.target.value)} />

          <div className="flex border rounded overflow-hidden">
            <button onClick={() => setDeliveryMethod(DeliveryMethod.DELIVERY)} className={`flex-1 py-2 ${deliveryMethod === DeliveryMethod.DELIVERY ? 'bg-gray-100 font-bold' : 'bg-white'}`}>ENTREGAR</button>
            <button onClick={() => setDeliveryMethod(DeliveryMethod.PICKUP)} className={`flex-1 py-2 ${deliveryMethod === DeliveryMethod.PICKUP ? 'bg-gray-100 font-bold' : 'bg-white'}`}>VOU RETIRAR</button>
          </div>

          {deliveryMethod === DeliveryMethod.DELIVERY && (
            <div className="space-y-2">
              <select className="w-full border p-2 rounded bg-white text-gray-500">
                <option>Selecione o Município</option>
                <option>Sua Cidade</option>
              </select>
              <input className="w-full border p-2 rounded bg-white" placeholder="Bairro" />
              <input className="w-full border p-2 rounded bg-white" placeholder="Rua / Logradouro" value={address} onChange={e => setAddress(e.target.value)} />
              <input className="w-full border p-2 rounded bg-white" placeholder="Número" />
              <input className="w-full border p-2 rounded bg-white" placeholder="Ponto de referência" />
            </div>
          )}

          <select className="w-full border p-2 rounded bg-white" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Review notice */}
        <div className="mt-4 bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-yellow-100 text-xs">
            {settings.checkoutReviewMessage || 'Seu pedido será revisado pela loja. Você poderá receber um desconto especial na confirmação!'}
          </p>
        </div>

        <div className="mt-4 bg-[#f6f6f6] text-gray-800 p-4 rounded-lg flex justify-between items-center">
          <span>Total Estimado</span>
          <span className="font-bold text-xl">{formatCurrency(total)}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-3">
          <button onClick={handleSendOrder} className="w-full bg-[#4caf50] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#43a047] transition-colors shadow-md">
            <span className="bg-white/20 p-1 rounded-full"><Phone size={16} /></span> ENVIAR PEDIDO
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Admin Panel (Full Features) ---
