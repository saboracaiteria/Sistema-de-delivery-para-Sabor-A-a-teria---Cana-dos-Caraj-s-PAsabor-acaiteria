import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, Info, Plus, Settings as SettingsIcon, Search, ChevronLeft, ChevronRight, X, Minus, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { useApp, ProductModal } from './App';
import { Product, ProductGroup } from './types';
import { PwaInstallPrompt } from './PwaInstallPrompt';
import { ShareQRCode } from './ShareQRCode';


// Modern Hero Component
export const ModernHero = () => {
    const { settings, isStoreOpen, setSidebarOpen } = useApp();

    return (
        <div className="w-full bg-white md:bg-gray-50 mb-6 md:mb-10 font-outfit">
            <div className="relative w-full h-[180px] md:h-[480px] overflow-hidden md:rounded-b-[4rem] group">
                {/* Top Navigation Bar */}
                <div className="absolute top-0 left-0 right-0 z-[55] p-3 md:p-4 flex items-center justify-between pointer-events-none">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="pointer-events-auto p-2.5 bg-white/80 backdrop-blur-lg border border-white/50 rounded-2xl text-slate-800 hover:bg-white transition-all shadow-sm active:scale-95 flex items-center justify-center"
                    >
                        <Menu strokeWidth={2.5} size={20} md:size={22} />
                    </button>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <ShareQRCode variant="modern" />
                        <button className="p-2.5 bg-white/80 backdrop-blur-lg border border-white/50 rounded-2xl text-slate-800 hover:bg-white transition-all shadow-sm active:scale-95">
                            <Search strokeWidth={2.5} size={20} md:size={22} />
                        </button>
                    </div>
                </div>

                <PwaInstallPrompt variant="modern" />

                {/* Banner Image with subtle zoom and light treatment */}
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src={settings.bannerUrl || "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=2670&auto=format&fit=crop"}
                        className="w-full h-full object-cover"
                        alt="Banner"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 md:to-gray-50/90 z-10" />
                </motion.div>

                {/* Desktop Floating Glass Card (Hidden on Mobile) */}
                <div className="hidden md:block absolute bottom-6 left-10 right-10 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 flex items-end gap-8 overflow-hidden relative"
                    >
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative shrink-0">
                            <img
                                src={settings.logoUrl}
                                className={`w-32 h-32 object-cover bg-white p-1 shadow-lg relative z-10 ${settings.logoShape === 'circle' ? 'rounded-full' : 'rounded-[2rem]'}`}
                                alt="Logo"
                            />
                            <motion.div
                                className={`absolute -bottom-1 -right-1 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest border-2 border-white shadow-lg flex items-center gap-1.5 z-20 ${isStoreOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
                                animate={isStoreOpen ? { scale: [1, 1.05, 1] } : {}}
                                transition={isStoreOpen ? { duration: 2, repeat: Infinity } : {}}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                {isStoreOpen ? 'LOJA ABERTA' : 'LOJA FECHADA'}
                            </motion.div>
                        </div>
                        <div className="flex-1 pb-1">
                            <span className="text-purple-600 font-bold text-xs tracking-[0.2em] uppercase mb-1 block">Seja Bem-vindo</span>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">{settings.storeName}</h1>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                                    <Clock size={14} className="text-purple-500" /> {settings.deliveryTime || '30-45 min'}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                                    <Info size={14} className="text-purple-500" /> Mais Informações
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Mobile Info Area (Hidden on Desktop) */}
            <div className="md:hidden relative px-4 pt-10 pb-2">
                {/* Mobile Logo Overlapping Banner */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-125" />
                        <img
                            src={settings.logoUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='50' fill='%234E0797'/%3E%3Ctext x='50' y='67' font-size='50' text-anchor='middle' fill='white' font-family='sans-serif'%3E🏪%3C/text%3E%3C/svg%3E"}
                            className={`w-28 h-28 object-cover bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative z-10 ${settings.logoShape === 'circle' ? 'rounded-full' : 'rounded-3xl'}`}
                            alt="Logo"
                        />
                        <div className={`absolute -bottom-1 right-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-tighter border-2 border-white shadow-md z-20 ${isStoreOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {isStoreOpen ? 'ABERTO' : 'FECHADO'}
                        </div>
                    </div>
                </div>

                <div className="text-center pt-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                        {settings.storeName}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-slate-500 rounded-full text-[11px] font-bold border border-gray-100">
                            <Clock size={12} className="text-purple-500" />
                            {settings.deliveryTime || '30-45 min'}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-slate-500 rounded-full text-[11px] font-bold border border-gray-100">
                            <Info size={12} className="text-purple-500" />
                            Ver Info
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modern Product Card
export const ModernProductCard = React.memo(({ product, index }: { product: Product, index: number }) => {
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

        setIsModalOpen(true);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05, type: "spring", bounce: 0.4 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="bg-white rounded-[1.5rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(78,7,151,0.08)] transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col gap-3 overflow-hidden relative group"
            >
                {/* Decorative glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] blur-xl" />

                <div className="relative w-full aspect-square shrink-0 rounded-[1.2rem] overflow-hidden bg-gray-50 shadow-inner">
                    <motion.img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                    />
                </div>

                <div className="flex flex-col justify-between flex-1 relative z-10">
                    <div className="mb-2">
                        <h3 className="font-extrabold text-gray-800 tracking-tight text-sm md:text-base line-clamp-2 leading-tight mb-1">{product.name}</h3>
                        <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1 leading-relaxed font-medium">{product.description}</p>
                    </div>

                    <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">A partir de</span>
                            <span className="font-black text-purple-700 text-base md:text-lg leading-none">R$ {product.price.toFixed(2)}</span>
                        </div>

                        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center transition-colors shadow-sm ${hasOptions ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-100' : 'bg-[#4E0797] text-white group-hover:bg-[#3d0577] shadow-[0_4px_10px_rgba(78,7,151,0.3)]'}`}>
                            {hasOptions ? <Plus strokeWidth={3} size={16} /> : <ShoppingCart strokeWidth={2.5} size={14} />}
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && <ProductModal product={product} onClose={() => setIsModalOpen(false)} />}
                {showClosedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 border border-red-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
                    >
                        <div className="bg-red-500/20 p-1.5 rounded-full text-red-400">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <span className="block font-bold text-sm">Loja Fechada</span>
                            <span className="block text-xs text-gray-400">Não estamos aceitando pedidos agora.</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
});

// Modern Floating Cart
export const ModernFloatingCart = () => {
    const { store, cart, settings } = useApp();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
    const navigate = useNavigate();

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
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none"
        >
            <button
                onClick={() => navigate(`/${store?.slug}/cart`)}
                className={`pointer-events-auto w-full max-w-md bg-[#4E0797] text-white rounded-2xl shadow-[0_10px_40px_rgba(78,7,151,0.4)] flex items-center justify-between p-4 overflow-hidden relative group transition-transform ${animate ? 'scale-[1.02]' : 'scale-100'}`}
            >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center relative border border-white/10">
                        <ShoppingCart size={22} className="text-white" />
                        <motion.span
                            key={cartCount}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-[#00E676] text-[#004D40] font-black rounded-full flex items-center justify-center text-xs shadow-md border-2 border-[#4E0797]"
                        >
                            {cartCount}
                        </motion.span>
                    </div>
                    <div className="text-left">
                        <span className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-0.5">Ver Carrinho</span>
                        <span className="block font-black text-lg">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm relative z-10 flex items-center gap-2 font-bold text-sm">
                    Finalizar <ChevronRight size={18} />
                </div>
            </button>
        </motion.div>
    );
};

// Storefront Container
export const ModernHomePage = () => {
    const { categories, products, settings, isStoreOpen } = useApp();

    // Memoize categorized products to avoid filtering on every render
    const categorizedProducts = useMemo(() => {
        return categories.map(cat => ({
            ...cat,
            products: products.filter(p => p.categoryId === cat.id && p.active !== false)
        })).filter(cat => cat.products.length > 0 && cat.active !== false);
    }, [categories, products]);

    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-32 font-outfit selection:bg-purple-200">
            <ModernHero />

            <div className="max-w-6xl mx-auto px-4 md:px-0">
                {/* Notice Alert */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-2xl p-4 mb-8 flex items-start gap-3 shadow-sm"
                >
                    <Info className="text-orange-500 shrink-0 mt-0.5" size={20} />
                    <div>
                        <span className="block font-bold text-gray-800 text-sm">Atenção ao horário</span>
                        <span className="block text-xs text-gray-600 mt-1 font-medium">Entregas somente até as {settings.deliveryCloseTime || '21:00'}hrs!</span>
                    </div>
                </motion.div>
 
                {/* Categories */}
                <div className="space-y-10">
                    {categorizedProducts.map((cat, catIdx) => (
                        <div key={cat.id} id={`cat-${cat.id}`}>
                            <h2 className="text-2xl font-black text-gray-900 mb-5 pl-2 flex items-center gap-3 tracking-tight">
                                <span className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 text-xl">{cat.icon}</span>
                                {cat.title}
                            </h2>
 
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {cat.products.map((product, idx) => (
                                    <ModernProductCard key={product.id} product={product} index={idx} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ModernFloatingCart />
        </div>
    );
};
