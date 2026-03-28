import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, CheckCircle, Printer, Trash2, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { usePrinter } from '../../PrinterContext';
import { OrderRecord, DeliveryMethod } from '../../types/types';
import { ConfirmModal } from '../../components/modals/ConfirmModal';

export const OrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, groups, deleteOrder, adminRole, copyOrderToClipboard } = useApp();
  const navigate = useNavigate();
  const { printText } = usePrinter();
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handlePrintOrder = async (order: OrderRecord) => {
    const itemsText = order.fullDetails.map(item => {
      let txt = `[L]${item.quantity}x ${item.product.name} R$${item.totalPrice.toFixed(2)}`;
      const selectedOptionsText: string[] = [];
      Object.entries(item.selectedOptions).forEach(([optionId, qty]) => {
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
        txt += `\n[L]   (${selectedOptionsText.join(', ')})`;
      }
      if (item.note) txt += `\n[L]   Obs: ${item.note}`;
      return txt;
    }).join('\n');

    const receipt =
      "[C]<b>OBBA ACAI DELIVERY</b>\n" +
      "[L]\n" +
      `[L]Pedido: #${order.id}\n` +
      `[L]Data: ${new Date(order.date).toLocaleString()}\n` +
      "[L]--------------------------------\n" +
      `[L]Cliente: ${order.customerName}\n` +
      `[L]Tel: ${order.whatsapp}\n` +
      `[L]End: ${order.address || 'Retirada'}\n` +
      "[L]--------------------------------\n" +
      "[L]<b>ITENS</b>\n" +
      itemsText + "\n" +
      "[L]--------------------------------\n" +
      `[L]Pagamento: ${order.paymentMethod}\n` +
      `[L]Entrega: ${order.method === DeliveryMethod.DELIVERY ? 'Entrega' : 'Retirada'}\n` +
      `[R]<b>TOTAL: ${formatCurrency(order.total)}</b>\n` +
      "[L]\n[L]\n[L]\n";

    await printText(receipt);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-lg"><ChevronLeft /></button>
        <h1 className="text-xl font-bold">Pedidos</h1>
      </div>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-600">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold text-lg">#{order.id}</span>
                <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{order.status}</span>
            </div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-gray-600 mt-1">{order.itemsSummary}</p>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <span className="font-bold">{formatCurrency(order.total)}</span>
              <div className="flex gap-2">
                <button onClick={() => setSelectedOrder(order)} className="p-2 bg-blue-50 text-blue-600 rounded text-xs font-bold">Ver Detalhes</button>
                <button onClick={() => copyOrderToClipboard(order)} className="p-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-200" title="Copiar Pedido"><FileText size={18} /></button>
                <button onClick={() => updateOrderStatus(order.id, 'completed')} className="p-2 bg-green-50 text-green-600 rounded"><CheckCircle size={18} /></button>
                <button onClick={() => handlePrintOrder(order)} className="p-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-200"><Printer size={18} /></button>
                {adminRole === 'admin' && (
                  <button onClick={() => setDeleteConfirmation({ id: order.id })} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Excluir Pedido">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Detalhes do Pedido #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)}><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Cliente:</strong> {selectedOrder.customerName}</p>
                <p><strong>WhatsApp:</strong> {selectedOrder.whatsapp}</p>
                <p><strong>Endereço:</strong> {selectedOrder.address || 'Retirada'}</p>
                <p><strong>Pagamento:</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>Data:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Itens</h4>
                <div className="space-y-2">
                  {selectedOrder.fullDetails.map((item, idx) => {
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
                      <div key={idx} className="border-b pb-2">
                        <div className="flex justify-between">
                          <span>{item.quantity}x {item.product.name}</span>
                          <span>{formatCurrency(item.totalPrice)}</span>
                        </div>
                        {selectedOptionsText.length > 0 && (
                          <div className="ml-4 mt-1">
                            {selectedOptionsText.map((opt, optIdx) => (
                              <p key={optIdx} className="text-xs text-gray-600">{opt}</p>
                            ))}
                          </div>
                        )}
                        {item.note && <p className="text-xs text-blue-600 ml-4 mt-1 italic">Obs: {item.note}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={() => handlePrintOrder(selectedOrder)} className="flex-1 bg-gray-200 py-3 rounded font-bold flex items-center justify-center gap-2">
                <Printer size={20} /> Imprimir
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 bg-purple-600 text-white py-3 rounded font-bold">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirmation}
        title="Excluir Pedido"
        message="Tem certeza que deseja excluir este pedido permanentemente? Esta ação não pode ser desfeita."
        onConfirm={() => {
          if (deleteConfirmation) {
            deleteOrder(deleteConfirmation.id);
            setDeleteConfirmation(null);
          }
        }}
        onCancel={() => setDeleteConfirmation(null)}
        isDestructive
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};
