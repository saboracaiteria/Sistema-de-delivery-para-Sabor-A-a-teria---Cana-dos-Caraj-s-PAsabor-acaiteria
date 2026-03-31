import React, { useState, useMemo } from 'react';
import { Minus, Plus, Search, ArrowLeft } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Product, ProductGroup } from '../../types/types';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { groups, addToCart, settings } = useApp();
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
    let total = Number(product.price || 0);
    productGroups.forEach(group => {
      group.options.forEach(opt => {
        const qty = selectedOptions[opt.id] || 0;
        if (qty > 0 && opt.price) {
          total += Number(opt.price) * qty;
        }
      });
    });
    return total * quantity;
  };

  const handleOptionChange = (groupId: string, optionId: string, delta: number, max: number) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    // Se o grupo for de seleção única (max === 1), e o delta for de adição (+1),
    // devemos desselecionar qualquer outra opção do mesmo grupo.
    if (group.max === 1 && delta > 0) {
      setSelectedOptions(prev => {
        const newOptions = { ...prev };
        // Zera todas as opções deste grupo
        group.options.forEach(opt => {
          newOptions[opt.id] = 0;
        });
        // Seta a atual para 1
        newOptions[optionId] = 1;
        return newOptions;
      });
      return;
    }

    const currentQty = selectedOptions[optionId] || 0;
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
                        <div
                          key={opt.id}
                          onClick={() => {
                            if (group.max === 1) {
                              handleOptionChange(group.id, opt.id, 1, group.max);
                            } else if (qty < group.max) {
                              handleOptionChange(group.id, opt.id, 1, group.max);
                            }
                          }}
                          className={`bg-white p-4 rounded-lg shadow-sm border ${qty > 0 ? 'border-purple-500 ring-1 ring-purple-500' : 'border-gray-200'} transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.01] hover:bg-gray-50 cursor-pointer`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <h4 className="font-bold text-gray-800">{opt.name}</h4>
                              {opt.description && (
                                <p className="text-sm text-gray-500 mt-1 leading-tight">{opt.description}</p>
                              )}
                              {(() => {
                                const isMainChoice = group.min === 1 && group.max === 1;
                                const optPrice = Number(opt.price || 0);
                                const basePrice = Number(product.price || 0);
                                const displayValue = isMainChoice ? (basePrice + optPrice) : optPrice;
                                
                                return (
                                  <div className="mt-2 inline-block px-3 py-1 rounded-full border border-gray-300 text-sm font-medium text-gray-700 shadow-sm bg-gray-50/50">
                                    {displayValue === 0 ? (
                                      <span className="text-emerald-600 font-bold tracking-tight">Grátis</span>
                                    ) : (
                                      <>{!isMainChoice && optPrice > 0 ? '+ ' : ''}R$ {displayValue.toFixed(2).replace('.', ',')}</>
                                    )}
                                  </div>
                                );
                              })()}
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
                placeholder={settings.notePlaceholder || "Digite suas observações..."}
                className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Footer with Quantity and Confirm */}
        <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-90 transition-all border border-gray-200"
            >
              <Minus size={24} />
            </button>
            <div className="flex flex-col items-center">
              <input 
                type="number" 
                value={quantity} 
                min="1"
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-2xl font-black text-gray-800 tabular-nums text-center bg-transparent border-b-2 border-gray-100 focus:border-purple-500 outline-none transition-colors"
                onFocus={(e) => e.target.select()}
              />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Qtde</span>
            </div>
            <button
              onClick={() => setQuantity(prev => prev + 1)}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-90 transition-all border border-gray-200"
            >
              <Plus size={24} />
            </button>
          </div>

          <button
            disabled={!isValid}
            onClick={handleConfirm}
            className="w-full h-14 bg-[#D32F2F] disabled:bg-gray-400 text-white font-black rounded-xl text-lg hover:bg-[#B71C1C] transition-all uppercase tracking-wider flex items-center justify-between px-6 shadow-lg shadow-red-900/20 active:scale-95"
          >
            <span>CONTINUAR</span>
            <span className="text-xl">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
