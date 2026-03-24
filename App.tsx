

import React, { useState, createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Menu, X, ChevronRight, Minus, Plus, Trash2,
  MapPin, Phone, CreditCard, Banknote, Clock, Search,
  ChevronLeft, ChevronDown, ChevronUp, Edit, FileText,
  Settings, BarChart2, List, Folder, LogOut, CheckCircle,
  Printer, Tag, ToggleLeft, ToggleRight, Upload, Info, ArrowLeft, AlertCircle, Camera, Loader2,
  Link as LinkIcon, Lock as LockIcon, Palette, Package, MessageSquare, LayoutTemplate, Share2, Check, Store as StoreIcon
} from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { usePrinter } from './PrinterContext';
import { usePersistedState } from './usePersistedState';
import { formatCurrency, calculateStoreStatus, fileToBase64 } from './storeUtils';
import { Footer } from './Footer';
import {
  CATEGORIES, PRODUCTS, GROUPS, WHATSAPP_NUMBER, LOGO_URL,
  PAYMENT_METHODS, INITIAL_COUPONS, MOCK_ORDERS, SUPER_ADMIN_EMAILS, SUPER_ADMIN_PASSWORD
} from './constants';
import {
  Category, Product, ProductGroup, CartItem, ProductOption,
  GlobalSettings, Role, Coupon, OrderRecord, OrderStatus, DeliveryMethod, OpeningHour
} from './types';
import type { Store as StoreType } from './types';
import { CategoriesPage } from './CategoriesPage';
import { ProductsPage } from './ProductsPage';
import { ReportsPage } from './ReportsPage';
import { PrinterProvider } from './PrinterContext';
import { PrinterSettingsPage } from './PrinterSettingsPage';
import { ImageCropModal } from './ImageCropModal';
import { InventoryPage } from './InventoryPage';
import { SetupPage } from './SetupPage';
import { ConfirmModal } from './ConfirmModal';
import { Hero } from './Hero';
import { supabase, isConfigured } from './supabaseClient';
import {
  mockCategories,
  mockGroups,
  mockProducts,
  mockSettings,
  mockCoupons
} from './mockData';
import { ModernHomePage } from './ModernUI';
import { LoginPage } from './LoginPage';
import { PlatformHome } from './PlatformHome';
import { PlatformAdminPanel } from './PlatformAdminPanel';

// @ts-ignore - Virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

// Auto-update Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Nova versão detectada! Recarregando...');
    updateSW(true); // Forces the new SW to take over and reloads the page
  },
  onOfflineReady() {
    console.log('App pronto para uso offline.');
  },
});




// --- Custom Hooks (Modularized to usePersistedState.ts) ---

// --- UI Components (Modularized to Footer.tsx) ---

import { AppProvider, useApp } from './contexts/AppContext';
export { useApp, AppProvider };



// --- Components ---

import { Sidebar } from './components/Sidebar';
const Header = () => {
  const { setSidebarOpen } = useApp();
  return (
    <div
      className="h-16 flex items-center justify-between px-4 shadow-md sticky top-0 z-40 transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-header-bg, #4E0797)' }}
    >
      <div className="max-w-sm mx-auto w-full flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
          <Menu size={28} style={{ color: 'var(--color-header-text, #ffffff)' }} />
        </button>
        <button className="text-white p-1">
          <Search size={28} style={{ color: 'var(--color-header-text, #ffffff)' }} />
        </button>
      </div>
    </div>
  );
};

// Modified ProductCard to match horizontal scrolling layout
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
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
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -8,
          scale: 1.03,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
        }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex-shrink-0 w-[140px] bg-white rounded-xl shadow-sm border border-gray-100 mr-3 mb-3 overflow-hidden cursor-pointer`}
        onClick={handleAdd}
      >
        <div className="h-[110px] w-full overflow-hidden relative group">
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
            <span className="text-white text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/30">
              Adicionar
            </span>
          </div>
        </div>
        <div className="p-2 flex flex-col h-[95px]">
          <h3 className="font-bold text-gray-800 text-[11px] leading-tight mb-1 line-clamp-2 h-7">{product.name}</h3>
          <p className="text-[9px] text-gray-500 line-clamp-2 mb-auto leading-relaxed">{product.description}</p>
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-50">
            <span className="font-extrabold text-gray-900 text-xs">R$ {product.price.toFixed(2)}</span>
            <div className={`p-1 rounded-full ${hasOptions ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-500'}`}>
              {hasOptions ? <Settings size={12} /> : <Plus size={12} />}
            </div>
          </div>
        </div>
      </motion.div>
      {isModalOpen && <ProductModal product={product} onClose={() => setIsModalOpen(false)} />}

      {/* Closed Store Toast */}
      {
        showClosedToast && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[200] bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
            <AlertCircle size={20} />
            <span className="font-bold">Loja Fechada!</span>
          </div>
        )
      }
    </>
  );
};

