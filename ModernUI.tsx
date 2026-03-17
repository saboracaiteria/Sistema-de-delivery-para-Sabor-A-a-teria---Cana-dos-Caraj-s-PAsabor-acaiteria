import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, Info, Plus, Settings as SettingsIcon, Search, ChevronLeft, ChevronRight, X, Minus, Sparkles, AlertCircle } from 'lucide-react';
import { useApp, ProductModal } from './App';
import { Product, ProductGroup } from './types';
import { PwaInstallPrompt } from './PwaInstallPrompt';
import { ShareQRCode } from './ShareQRCode';


// Modern Hero Component
export const ModernHero = () => {
    const { settings, isStoreOpen, setSidebarOpen } = useApp();

    return (
        <div className="relative w-full h-[280px] md:h-[450px] overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-[0_20px_40px_-15px_rgba(78,7,151,0.3)] mb-6 md:mb-10 group">
            <button
                onClick={() => setSidebarOpen(true)}
                className="absolute top-4 left-4 z-50 p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all shadow-lg active:scale-95 flex items-center justify-center"
            >
                <Menu strokeWidth={2.5} size={22} />
            </button>
            <PwaInstallPrompt variant="modern" />

            {/* Premium Header Button */}
            <div className="absolute top-4 right-4 z-[55] flex items-center gap-2">
                <ShareQRCode variant="modern" />
                <button className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all shadow-lg active:scale-95">
                    <Search strokeWidth={2.5} size={22} />
                </button>
            </div>

            {/* Image with subtle zoom effect */}
            <motion.div
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                className="absolute inset-0 z-0 bg-[#4E0797]"
            >
                <img
                    src={settings.bannerUrl || "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=2670&auto=format&fit=crop"}
                    className="w-full h-full object-cover mix-blend-overlay opacity-80"
                    alt="Banner"
                />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#110122]/90 via-[#4E0797]/40 to-transparent z-10" />

            <div className="relative z-20 h-full flex flex-col items-center justify-end text-white px-4 md:px-6 text-center pb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative mb-4 group cursor-pointer"
                >
                    <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img
                        src={settings.logoUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='50' fill='%234E0797'/%3E%3Ctext x='50' y='67' font-size='50' text-anchor='middle' fill='white' font-family='sans-serif'%3E🏪%3C/text%3E%3C/svg%3E"}
                        className={`w-24 h-24 md:w-32 md:h-32 object-cover border-4 border-white shadow-2xl relative z-10 ${settings.logoShape === 'circle' ? 'rounded-full' : 'rounded-[2rem]'}`}
                        alt="Logo"
                    />

                    {/* Highly visible Status Badge */}
                    <motion.div
                        className={`absolute -bottom-2 -right-2 px-3 py-1.5 rounded-full text-xs font-black tracking-wider border-[3px] border-[#110122] shadow-xl flex items-center gap-1.5 z-20 ${isStoreOpen ? 'bg-[#00E676] text-[#004D40]' : 'bg-[#FF1744] text-white'}`}
                        animate={isStoreOpen ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0px rgba(0,230,118,0)", "0 0 15px rgba(0,230,118,0.5)", "0 0 0px rgba(0,230,118,0)"] } : {}}
                        transition={isStoreOpen ? { duration: 2, repeat: Infinity } : {}}
                    >
                        {isStoreOpen ? 'ABERTO' : 'FECHADO'}
                    </motion.div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-5xl font-black mb-2 tracking-tight drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-100"
                >
                    {settings.storeName}
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-3 text-sm font-medium text-white/90"
                >
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                        {settings.deliveryTime || '30-45 min'}
                    </div>
                </motion.div>
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
                className="bg-white rounded-[1.5rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(78,7,151,0.08)] transition-all duration-300 cursor-pointer border border-gray-100 flex gap-4 overflow-hidden relative group"
            >
                {/* Decorative glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] blur-xl" />

                <div className="relative w-28 h-28 shrink-0 rounded-[1rem] overflow-hidden bg-gray-50 shadow-inner">
                    <motion.img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                    />
                </div>

                <div className="flex flex-col justify-between flex-1 py-1 relative z-10">
                    <div>
                        <h3 className="font-extrabold text-gray-800 tracking-tight text-base leading-tight mb-1">{product.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">{product.description}</p>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">A partir de</span>
                            <span className="font-black text-purple-700 text-lg leading-none">R$ {product.price.toFixed(2)}</span>
                        </div>

                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-sm ${hasOptions ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-100' : 'bg-[#4E0797] text-white group-hover:bg-[#3d0577] shadow-[0_4px_10px_rgba(78,7,151,0.3)]'}`}>
                            {hasOptions ? <Plus strokeWidth={3} size={18} /> : <ShoppingCart strokeWidth={2.5} size={16} />}
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

            <div className="max-w-2xl mx-auto px-4 md:px-0">
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
