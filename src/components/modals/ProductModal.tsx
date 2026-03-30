import React, { useState, useMemo } from 'react';
import { Minus, Plus, Search, ArrowLeft } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Product, ProductGroup } from '../../types/types';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { groups, addToCart } = useApp();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const productGroups = useMemo(() => {
    if (!product.groupIds) return [];
    return product.groupIds
      .map(gid => groups.find(g => g.id === gid))
      .filter(Boolean)
      .filter(g => g!.active !== false)
      .map(g => ({
        ...g!,
        options: g!.options.filter(o => o.active !== false)
      })) as ProductGroup[];
  }, [product, groups]);

  const calculateTotal = () => {
    let total = product.price;
    productGroups.forEach(group => {
      group.options.forEach(opt => {
        const qty = selectedOptions[opt.id] || 0;
        if (qty > 0 && opt.price) {
          total += opt.price * qty;
        }
      });
    });
    return total * quantity;
  };

  const handleOptionChange = (groupId: string, optionId: string, delta: number, max: number) => {
    const currentQty = selectedOptions[optionId] || 0;
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const currentGroupTotal = group.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);

    // Check max limit only when adding
    if (delta > 0 && currentGroupTotal >= group.max) return;

    const newQty = Math.max(0, currentQty + delta);
    setSelectedOptions(prev => ({ ...prev, [optionId]: newQty }));
  };

  const isValid = productGroups.every(g => {
    const total = g.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);
    return total >= g.min;
  });

  const handleConfirm = () => {
    if (!isValid) return;
    addToCart({
      cartId: Date.now().toString(),
      product,
      quantity,
      selectedOptions,
      note,
      totalPrice: calculateTotal() / quantity
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between text-white shrink-0 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--color-header-bg, #4E0797)',
            color: 'var(--color-header-text, #ffffff)'
          }}
        >
          <button onClick={onClose}><ArrowLeft size={24} style={{ color: 'var(--color-header-text, #ffffff)' }} /></button>
          <h2 className="text-lg font-bold uppercase">{product.name}</h2>
          <div className="w-6" />
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 space-y-6">
            {productGroups.map(group => {
              const currentTotal = group.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);
              const filteredOptions = group.options.filter(opt =>
                opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
              );

              return (
                <div key={group.id}>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{group.title}</h3>
                    <div className="flex justify-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Minimo: {group.min}</span>
                      <span>Máximo: {group.max}</span>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Digite para pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    {filteredOptions.map(opt => {
                      const qty = selectedOptions[opt.id] || 0;
                      return (
                        <div key={opt.id} className={`bg-white p-4 rounded-lg shadow-sm border ${qty > 0 ? 'border-purple-500 ring-1 ring-purple-500' : 'border-gray-200'} transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.01] hover:bg-gray-50 cursor-pointer`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <h4 className="font-bold text-gray-800">{opt.name}</h4>
                              {opt.description && (
                                <p className="text-sm text-gray-500 mt-1 leading-tight">{opt.description}</p>
                              )}
                              <div className="mt-2 inline-block px-3 py-1 rounded-full border border-gray-300 text-sm font-medium text-gray-700">
                                + R$ {opt.price ? opt.price.toFixed(2).replace('.', ',') : '0,00'}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOptionChange(group.id, opt.id, -1, group.max); }}
                                className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-200 ${qty > 0 ? 'text-red-500 hover:bg-red-50 active:scale-90' : 'text-gray-300'}`}
                                disabled={qty === 0}
                              >
                                <Minus size={20} />
                              </button>
                              <span className="font-bold text-lg w-6 text-center">{qty}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOptionChange(group.id, opt.id, 1, group.max); }}
                                className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-200 ${currentTotal < group.max ? 'text-green-600 hover:bg-green-50 active:scale-90' : 'text-gray-300'}`}
                                disabled={currentTotal >= group.max}
                              >
                                <Plus size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="space-y-2 pt-4 border-t border-gray-200">
              <h3 className="font-bold text-gray-800">Observações</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Sem cebola, caprichar no molho..."
                className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
          <button
            disabled={!isValid}
            onClick={handleConfirm}
            className="w-full h-14 bg-[#D32F2F] disabled:bg-gray-400 text-white font-black rounded-xl text-lg hover:bg-[#B71C1C] transition-all uppercase tracking-wider flex items-center justify-between px-6 shadow-lg shadow-red-900/20 active:scale-95"
          >
            <span>CONTINUAR</span>
            <span className="text-xl">R$ {(calculateTotal() / quantity).toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