// Product Carousel with scroll arrows
const ProductCarousel: React.FC<{ products: Product[] }> = ({ products }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScroll);
    return () => el?.removeEventListener('scroll', checkScroll);
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full p-1.5 transition-all duration-200 opacity-70 hover:opacity-100"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
      )}

      {/* Product Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        onScroll={checkScroll}
      >
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && products.length > 2 && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full p-1.5 transition-all duration-200 opacity-70 hover:opacity-100"
          aria-label="Rolar para direita"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      )}
    </div>
  );
};

export const ProductModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const { groups, addToCart, settings } = useApp();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

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
    let baseTotal = product.price;
    let optionsTotal = 0;
    let sizeQuantity = 0;

    productGroups.forEach(group => {
      const isSizeGroup = group.title.toLowerCase().includes('tamanho');

      group.options.forEach(opt => {
        const qty = selectedOptions[opt.id] || 0;
        if (qty > 0) {
          if (isSizeGroup) {
            sizeQuantity += qty;
          }
          if (opt.price) {
            optionsTotal += opt.price * qty;
          }
        }
      });
    });

    // If size options were chosen, the base product price applies to each size chosen.
    // Otherwise, it applies just once.
    const effectiveBaseTotal = (sizeQuantity > 0 ? sizeQuantity : 1) * baseTotal;

    return (effectiveBaseTotal + optionsTotal) * quantity;
  };

  const handleOptionChange = (groupId: string, optionId: string, delta: number, max: number) => {
    const currentQty = selectedOptions[optionId] || 0;
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const isSizeGroup = group.title.toLowerCase().includes('tamanho');
    const currentGroupTotal = group.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);

    // Check max limit only when adding, but ignore max for Size groups to allow multiple choices
    if (delta > 0 && currentGroupTotal >= group.max && !isSizeGroup) return;

    const newQty = Math.max(0, currentQty + delta);
    setSelectedOptions(prev => ({ ...prev, [optionId]: newQty }));
  };

  const isValid = productGroups.every(g => {
    const total = g.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);
    return total >= g.min;
  });

  const handleConfirm = () => {
    if (!isValid) return;

    // Find the Size group if it exists
    const sizeGroup = productGroups.find(g => g.title.toLowerCase().includes('tamanho'));

    if (sizeGroup) {
      // Get all selected size options
      const selectedSizeOptions = sizeGroup.options.filter(opt => (selectedOptions[opt.id] || 0) > 0);

      if (selectedSizeOptions.length > 0) {
        // If the user selected multiple sizes, create a separate cart item for EACH size combination
        // Note: this will multiply the standard options across all chosen sizes
        selectedSizeOptions.forEach((sizeOpt) => {
          const sizeQty = selectedOptions[sizeOpt.id];

          // Re-calculate price for this specific size
          let specificItemPrice = product.price;
          if (sizeOpt.price) specificItemPrice += sizeOpt.price;

          // Add prices of other selected non-size options
          productGroups.forEach(g => {
            if (g.id !== sizeGroup.id) {
              g.options.forEach(opt => {
                const optQty = selectedOptions[opt.id] || 0;
                if (optQty > 0 && opt.price) {
                  specificItemPrice += opt.price * optQty; // In a true split, you might spread these differently, but here we add them to the unit price
                }
              });
            }
          });

          // Create a specific selection object for this split item
          const specificSelectedOptions = { ...selectedOptions };
          // Remove all sizes from this specific selection
          sizeGroup.options.forEach(opt => {
            specificSelectedOptions[opt.id] = 0;
          });
          // Add back only THIS size with quantity 1 (so we don't multiply size qty incorrectly in cart UI if it expects 1 size per item)
          // Actually, cart UI handles multiple quantities of the option. Let's send the correct qty.
          specificSelectedOptions[sizeOpt.id] = 1;

          // Multiply the base quantity chosen in the footer by the quantity chosen for this specific size
          const totalQtyForThisSize = quantity * sizeQty;

          addToCart({
            cartId: Date.now().toString() + '-' + Math.random().toString(36).substring(7),
            product,
            quantity: totalQtyForThisSize,
            selectedOptions: specificSelectedOptions,
            note,
            totalPrice: specificItemPrice
          });
        });

        onClose();
        return;
      }
    }

    // Default behavior if no size group or no size selected
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden animate-slide-up shadow-2xl">
        {/* Header */}
        <div
          className="p-5 flex items-center justify-between text-white shrink-0 transition-colors duration-300 relative"
          style={{
            backgroundColor: 'var(--color-header-bg, #4E0797)',
            color: 'var(--color-header-text, #ffffff)'
          }}
        >
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={24} style={{ color: 'var(--color-header-text, #ffffff)' }} /></button>
          <h2 className="text-xl font-black uppercase tracking-wide flex-1 text-center px-4">{product.name}</h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-8">
          {/* Product Info with Image & Zoom */}
          <div className="bg-white p-5 mb-2 shadow-sm">
            <div className="relative group cursor-zoom-in overflow-hidden rounded-2xl aspect-square md:max-h-96 mx-auto mb-4 border border-gray-100 bg-gray-50 flex items-center justify-center">
              <motion.img 
                src={product.image} 
                className="w-full h-full object-contain transition-transform duration-200 ease-out"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={() => setIsFullscreen(true)}
                style={{
                  transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                }}
              />
              
              {/* Zoom hint for PC */}
              <div className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                <Search size={16} />
              </div>
              
              {/* Fullscreen hint for Mobile */}
              <div className="absolute bottom-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-lg text-white md:hidden animate-pulse">
                <Info size={14} className="inline mr-1" /> Toque para ampliar
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>
            <div className="flex items-center justify-between bg-purple-50 p-4 rounded-xl border border-purple-100">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Preço Unitário</span>
              <span className="text-2xl font-black text-purple-700">R$ {product.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Groups */}
          <div className="p-5 space-y-8">
            {productGroups.map(group => {
              const currentTotal = group.options.reduce((sum, opt) => sum + (selectedOptions[opt.id] || 0), 0);
              const filteredOptions = group.options.filter(opt =>
                opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
              );

              return (
                <div key={group.id} className="animate-fade-in">
                  <div className="text-center mb-5">
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight">{group.title}</h3>
                    <div className="flex justify-center gap-2 mt-2">
                      <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">Mín: {group.min}</span>
                      <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">Máx: {group.max}</span>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-5 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-100 rounded-xl border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none font-medium placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-3">
                    {filteredOptions.map(opt => {
                      const qty = selectedOptions[opt.id] || 0;
                      return (
                        <div key={opt.id} className={`bg-white p-4 rounded-2xl shadow-sm border-2 ${qty > 0 ? 'border-purple-500 bg-purple-50/30' : 'border-gray-100'} transition-all duration-300 ease-out hover:shadow-md cursor-pointer relative overflow-hidden`}>
                          <div className="flex justify-between items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-bold text-base ${qty > 0 ? 'text-purple-900' : 'text-gray-800'}`}>{opt.name}</h4>
                              {opt.description && (
                                <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{opt.description}</p>
                              )}
                              <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${opt.price || (group.title.toLowerCase().includes('tamanho') && product.price > 0) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {opt.price
                                  ? (group.title.toLowerCase().includes('tamanho')
                                    ? `R$ ${(product.price + opt.price).toFixed(2).replace('.', ',')}`
                                    : `+ R$ ${opt.price.toFixed(2).replace('.', ',')}`)
                                  : (group.title.toLowerCase().includes('tamanho') && product.price > 0)
                                    ? `R$ ${product.price.toFixed(2).replace('.', ',')}`
                                    : 'Grátis'}
                              </div>
                            </div>


                            <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-xl border border-gray-100 shadow-sm shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOptionChange(group.id, opt.id, -1, group.max); }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${qty > 0 ? 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95' : 'bg-gray-50 text-gray-300'}`}
                                disabled={qty === 0}
                              >
                                <Minus size={18} strokeWidth={3} />
                              </button>
                              <span className="font-black text-base w-5 text-center text-gray-800">{qty}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOptionChange(group.id, opt.id, 1, group.max); }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${(currentTotal < group.max || group.title.toLowerCase().includes('tamanho')) ? 'bg-green-50 text-green-600 hover:bg-green-100 active:scale-95' : 'bg-gray-50 text-gray-300'}`}
                                disabled={currentTotal >= group.max && !group.title.toLowerCase().includes('tamanho')}
                              >
                                <Plus size={18} strokeWidth={3} />
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

            <div className="pt-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Edit size={18} className="text-gray-400" />
                {settings?.noteTitle || "Observações"}
              </h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={settings?.notePlaceholder || "Ex: Detalhes sobre a entrega, cor, tamanho, etc..."}
                className="w-full p-4 bg-gray-100 rounded-xl border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none text-sm font-medium resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10 shrink-0 flex items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-inner">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200 ${quantity > 1 ? 'bg-white text-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:bg-gray-50 active:scale-95' : 'text-gray-400'}`}
              disabled={quantity <= 1}
            >
              <Minus size={20} strokeWidth={3} />
            </button>
            <span className="font-black text-lg w-8 text-center text-gray-800">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200 bg-white text-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:bg-gray-50 active:scale-95"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>

          <button
            disabled={!isValid}
            onClick={handleConfirm}
            className="flex-1 h-14 bg-[#D32F2F] disabled:bg-gray-300 disabled:text-gray-500 text-white font-black rounded-xl text-sm sm:text-lg hover:bg-[#B71C1C] transition-all active:scale-[0.98] uppercase tracking-wide shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isValid ? (
              <span className="flex items-center justify-between w-full px-4">
                <span>ADICIONAR</span>
                <span>R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
              </span>
            ) : (
              'OBRIGATÓRIOS'
            )}
          </button>
        </div>
      </div>

      {/* Fullscreen Image Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
          >
            <motion.button
              className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white z-[210]"
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFullscreen(false)}
            >
              <X size={32} />
            </motion.button>
            
            <motion.img
              src={product.image}
              className="max-w-full max-h-full object-contain shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            />
            
            <div className="absolute bottom-8 left-0 right-0 text-center text-white/60 text-sm font-medium pointer-events-none">
              Dica: Use gestos de pinça para aproximar no celular
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Pages ---

const HomePage = () => {
  const { categories, products, settings, isStoreOpen, searchTerm } = useApp();
  const status = isStoreOpen ? 'open' : 'closed';

  return (
    <div className="bg-[#f6f6f6] min-h-screen">
      {/* Cover Image with Overlapping Logo */}
      <div className="px-4 pt-1">

        {/* Status Message */}
        <div className="text-center mb-1">
          <p className="text-xs font-medium text-gray-500">
            {isStoreOpen
              ? settings.openMessage || "Aberto agora"
              : settings.closedMessage || "Fechado no momento"
            }
          </p>
        </div>

        {/* Hours Link */}
        <div className="flex justify-center items-center gap-1 text-gray-600 mb-2">
          <Info size={16} />
          <span className="font-bold text-sm">Horários</span>
        </div>

        {/* Warning Alert */}
        <div className="border border-red-200 bg-red-50 text-red-600 px-4 py-3 rounded-md mb-4 text-center text-sm font-medium">
          Entregas somente até as {settings.deliveryCloseTime || '21:00'}hrs!
        </div>

        {/* Categories */}
        <div className="space-y-2">
          {categories.filter(cat => cat.active !== false).map(cat => {
            const catProducts = products.filter(p => 
              p.categoryId === cat.id && 
              p.active !== false &&
              (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            return (
              <div key={cat.id} id={`cat-${cat.id}`}>
                <h2 className="text-lg font-bold text-gray-700 mb-3 pl-1 flex items-center gap-2">
                  {cat.title} {cat.icon}
                </h2>
                {/* Horizontal scrolling container */}
                {catProducts.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg py-8 px-4 text-center">
                    <p className="text-gray-400 text-sm italic">
                      Nenhum produto disponível no momento
                    </p>
                  </div>
                ) : (
                  <ProductCarousel products={catProducts} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FloatingCartButton = () => {
  const { store, cart } = useApp();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();

  // Animation state
  const [animate, setAnimate] = useState(false);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  if (cartCount === 0) return null;

  return (
    <button
      onClick={() => navigate(`/${store?.slug}/cart`)}
      className={`fixed bottom-6 right-6 w-16 h-16 bg-brand-red text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:opacity-90 transition-all ${animate ? 'scale-125' : 'scale-100'}`}
    >
      <ShoppingCart size={28} />
      <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-brand-red font-bold rounded-full flex items-center justify-center text-xs shadow-md border border-gray-100">
        {cartCount}
      </span>
    </button>
  );
};

import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
const AdminPanel = () => {
  const { adminRole, setAdminRole, store } = useApp();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleCopyStoreLink = () => {
    if (store) {
      const link = `${window.location.origin}/#/${store.slug}`;
      navigator.clipboard.writeText(link).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }).catch(err => {
        console.error('Falha ao copiar:', err);
        alert('Erro ao copiar link da loja.');
      });
    }
  };

  useEffect(() => {
    if (!adminRole) {
      const slug = store?.slug || localStorage.getItem('currentStoreSlug') || '';
      navigate(`/${slug}`);
    }
  }, [adminRole, navigate]);

  const menuItems = [
    { title: 'Pedidos', icon: <FileText size={32} />, path: `/${store?.slug}/panel/orders`, role: ['admin', 'employee'] },
    { title: 'Configurações', icon: <Settings size={32} />, path: `/${store?.slug}/panel/settings`, role: ['admin'] },
    { title: 'Relatório', icon: <BarChart2 size={32} />, path: `/${store?.slug}/panel/reports`, role: ['admin'] },
    { title: 'Categorias', icon: <List size={32} />, path: `/${store?.slug}/panel/categories`, role: ['admin'] },
    { title: 'Produtos', icon: <Folder size={32} />, path: `/${store?.slug}/panel/products`, role: ['admin'] },
    { title: 'Adicionais', icon: <ToggleLeft size={32} />, path: `/${store?.slug}/panel/addons`, role: ['admin'] },
    { title: 'Cupons', icon: <Tag size={32} />, path: `/${store?.slug}/panel/coupons`, role: ['admin'] },
    { title: 'Cores do Site', icon: <Palette size={32} />, path: `/${store?.slug}/panel/theme`, role: ['admin'] },
    { title: 'Estoque', icon: <Package size={32} />, path: `/${store?.slug}/panel/inventory`, role: ['admin'] },
    { title: 'Impressora', icon: <Printer size={32} />, path: `/${store?.slug}/panel/printer`, role: ['admin', 'employee'] },
  ];


  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-orange-600 tracking-tight">
          Painel do Lojista
        </div>
        <button onClick={() => { const slug = store?.slug || localStorage.getItem('currentStoreSlug') || ''; setAdminRole(null); navigate(`/${slug}`); }} className="text-red-600 flex items-center gap-2 font-bold p-2 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={20} /> Sair
        </button>
      </div>

      {/* Store Link Card */}
      {store && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 shadow-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white"
        >
          <div>
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <StoreIcon size={20} /> Seu Link de Divulgação
            </h2>
            <p className="text-purple-200 text-sm">Compartilhe este link com seus clientes para receber pedidos.</p>
          </div>
          <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-full w-full sm:w-auto">
            <input 
              type="text" 
              readOnly 
              value={`${window.location.origin}/#/${store.slug}`}
              className="bg-transparent text-white font-medium text-sm outline-none px-3 w-full sm:w-64"
            />
            <button
              onClick={handleCopyStoreLink}
              className={`p-2 rounded-full transition-colors flex shrink-0 ${copiedLink ? 'bg-green-500 text-white' : 'bg-white text-purple-700 hover:bg-purple-100'}`}
              title="Copiar Link"
            >
              {copiedLink ? <CheckCircle size={18} /> : <Share2 size={18} />}
            </button>
          </div>
        </motion.div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {menuItems.filter(item => adminRole === 'superadmin' || item.role.includes(adminRole || '')).map((item) => (
          <motion.div
            key={item.title}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{
              y: -5,
              scale: 1.05,
              boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(item.path)}
            className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[140px] border border-gray-50 relative overflow-hidden group"
          >
            <div className="text-purple-600 bg-purple-50 p-4 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              {React.cloneElement(item.icon, { size: 32 })}
            </div>
            <span className="font-bold text-gray-700 text-sm text-center">{item.title}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const { orders, updateOrderStatus, updateOrderDiscount, groups, store, deleteOrder, adminRole, copyOrderToClipboard } = useApp();
  const navigate = useNavigate();
  const { printText, connectedDevice } = usePrinter();

  const handlePrintOrder = async (order: OrderRecord) => {


    const itemsText = order.fullDetails.map(item => {
      let txt = `[L]${item.quantity}x ${item.product.name} R$${item.totalPrice.toFixed(2)}`;

      // Get option names from groups
      const selectedOptionsText: string[] = [];
      Object.entries(item.selectedOptions).forEach(([optionId, qty]) => {
        if ((qty as number) > 0) {
          // Find the option name
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
      (order.discountPercent ? `[R]Desconto (${order.discountPercent}%): - ${formatCurrency(order.total * (order.discountPercent / 100))}\n` : "") +
      `[R]<b>TOTAL FINAL: ${formatCurrency(order.total * (1 - (order.discountPercent || 0) / 100))}</b>\n` +
      "[L]\n[L]\n[L]\n";

    await printText(receipt);
  };

  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string } | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/${store?.slug}/panel`)}><ChevronLeft /></button>
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
              <div className="flex flex-col items-end gap-1">
                {order.isQuote && <span className="px-2 py-1 bg-blue-500 text-white rounded text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse">ORÇAMENTO</span>}
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{order.status}</span>
              </div>
            </div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-gray-600 mt-1">{order.itemsSummary}</p>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-col">
                {order.discountPercent ? (
                   <>
                     <span className="text-xs text-red-500 line-through">{formatCurrency(order.total)}</span>
                     <span className="font-bold text-green-600">{formatCurrency(order.total * (1 - order.discountPercent / 100))}</span>
                   </>
                ) : (
                   <span className="font-bold">{formatCurrency(order.total)}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedOrder(order)} className="p-2 bg-blue-50 text-blue-600 rounded text-xs font-bold">Ver Detalhes</button>
                <button onClick={() => copyOrderToClipboard(order)} className="p-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-200" title="Copiar Pedido"><FileText size={18} /></button>
                <button onClick={() => updateOrderStatus(order.id, 'completed')} className="p-2 bg-green-50 text-green-600 rounded"><CheckCircle size={18} /></button>
                <button onClick={() => handlePrintOrder(order)} className="p-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-200"><Printer size={18} /></button>
                {(adminRole === 'admin' || adminRole === 'superadmin') && (
                  <button
                    onClick={() => setDeleteConfirmation({ id: order.id })}
                    className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                    title="Excluir Pedido"
                  >
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

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-600">Desconto Especial (%)</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={selectedOrder.discountPercent || 0} 
                      onChange={(e) => updateOrderDiscount(selectedOrder.id, Number(e.target.value))}
                      className="w-20 border rounded p-1 text-center font-bold text-green-600"
                    />
                    <span className="font-bold text-green-600">%</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal do Pedido</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
                
                {selectedOrder.discountPercent ? (
                  <div className="flex justify-between text-green-600 font-bold italic">
                    <span>Desconto Aplicado (-{selectedOrder.discountPercent}%)</span>
                    <span>- {formatCurrency(selectedOrder.total * (selectedOrder.discountPercent / 100))}</span>
                  </div>
                ) : null}

                <div className="flex justify-between items-center pt-2 border-t font-black text-xl text-purple-700">
                  <span>TOTAL FINAL</span>
                  <span>{formatCurrency(selectedOrder.total * (1 - (selectedOrder.discountPercent || 0) / 100))}</span>
                </div>
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

const CouponsPage = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, store } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; code: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!editingCoupon.code || !editingCoupon.value) return;

    try {
      if (editingCoupon.id) {
        await updateCoupon(editingCoupon as Coupon);
      } else {
        // Remover ID para deixar o banco gerar (se for UUID) ou passar um ID temporário se a lógica local exigir
        // Como o addCoupon no AppProvider usa o objeto passado, e o banco gera UUID, 
        // passar um ID numérico (Date.now) pode causar erro de sintaxe UUID se o campo for UUID.
        // Vamos remover o ID do objeto passado para criação.
        const { id, ...newCoupon } = editingCoupon;
        await addCoupon({ ...newCoupon, active: true, usageCount: 0 } as Coupon);
      }
      setIsModalOpen(false);
      // No reload needed, state is updated in addCoupon/updateCoupon
      // and confirmed by realtime subscription if configured.
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      alert('Erro ao salvar cupom. Verifique se o código já existe.');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation) {
      await deleteCoupon(deleteConfirmation.id);
      setDeleteConfirmation(null);
    }
  };

  const handleCopyLink = (code: string, id: string) => {
    const link = `${window.location.origin}/#/${store?.slug}?cupom=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('Falha ao copiar:', err);
      alert('Erro ao copiar link.');
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/${store?.slug}/panel`)}><ChevronLeft /></button>
          <h1 className="text-xl font-bold">Cupons</h1>
        </div>
        <button onClick={() => { setEditingCoupon({ type: 'percent' }); setIsModalOpen(true); }} className="bg-purple-600 text-white p-2 rounded-full"><Plus /></button>
      </div>

      <div className="space-y-3">
        {coupons.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-lg flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-lg">{c.code}</p>
              <p className="text-sm text-gray-500">{c.type === 'percent' ? `${c.value}% OFF` : `R$ ${c.value} OFF`}</p>
              {c.minOrderValue && <p className="text-xs text-gray-400">Pedido mín: R$ {c.minOrderValue.toFixed(2)}</p>}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => handleCopyLink(c.code, c.id)}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${copiedId === c.id ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                title="Copiar Link de Compartilhamento"
              >
                {copiedId === c.id ? <Check size={18} /> : <Share2 size={18} />}
              </button>
              <button onClick={() => updateCoupon({ ...c, active: !c.active })} className={`transition-colors ${c.active ? 'text-green-500' : 'text-gray-300'}`}>
                <ToggleLeft size={28} className={`transition-transform ${c.active ? 'rotate-180' : ''}`} />
              </button>
              <button onClick={() => { setEditingCoupon(c); setIsModalOpen(true); }} className="text-gray-400 p-1.5"><Edit size={18} /></button>
              <button onClick={() => setDeleteConfirmation({ id: c.id, code: c.code })} className="text-red-400 p-1.5"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg">{editingCoupon.id ? 'Editar' : 'Novo'} Cupom</h3>
            <input
              className="w-full border p-2 rounded uppercase" placeholder="CÓDIGO"
              value={editingCoupon.code || ''} onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
            />
            <div className="flex gap-2">
              <button onClick={() => setEditingCoupon({ ...editingCoupon, type: 'percent' })} className={`flex-1 py-2 border rounded ${editingCoupon.type === 'percent' ? 'bg-purple-50 border-purple-500' : ''}`}>%</button>
              <button onClick={() => setEditingCoupon({ ...editingCoupon, type: 'fixed' })} className={`flex-1 py-2 border rounded ${editingCoupon.type === 'fixed' ? 'bg-purple-50 border-purple-500' : ''}`}>R$</button>
            </div>
            <input
              type="number" className="w-full border p-2 rounded" placeholder="Valor"
              value={editingCoupon.value || ''} onChange={e => setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) })}
            />
            <input
              type="number"
              className="w-full border p-2 rounded"
              placeholder="Valor Mínimo do Pedido (opcional)"
              value={editingCoupon.minOrderValue || ''}
              onChange={e => setEditingCoupon({ ...editingCoupon, minOrderValue: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
            <button onClick={handleSave} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold">Salvar</button>
            <button onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 py-2">Cancelar</button>
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

const AddonsPage = () => {
  const { groups, addGroup, updateGroup, deleteGroup, store } = useApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<{ groupId: string; option: ProductOption | null } | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditData, setInlineEditData] = useState<Partial<ProductGroup>>({});

  // Confirmation States
  const [deleteGroupConfirmation, setDeleteGroupConfirmation] = useState<{ id: string, title: string } | null>(null);
  const [deleteOptionConfirmation, setDeleteOptionConfirmation] = useState<{ groupId: string, option: ProductOption } | null>(null);
  const [activeGroupConfirmation, setActiveGroupConfirmation] = useState<{ group: ProductGroup, newActive: boolean } | null>(null);
  const [activeOptionConfirmation, setActiveOptionConfirmation] = useState<{ groupId: string, option: ProductOption, newActive: boolean } | null>(null);

  const handleAddGroup = () => {
    setEditingGroup({
      id: Date.now().toString(),
      title: '',
      min: 1,
      max: 1,
      options: []
    });
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: ProductGroup) => {
    setEditingGroup({ ...group });
    setIsModalOpen(true);
  };

  const handleSaveGroup = () => {
    if (!editingGroup || !editingGroup.title) return;

    const existingGroup = groups.find(g => g.id === editingGroup.id);
    if (existingGroup) {
      updateGroup(editingGroup);
    } else {
      addGroup(editingGroup);
    }
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleDeleteGroupClick = (group: ProductGroup) => {
    setDeleteGroupConfirmation({ id: group.id, title: group.title });
  };

  const performDeleteGroup = (id: string) => {
    deleteGroup(id);
    setDeleteGroupConfirmation(null);
  };

  const handleAddOption = (groupId: string) => {
    setEditingOption({
      groupId,
      option: {
        id: Date.now().toString(),
        name: '',
        price: 0,
        description: ''
      }
    });
  };

  const handleEditOption = (groupId: string, option: ProductOption) => {
    setEditingOption({
      groupId,
      option: { ...option }
    });
  };

  const handleSaveOption = () => {
    if (!editingOption || !editingOption.option || !editingOption.option.name) return;

    const group = groups.find(g => g.id === editingOption.groupId);
    if (!group) return;

    const existingOptionIndex = group.options.findIndex(o => o.id === editingOption.option!.id);
    let updatedOptions;

    if (existingOptionIndex >= 0) {
      updatedOptions = [...group.options];
      updatedOptions[existingOptionIndex] = editingOption.option;
    } else {
      updatedOptions = [...group.options, editingOption.option];
    }

    updateGroup({ ...group, options: updatedOptions });
    setEditingOption(null);
  };

  const handleDeleteOptionClick = (groupId: string, option: ProductOption) => {
    setDeleteOptionConfirmation({ groupId, option });
  };

  const performDeleteOption = (groupId: string, optionId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const updatedOptions = group.options.filter(o => o.id !== optionId);
    updateGroup({ ...group, options: updatedOptions });
    setDeleteOptionConfirmation(null);
  };

  const handleInlineEdit = (group: ProductGroup) => {
    setInlineEditId(group.id);
    setInlineEditData({ ...group });
  };

  const handleInlineSave = () => {
    if (!inlineEditData.title || !inlineEditData.min || !inlineEditData.max) {
      alert('Preencha todos os campos');
      return;
    }
    updateGroup(inlineEditData as ProductGroup);
    setInlineEditId(null);
    setInlineEditData({});
  };

  const handleInlineCancel = () => {
    setInlineEditId(null);
    setInlineEditData({});
  };

  const handleToggleGroupActiveClick = (group: ProductGroup) => {
    const isActive = group.active ?? true;
    if (isActive) {
      setActiveGroupConfirmation({ group, newActive: false });
    } else {
      performToggleGroupActive(group, true);
    }
  };

  const performToggleGroupActive = async (group: ProductGroup, newActive: boolean) => {
    updateGroup({ ...group, active: newActive });
    await supabase.from('product_groups').update({ active: newActive }).eq('id', group.id);
    setActiveGroupConfirmation(null);
  };

  const handleToggleOptionActiveClick = (groupId: string, option: ProductOption) => {
    const isActive = option.active ?? true;
    if (isActive) {
      setActiveOptionConfirmation({ groupId, option, newActive: false });
    } else {
      performToggleOptionActive(groupId, option, true);
    }
  };

  const performToggleOptionActive = async (groupId: string, option: ProductOption, newActive: boolean) => {
    await supabase.from('product_options').update({ active: newActive }).eq('id', option.id);
    // Refresh via updateGroup
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const updatedOptions = group.options.map(o => o.id === option.id ? { ...o, active: newActive } : o);
      updateGroup({ ...group, options: updatedOptions });
    }
    setActiveOptionConfirmation(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/${store?.slug}/panel`)}><ChevronLeft /></button>
          <h1 className="text-xl font-bold">Adicionais / Combos</h1>
        </div>
        <button
          onClick={handleAddGroup}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} /> Novo Grupo
        </button>
      </div>

      <div className="space-y-3">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {inlineEditId === group.id ? (
              <div className="p-4 border-b border-gray-100">
                <div className="space-y-3">
                  <input
                    className="w-full border p-2 rounded font-bold text-lg"
                    placeholder="Título do Grupo"
                    value={inlineEditData.title || ''}
                    onChange={e => setInlineEditData({ ...inlineEditData, title: e.target.value })}
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      className="w-full border p-2 rounded"
                      placeholder="Min"
                      value={inlineEditData.min || ''}
                      onChange={e => setInlineEditData({ ...inlineEditData, min: parseInt(e.target.value) || 0 })}
                    />
                    <input
                      type="number"
                      className="w-full border p-2 rounded"
                      placeholder="Max"
                      value={inlineEditData.max || ''}
                      onChange={e => setInlineEditData({ ...inlineEditData, max: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleInlineSave}
                      className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded font-bold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle size={16} /> Salvar
                    </button>
                    <button
                      onClick={handleInlineCancel}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded font-bold flex items-center gap-1"
                    >
                      <X size={16} /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 flex justify-between items-center border-b border-gray-100 ${(group.active ?? true) ? '' : 'opacity-50'}`}>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{group.title}</h3>
                  <p className="text-sm text-gray-500">
                    Min: {group.min} | Max: {group.max} | {group.options.length} opções
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {/* Toggle Active/Inactive */}
                  <button
                    onClick={() => handleToggleGroupActiveClick(group)}
                    className={`p-2 rounded transition-colors ${(group.active ?? true) ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    title={(group.active ?? true) ? 'Desativar Grupo' : 'Ativar Grupo'}
                  >
                    {(group.active ?? true) ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button
                    onClick={() => handleInlineEdit(group)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Editar Rápido"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button
                    onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Ver Opções"
                  >
                    {expandedGroup === group.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar Completo"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroupClick(group)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Deletar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}

            {expandedGroup === group.id && (
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-gray-700">Opções</h4>
                  <button
                    onClick={() => handleAddOption(group.id)}
                    className="text-purple-600 text-sm font-bold flex items-center gap-1 hover:text-purple-700"
                  >
                    <Plus size={16} /> Adicionar Opção
                  </button>
                </div>
                <div className="space-y-2">
                  {group.options.map(option => (
                    <div key={option.id} className={`bg-white p-3 rounded border border-gray-200 flex justify-between items-start ${(option.active ?? true) ? '' : 'opacity-50'}`}>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{option.name}</p>
                        {option.description && (
                          <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                        )}
                        <p className="text-sm text-green-600 font-bold mt-1">
                          + R$ {option.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {/* Toggle Active/Inactive */}
                        <button
                          onClick={() => handleToggleOptionActiveClick(group.id, option)}
                          className={`p-1 rounded transition-colors ${(option.active ?? true) ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                          title={(option.active ?? true) ? 'Desativar Opção' : 'Ativar Opção'}
                        >
                          {(option.active ?? true) ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => handleEditOption(group.id, option)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOptionClick(group.id, option)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {group.options.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">Nenhuma opção adicionada</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {groups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Nenhum grupo criado ainda</p>
            <button
              onClick={handleAddGroup}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700"
            >
              Criar Primeiro Grupo
            </button>
          </div>
        )}
      </div>

      {/* Group Modal */}
      {isModalOpen && editingGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">
              {groups.find(g => g.id === editingGroup.id) ? 'Editar Grupo' : 'Novo Grupo'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título do Grupo"
                value={editingGroup.title}
                onChange={e => setEditingGroup({ ...editingGroup, title: e.target.value })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo</label>
                  <input
                    type="number"
                    value={editingGroup.min}
                    onChange={e => setEditingGroup({ ...editingGroup, min: parseInt(e.target.value) || 0 })}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo</label>
                  <input
                    type="number"
                    value={editingGroup.max}
                    onChange={e => setEditingGroup({ ...editingGroup, max: parseInt(e.target.value) || 0 })}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setIsModalOpen(false); setEditingGroup(null); }}
                  className="flex-1 py-3 bg-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveGroup}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Option Modal */}
      {editingOption && editingOption.option && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">
              {groups.find(g => g.id === editingOption.groupId)?.options.find(o => o.id === editingOption.option!.id)
                ? 'Editar Opção'
                : 'Nova Opção'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome da Opção"
                value={editingOption.option.name}
                onChange={e => setEditingOption({
                  ...editingOption,
                  option: { ...editingOption.option!, name: e.target.value }
                })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={editingOption.option.description || ''}
                onChange={e => setEditingOption({
                  ...editingOption,
                  option: { ...editingOption.option!, description: e.target.value }
                })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                rows={2}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço Adicional (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={editingOption.option.price || ''}
                  onChange={e => setEditingOption({
                    ...editingOption,
                    option: { ...editingOption.option!, price: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingOption(null)}
                  className="flex-1 py-3 bg-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveOption}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={!!deleteGroupConfirmation}
        title="Excluir Grupo"
        message={`Tem certeza que deseja excluir o grupo "${deleteGroupConfirmation?.title}"?`}
        onConfirm={() => {
          if (deleteGroupConfirmation) {
            performDeleteGroup(deleteGroupConfirmation.id);
          }
        }}
        onCancel={() => setDeleteGroupConfirmation(null)}
        isDestructive
        confirmText="Excluir"
      />

      <ConfirmModal
        isOpen={!!deleteOptionConfirmation}
        title="Excluir Opção"
        message={`Tem certeza que deseja excluir a opção "${deleteOptionConfirmation?.option.name}"?`}
        onConfirm={() => {
          if (deleteOptionConfirmation) {
            performDeleteOption(deleteOptionConfirmation.groupId, deleteOptionConfirmation.option.id);
          }
        }}
        onCancel={() => setDeleteOptionConfirmation(null)}
        isDestructive
        confirmText="Excluir"
      />

      <ConfirmModal
        isOpen={!!activeGroupConfirmation}
        title="Desativar Grupo"
        message={`Tem certeza que deseja desativar o grupo "${activeGroupConfirmation?.group.title}"?`}
        onConfirm={() => {
          if (activeGroupConfirmation) {
            performToggleGroupActive(activeGroupConfirmation.group, activeGroupConfirmation.newActive);
          }
        }}
        onCancel={() => setActiveGroupConfirmation(null)}
        isDestructive
        confirmText="Desativar"
      />

      <ConfirmModal
        isOpen={!!activeOptionConfirmation}
        title="Desativar Opção"
        message={`Tem certeza que deseja desativar a opção "${activeOptionConfirmation?.option.name}"?`}
        onConfirm={() => {
          if (activeOptionConfirmation) {
            performToggleOptionActive(activeOptionConfirmation.groupId, activeOptionConfirmation.option, activeOptionConfirmation.newActive);
          }
        }}
        onCancel={() => setActiveOptionConfirmation(null)}
        isDestructive
        confirmText="Desativar"
      />
    </div>
  );
};

const SettingsPage = () => {
  const { store, settings, updateSettings, isStoreOpen } = useApp();
  const navigate = useNavigate();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState<{ field: 'logoUrl' | 'bannerUrl', visible: boolean }>({ field: 'logoUrl', visible: false });
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [cropModalData, setCropModalData] = useState<{ imageUrl: string; field: 'logoUrl' | 'bannerUrl'; aspectRatio: number } | null>(null);

  // Local state for all settings to avoid redundant DB calls on every keystroke
  const [localSettings, setLocalSettings] = useState<GlobalSettings>(settings);

  // Sync local state when global settings change (e.g. on load)
  // Use ref to prevent the circular update loop:
  // updateSettings → setSettings (global) → useEffect → setLocalSettings → re-render
  const isFirstLoad = React.useRef(true);
  useEffect(() => {
    if (isFirstLoad.current) {
      setLocalSettings(settings);
      isFirstLoad.current = false;
    }
  }, [settings.storeId]); // Only sync on store change, not every settings update

  const handleSave = async () => {
    try {
      await updateSettings(localSettings); 
      setShowSaveConfirm(true);
      setTimeout(() => setShowSaveConfirm(false), 3000);
    } catch (err) {
      // Error handled in updateSettings
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `store-assets/${store?.id || 'default'}/${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerUrl') => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      const aspectRatio = field === 'logoUrl' ? 1 : 16 / 9;
      setCropModalData({ imageUrl, field, aspectRatio });
    }
    // Limpar o input para permitir selecionar a mesma imagem se necessário
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!cropModalData) return;

    const publicUrl = await uploadImageToSupabase(croppedFile);
    if (publicUrl) {
      try {
        // Always include store_name to avoid NOT NULL constraint
        await updateSettings({ 
          [cropModalData.field]: publicUrl,
          storeName: localSettings.storeName || settings.storeName || store?.name
        });
        setShowSaveConfirm(true);
        setTimeout(() => setShowSaveConfirm(false), 3000);
      } catch (err) {
        console.error("Erro ao salvar imagem recortada:", err);
      }
    }
    setCropModalData(null);
  };

  const handleHourChange = (dayOfWeek: number, field: 'open' | 'close' | 'enabled', value: string | boolean) => {
    const updatedHours = localSettings.openingHours.map(h =>
      h.dayOfWeek === dayOfWeek
        ? { ...h, [field]: value }
        : h
    );
    setLocalSettings(prev => ({ ...prev, openingHours: updatedHours }));
  };

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/${store?.slug}/panel`)}><ChevronLeft /></button>
        <h1 className="text-xl font-bold">Configurações</h1>
      </div>

      <div className="space-y-4">
        {/* Manual Store Control */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <ToggleLeft size={20} /> Controle da Loja
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, storeStatus: 'open' }))}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${localSettings.storeStatus === 'open' ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <div className={`w-3 h-3 rounded-full ${localSettings.storeStatus === 'open' ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-xs font-bold">ABERTO</span>
                <span className="text-[10px] opacity-75">(Forçar)</span>
              </button>

              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, storeStatus: 'closed' }))}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${localSettings.storeStatus === 'closed' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <div className={`w-3 h-3 rounded-full ${localSettings.storeStatus === 'closed' ? 'bg-red-500' : 'bg-gray-300'}`} />
                <span className="text-xs font-bold">FECHADO</span>
                <span className="text-[10px] opacity-75">(Forçar)</span>
              </button>

              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, storeStatus: 'auto' }))}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${localSettings.storeStatus === 'auto' || !localSettings.storeStatus ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <div className={`w-3 h-3 rounded-full ${localSettings.storeStatus === 'auto' || !localSettings.storeStatus ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <span className="text-xs font-bold">AUTO</span>
                <span className="text-[10px] opacity-75">(Horários)</span>
              </button>
            </div>

            <div className="text-center p-2 rounded bg-gray-50 border border-gray-100">
              <span className="text-xs text-gray-500">
                Status Atual: <strong className={isStoreOpen ? 'text-green-600' : 'text-red-600'}>
                  {isStoreOpen ? '🟢 ABERTO AGORA' : '🔴 FECHADO AGORA'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Status Messages Configuration */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MessageSquare size={20} /> Mensagens de Status
          </h3>
          <p className="text-xs text-gray-500 mb-4">Personalize as mensagens exibidas quando a loja está aberta ou fechada</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem quando ABERTO
              </label>
              <input
                type="text"
                value={localSettings.openMessage || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, openMessage: e.target.value }))}
                placeholder="Ex: 🟢 Aberto até às 23:00"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Exibido no topo da página inicial quando a loja está aberta</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem quando FECHADO
              </label>
              <input
                type="text"
                value={localSettings.closedMessage || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, closedMessage: e.target.value }))}
                placeholder="Ex: 🔴 Loja Fechada"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Exibido no topo da página inicial quando a loja está fechada</p>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              Salvar Mensagens
            </button>
          </div>
        </div>

        {/* Estimates and Hours Configuration */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={20} /> Estimativas e Horários
          </h3>
          <p className="text-xs text-gray-500 mb-4">Configure as estimativas de tempo e horário limite de entrega</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo de Entrega
              </label>
              <input
                type="text"
                value={localSettings.deliveryTime || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, deliveryTime: e.target.value }))}
                placeholder="Ex: 40min à 1h"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo de Retirada
              </label>
              <input
                type="text"
                value={localSettings.pickupTime || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, pickupTime: e.target.value }))}
                placeholder="Ex: 20min à 45min"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário Limite de Entrega
              </label>
              <input
                type="text"
                value={localSettings.deliveryCloseTime || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, deliveryCloseTime: e.target.value }))}
                placeholder="Ex: 21:00"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Exibido como "Entregas somente até as [HORÁRIO]hrs!"</p>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              Salvar Estimativas
            </button>
          </div>
        </div>

        {/* Footer Info Configuration */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Info size={20} /> Rodapé
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link do Instagram
              </label>
              <input
                type="text"
                value={localSettings.instagramUrl || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                placeholder="https://www.instagram.com/seu_perfil"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço Comercial
              </label>
              <input
                type="text"
                value={localSettings.businessAddress || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, businessAddress: e.target.value }))}
                placeholder="Ex: Sua Cidade - UF"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto de Copyright
              </label>
              <input
                type="text"
                value={localSettings.copyrightText || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, copyrightText: e.target.value }))}
                placeholder="Ex: © 2025-2026 Obba Açaí"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem de Revisão de Pedido (Checkout)
              </label>
              <textarea
                value={localSettings.checkoutReviewMessage || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, checkoutReviewMessage: e.target.value }))}
                placeholder="Opcional. Ex: Seu pedido será revisado pela loja. Você poderá receber um desconto especial na confirmação!"
                rows={2}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              Salvar Rodapé
            </button>
          </div>
        </div>

        {/* Delivery Mode Control */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin size={20} /> Modo de Entrega
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Apenas Retirada na Loja</p>
                <p className="text-xs text-gray-500">Desativar entregas (somente pickup)</p>
              </div>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, deliveryOnly: !prev.deliveryOnly }))}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${localSettings.deliveryOnly ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${localSettings.deliveryOnly ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
            {settings.deliveryOnly && (
              <div className="p-2 bg-orange-50 border border-orange-200 rounded text-center">
                <span className="text-sm font-medium text-orange-700">⚠️ Entregas desativadas - Apenas retirada</span>
              </div>
            )}
            <button
              onClick={handleSave}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={20} /> Horários de Funcionamento
          </h3>
          <p className="text-xs text-gray-500 mb-4">Configure os horários automáticos de abertura e fechamento</p>
          <div className="space-y-3">
            {(localSettings.openingHours || []).map((hour) => (
              <div key={hour.dayOfWeek} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{dayNames[hour.dayOfWeek]}</span>
                  <button
                    onClick={() => handleHourChange(hour.dayOfWeek, 'enabled', !hour.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hour.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hour.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
                {hour.enabled && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Abertura</label>
                      <input
                        type="time"
                        value={hour.open}
                        onChange={(e) => handleHourChange(hour.dayOfWeek, 'open', e.target.value)}
                        className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Fechamento</label>
                      <input
                        type="time"
                        value={hour.close}
                        onChange={(e) => handleHourChange(hour.dayOfWeek, 'close', e.target.value)}
                        className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                )}
                {!hour.enabled && (
                  <p className="text-xs text-gray-400 italic mt-1">Fechado neste dia</p>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors mt-4"
          >
            Salvar Configurações
          </button>
        </div>

        {/* Logo Upload */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-3">Logo da Loja</label>

          {/* Shape Selector */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">Formato do Logo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, logoShape: 'circle' }))}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${localSettings.logoShape === 'circle'
                  ? 'bg-purple-50 border-purple-500 text-purple-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <div className={`w-12 h-12 rounded-full border-2 ${localSettings.logoShape === 'circle' ? 'border-purple-500' : 'border-gray-300'
                  }`} />
                <span className="text-xs font-bold">Círculo</span>
              </button>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, logoShape: 'rectangle' }))}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${localSettings.logoShape === 'rectangle'
                  ? 'bg-purple-50 border-purple-500 text-purple-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <div className={`w-12 h-12 rounded-lg border-2 ${localSettings.logoShape === 'rectangle' ? 'border-purple-500' : 'border-gray-300'
                  }`} />
                <span className="text-xs font-bold">Retângulo</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={localSettings.logoUrl} className={`w-20 h-20 object-cover border ${localSettings.logoShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`} alt="Logo" />
              <button
                onClick={() => {
                  if (confirm('Remover logo da loja?')) {
                    setLocalSettings(prev => ({ ...prev, logoUrl: '' }));
                  }
                }}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                type="button"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <label
              htmlFor="logo-file"
              className={`flex-1 cursor-pointer bg-gray-50 hover:bg-gray-100 p-3 rounded border border-dashed flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload size={18} /> <span className="text-sm">{isUploading ? 'Enviando...' : 'Alterar Logo'}</span>
              <input type="file" id="logo-file" accept="image/*" hidden onChange={e => handleImage(e, 'logoUrl')} disabled={isUploading} />
            </label>
            <label
              htmlFor="logo-camera"
              className={`p-3 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded border border-dashed flex items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Tirar Foto"
            >
              <Camera size={18} />
              <input type="file" id="logo-camera" accept="image/*" capture="environment" hidden onChange={e => handleImage(e, 'logoUrl')} disabled={isUploading} />
            </label>
            <button
              onClick={() => {
                setShowLinkInput({ field: 'logoUrl', visible: !showLinkInput.visible || showLinkInput.field !== 'logoUrl' });
                setTempImageUrl('');
              }}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded border border-dashed text-gray-600"
              title="Usar Link"
            >
              <LinkIcon size={18} />
            </button>
          </div>

          {showLinkInput.visible && showLinkInput.field === 'logoUrl' && (
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 border p-2 rounded text-sm"
                placeholder="Cole o link da logo aqui..."
                value={tempImageUrl}
                onChange={e => setTempImageUrl(e.target.value)}
              />
              <button
                onClick={() => {
                  if (tempImageUrl) {
                    setLocalSettings(prev => ({ ...prev, logoUrl: tempImageUrl }));
                    setShowLinkInput({ field: 'logoUrl', visible: false });
                  }
                }}
                className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold"
              >
                OK
              </button>
            </div>
          )}
        </div>

        {/* Cover Photo Upload */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">Foto de Capa / Banner</label>
          <div className="space-y-3">
            {localSettings.bannerUrl && (
              <div className="relative">
                <img src={localSettings.bannerUrl} className="w-full h-32 rounded object-cover border" alt="Banner" />
                <button
                  onClick={() => {
                    if (confirm('Remover foto de capa?')) {
                      setLocalSettings(prev => ({ ...prev, bannerUrl: '' }));
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <label
                htmlFor="banner-file"
                className={`flex-1 cursor-pointer bg-gray-50 hover:bg-gray-100 p-3 rounded border border-dashed flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload size={18} /> <span className="text-sm">{isUploading ? 'Enviando...' : 'Alterar Foto de Capa'}</span>
                <input type="file" id="banner-file" accept="image/*" hidden onChange={e => handleImage(e, 'bannerUrl')} disabled={isUploading} />
              </label>
              <label
                htmlFor="banner-camera"
                className={`p-3 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded border border-dashed flex items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Tirar Foto"
              >
                <Camera size={18} />
                <input type="file" id="banner-camera" accept="image/*" capture="environment" hidden onChange={e => handleImage(e, 'bannerUrl')} disabled={isUploading} />
              </label>
              <button
                onClick={() => {
                  setShowLinkInput({ field: 'bannerUrl', visible: !showLinkInput.visible || showLinkInput.field !== 'bannerUrl' });
                  setTempImageUrl('');
                }}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded border border-dashed text-gray-600"
                title="Usar Link"
              >
                <LinkIcon size={18} />
              </button>
            </div>

            {showLinkInput.visible && showLinkInput.field === 'bannerUrl' && (
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 border p-2 rounded text-sm"
                  placeholder="Cole o link da capa aqui..."
                  value={tempImageUrl}
                  onChange={e => setTempImageUrl(e.target.value)}
                />
                <button
                  onClick={() => {
                    if (tempImageUrl) {
                      setLocalSettings(prev => ({ ...prev, bannerUrl: tempImageUrl }));
                      setShowLinkInput({ field: 'bannerUrl', visible: false });
                    }
                  }}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Store Name */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Loja</label>
          <input
            className="w-full border p-2 rounded"
            value={localSettings.storeName}
            onChange={e => setLocalSettings(prev => ({ ...prev, storeName: e.target.value }))}
          />
        </div>

        {/* WhatsApp */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp (com código do país)</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="5594999999999"
            value={localSettings.whatsappNumber}
            onChange={e => setLocalSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
          />
          <p className="text-xs text-gray-500 mt-1">Exemplo: 5594992816973</p>
        </div>

        {/* Delivery Fee */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">Taxa de Entrega (R$)</label>
          <input
            type="number"
            step="0.01"
            className="w-full border p-2 rounded"
            value={localSettings.deliveryFee}
            onChange={e => setLocalSettings(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) }))}
          />
        </div>

        {/* DIAGNÓSTICO DE CONEXÃO (DEBUG) */}
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-sm border border-gray-600">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Info size={20} className="text-blue-400" /> Diagnóstico de Conexão
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>STATUS DO APP:</div>
            <div className={isConfigured ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
              {isConfigured ? 'ONLINE (Supabase)' : 'OFFLINE (Mock Data)'}
            </div>

            <div>MUDANÇAS SALVAM?</div>
            <div className={isConfigured ? "text-green-400" : "text-red-400"}>
              {isConfigured ? 'SIM (No Banco de Dados)' : 'NÃO (Apenas Memória)'}
            </div>

            <div>TESTE DE ENV VARS:</div>
            <div>
              URL: {(import.meta as any).env.VITE_SUPABASE_URL ? '✅ OK' : '❌ VAZIO'}<br />
              KEY: {(import.meta as any).env.VITE_SUPABASE_ANON_KEY ? '✅ OK' : '❌ VAZIO'}
            </div>
          </div>
          <p className="mt-2 text-[10px] text-gray-400">
            Se estiver OFFLINE no Vercel, verifique em Settings &rarr; Environment Variables se as chaves estão exatamente iguais ao .env.local e faça um Redeploy.
          </p>
        </div>
      </div>

      {/* Save Confirmation Toast */}
      {showSaveConfirm && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle size={20} />
          <span className="font-bold">Configurações Salvas!</span>
        </div>
      )}

      {/* Crop Modal */}
      {cropModalData && (
        <ImageCropModal
          imageUrl={cropModalData.imageUrl}
          aspectRatio={cropModalData.aspectRatio}
          onComplete={handleCropComplete}
          onCancel={() => setCropModalData(null)}
          title={cropModalData.field === 'logoUrl' ? 'Recortar Logo' : 'Recortar Capa'}
        />
      )}
    </div>
  );
};



const ThemeSettingsPage = () => {
  const { settings, updateSettings, store } = useApp();
  const navigate = useNavigate();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const colors = [
    { key: 'headerBg', label: 'Fundo do Cabeçalho', default: '#4E0797' },
    { key: 'headerText', label: 'Texto do Cabeçalho', default: '#ffffff' },
    { key: 'background', label: 'Fundo da Página', default: '#f6f6f6' },
    { key: 'cardBg', label: 'Fundo dos Cards', default: '#ffffff' },
    { key: 'cardText', label: 'Texto dos Cards', default: '#333333' },
    { key: 'buttonPrimary', label: 'Botão Principal', default: '#e50914' },
    { key: 'buttonText', label: 'Texto do Botão', default: '#ffffff' },
    { key: 'textPrimary', label: 'Texto Principal', default: '#1e1e1e' },
    { key: 'textSecondary', label: 'Texto Secundário', default: '#666666' },
  ];

  const handleColorChange = (key: string, value: string) => {
    const currentTheme = settings.themeColors || {};
    updateSettings({
      themeColors: {
        ...currentTheme,
        [key]: value
      }
    });
  };

  const handleSave = () => {
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Deseja restaurar as cores padrão?')) {
      updateSettings({ themeColors: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/${store?.slug}/panel`)}><ChevronLeft /></button>
        <h1 className="text-xl font-bold">Cores do Site</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Palette size={20} /> Personalizar Cores
          </h3>
          <button
            onClick={handleReset}
            className="text-sm text-red-600 font-bold hover:underline"
          >
            Restaurar Padrão
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colors.map(color => {
            const currentValue = (settings.themeColors as any)?.[color.key] || color.default;
            return (
              <div key={color.key} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-gray-50">
                <input
                  type="color"
                  value={currentValue}
                  onChange={(e) => handleColorChange(color.key, e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
                />
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700">{color.label}</label>
                  <span className="text-xs text-gray-500 uppercase">{currentValue}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors mt-6"
        >
          Salvar Alterações
        </button>
      </div>

      {/* Preview Box */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">Pré-visualização</h3>
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: (settings.themeColors as any)?.background || '#f6f6f6' }}
        >
          <div
            className="p-3 rounded-lg mb-3 text-center shadow-sm"
            style={{
              backgroundColor: (settings.themeColors as any)?.headerBg || 'var(--color-header-bg)',
              color: (settings.themeColors as any)?.headerText || 'var(--color-header-text)'
            }}
          >
            Cabeçalho Exemplo
          </div>
          <div
            className="p-4 rounded-lg shadow-sm"
            style={{
              backgroundColor: (settings.themeColors as any)?.cardBg || 'var(--color-card-bg)',
              color: (settings.themeColors as any)?.cardText || 'var(--color-card-text)'
            }}
          >
            <h4 style={{ color: (settings.themeColors as any)?.textPrimary || 'var(--color-text-primary)' }} className="font-bold mb-2">Título do Card</h4>
            <p style={{ color: (settings.themeColors as any)?.textSecondary || 'var(--color-text-secondary)' }} className="text-sm mb-3">Este é um exemplo de texto secundário no card.</p>
            <button
              className="px-4 py-2 rounded font-bold text-sm w-full"
              style={{
                backgroundColor: (settings.themeColors as any)?.buttonPrimary || 'var(--color-button-primary)',
                color: (settings.themeColors as any)?.buttonText || 'var(--color-button-text)'
              }}
            >
              Botão de Ação
            </button>
          </div>
        </div>
      </div>

      {showSaveConfirm && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle size={20} />
          <span className="font-bold">Configurações Salvas!</span>
        </div>
      )}
    </div>
  );
};

const ExitModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <LogOut size={32} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Sair do Aplicativo?</h3>
          <p className="text-gray-500 mb-6">Tem certeza que deseja fechar o aplicativo?</p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              CANCELAR
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
            >
              SAIR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Root ---

const AppContent = () => {
  const {
    store, categories, addCategory, updateCategory, deleteCategory,
    products, addProduct, updateProduct, deleteProduct, reorderProducts,
    groups, orders, loading, isModernUI, setIsModernUI
  } = useApp();



  const location = useLocation();
  const navigate = useNavigate();
  // Determine if it's an admin route
  const isAdminRoute = location.pathname.includes('/panel') || location.pathname.startsWith('/platform');
  const isStorefrontRoute = !isAdminRoute && !['/', '/login', '/setup'].includes(location.pathname);
  const isStoreHome = isStorefrontRoute && !location.pathname.includes('/cart') && !location.pathname.includes('/checkout');
  const [showExitModal, setShowExitModal] = useState(false);

  const { settings } = useApp();

  // Dynamic Document Title and PWA Manifest (Route Aware)
  useEffect(() => {
    const isPlatformHome = location.pathname === '/';
    const isPlatformAdmin = location.pathname.startsWith('/platform');

    if (isPlatformHome) {
      document.title = "Canaã Delivery OS";
    } else if (isPlatformAdmin) {
      document.title = "Canaã Delivery OS - Admin";
    } else if (isAdminRoute) {
      document.title = `Painel - ${settings.storeName || 'Delivery'}`;
    } else if (settings && settings.storeName) {
      document.title = settings.storeName;
    } else {
      document.title = "Sistema de Delivery";
    }

    // Only update Manifest if NOT on platform home (to keep store identity for PWA)
    if (!isPlatformHome && settings && settings.storeName) {
      const manifestNode = document.querySelector('link[rel="manifest"]');
      if (manifestNode) {
        const storeId = store?.slug || 'default';
        const manifestObj = {
          id: `delivery-app-${storeId}`,
          name: settings.storeName,
          short_name: settings.storeName.length > 12 ? settings.storeName.substring(0, 12).trim() : settings.storeName,
          description: `Delivery Oficial - ${settings.storeName}`,
          start_url: `${window.location.origin}/#/${storeId}`,
          scope: `${window.location.origin}/`,
          display: 'standalone',
          theme_color: settings.themeColors?.primary || '#8b5cf6',
          background_color: '#f9fafb',
          icons: [
            {
              src: settings.logoUrl?.startsWith('http') ? settings.logoUrl : `${window.location.origin}${settings.logoUrl || '/pwa-192x192.png'}`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: settings.logoUrl?.startsWith('http') ? settings.logoUrl : `${window.location.origin}${settings.logoUrl || '/pwa-512x512.png'}`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        };

        const manifestString = JSON.stringify(manifestObj);
        const blob = new Blob([manifestString], { type: 'application/json' });
        const manifestURL = URL.createObjectURL(blob);
        manifestNode.setAttribute('href', manifestURL);
      }
    } else if (isPlatformHome) {
      // Reset to default manifest for Home Page
      const manifestNode = document.querySelector('link[rel="manifest"]');
      if (manifestNode) {
        manifestNode.setAttribute('href', '/manifest.webmanifest');
      }
    }
  }, [isAdminRoute, location.pathname, settings?.storeName, settings?.logoUrl, settings?.themeColors, store]);

  useEffect(() => {
    const handleBackButton = async () => {
      if (location.pathname === '/') {
        setShowExitModal(true);
      } else {
        navigate(-1);
      }
    };

    const listener = CapacitorApp.addListener('backButton', handleBackButton);
    return () => {
      listener.then(l => l.remove());
    };
  }, [location, navigate]);

  const handleConfirmExit = () => {
    CapacitorApp.exitApp();
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-outfit z-[99999]"
        style={{ background: 'linear-gradient(135deg, #0a0118 0%, #130a2e 50%, #1a0a3e 100%)' }}
      >
        {/* Ambient glow orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* 3D App Icon */}
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-purple-500/50 rounded-2xl blur-xl animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-violet-700 rounded-2xl flex items-center justify-center shadow-xl border border-white/20">
              <StoreIcon size={40} className="text-white drop-shadow-md animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
          </div>
          
          {/* Loading Dots */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-white/50 font-medium mt-4 text-xs font-bold tracking-[0.2em] uppercase">
            Iniciando
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isModernUI && !isAdminRoute ? 'bg-[#FAFAFA]' : 'bg-gray-50'} md:pb-0`}>
      <ExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
      {/* Global Header removed to avoid redundancy with Modern/Classic Hero sections and search bars */}

      {/* Theme Switcher Button */}
      {isStorefrontRoute && (
        <button
          onClick={() => setIsModernUI(!isModernUI)}
          className={`fixed bottom-24 md:bottom-20 right-4 z-[100] flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all text-xs font-bold font-outfit backdrop-blur-md border ${isModernUI ? 'bg-white/90 text-purple-700 border-purple-100 hover:bg-white' : 'bg-gray-900/90 text-white border-gray-700 hover:bg-gray-900'}`}
        >
          <LayoutTemplate size={14} />
          {isModernUI ? 'Usar Versão Antiga' : 'Versão Moderna'}
        </button>
      )}

      <Routes>
        <Route path="/" element={<PlatformHome />} />
        <Route path="/:storeSlug" element={
          isModernUI ? (
            <ModernHomePage />
          ) : (
            <>
              <Hero />
              <HomePage />
            </>
          )
        } />
        <Route path="/:storeSlug/cart" element={<CartPage />} />
        <Route path="/:storeSlug/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/setup" element={<SetupPage />} />

        <Route path="/platform" element={<PlatformAdminPanel />} />

        {/* Admin Panel Routes with Slug Prefix */}
        <Route path="/:storeSlug/panel" element={<AdminPanel />} />
        <Route path="/:storeSlug/panel/orders" element={<OrdersPage />} />
        <Route path="/:storeSlug/panel/coupons" element={<CouponsPage />} />
        <Route path="/:storeSlug/panel/addons" element={<AddonsPage />} />
        <Route path="/:storeSlug/panel/settings" element={<SettingsPage />} />
        <Route path="/:storeSlug/panel/theme" element={<ThemeSettingsPage />} />
        <Route path="/:storeSlug/panel/inventory" element={<InventoryPage products={products} />} />
        <Route path="/:storeSlug/panel/printer" element={<PrinterSettingsPage />} />
        
        <Route path="/:storeSlug/panel/categories" element={
          <CategoriesPage
            storeName={store?.name}
            storeId={store?.id}
            categories={categories}
            addCategory={addCategory}
            updateCategory={updateCategory}
            deleteCategory={deleteCategory}
          />
        } />

        <Route path="/:storeSlug/panel/products" element={
          <ProductsPage
            storeName={store?.name}
            storeId={store?.id}
            products={products}
            categories={categories}
            groups={groups}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
            reorderProducts={reorderProducts}
          />
        } />

        <Route path="/:storeSlug/panel/reports" element={
          <ReportsPage orders={orders} />
        } />
      </Routes>

      {isStorefrontRoute && <Sidebar />}
      {isStorefrontRoute && <FloatingCartButton />}
      {isStoreHome && <Footer />}
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  public state: { hasError: boolean, error: Error | null } = { hasError: false, error: null };
  
  constructor(props: { children: React.ReactNode }) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ops! Algo deu errado.</h1>
          <p className="text-gray-600 mb-4">Ocorreu um erro inesperado na aplicação.</p>
          <pre className="bg-gray-200 p-4 rounded text-xs text-left overflow-auto max-w-full mb-6">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-purple text-white px-6 py-3 rounded-lg font-bold"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const App = () => {
  return (
    <AppProvider>
      <PrinterProvider>
        <ErrorBoundary>
          <HashRouter>
            <AppContent />
          </HashRouter>
        </ErrorBoundary>
      </PrinterProvider>
    </AppProvider>
  );
};

export default App;
