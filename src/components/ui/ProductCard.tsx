import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Product } from '../../types/types';
import { ProductModal } from '../modals/ProductModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isStoreOpen } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showClosedToast, setShowClosedToast] = useState(false);

  const hasOptions = product.groupIds && product.groupIds.length > 0;

  const handleAdd = () => {
    if (!isStoreOpen) {
      setShowClosedToast(true);
      setTimeout(() => setShowClosedToast(false), 2000);
      return;
    }

    if (hasOptions) {
      setIsModalOpen(true);
    } else {
      addToCart({
        cartId: Date.now().toString(),
        product,
        quantity: 1,
        selectedOptions: {},
        totalPrice: product.price
      });
    }
  };

  return (
    <>
      <div
        className={`product-card flex-shrink-0 w-[172px] bg-white rounded-2xl shadow-card overflow-hidden cursor-pointer mr-3 mb-2 border border-gray-100/80 ${
          !isStoreOpen ? 'opacity-60 grayscale' : ''
        }`}
        onClick={handleAdd}
        role="button"
        aria-label={`Adicionar ${product.name} ao carrinho`}
      >
        <div className="img-zoom h-[138px] w-full relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5 bg-gradient-to-t from-black/60 to-transparent">
            <span className="text-white font-heading font-bold text-sm drop-shadow">
              R$ {product.price.toFixed(2)}
            </span>
          </div>
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--color-button-primary)' }}>
            <Plus size={14} className="text-white" />
          </div>
        </div>

        <div className="p-2.5">
          <h3 className="font-semibold text-gray-800 text-[12.5px] leading-snug line-clamp-2 mb-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          {hasOptions && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-[9px] text-purple-500 font-medium bg-purple-50 px-1.5 py-0.5 rounded-full">
                Personalizar
              </span>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && <ProductModal product={product} onClose={() => setIsModalOpen(false)} />}

      {showClosedToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[200] bg-gray-900/90 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-scale-in backdrop-blur-sm">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="font-bold text-sm">Loja Fechada</p>
            <p className="text-xs text-white/70">Pedidos não disponíveis agora</p>
          </div>
        </div>
      )}
    </>
  );
};
