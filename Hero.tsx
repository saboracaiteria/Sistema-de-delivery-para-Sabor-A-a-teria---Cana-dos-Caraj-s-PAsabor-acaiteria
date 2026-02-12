
import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Menu } from 'lucide-react';
import { useApp } from './App';

export const Hero = () => {
    const { settings, isStoreOpen, setSidebarOpen } = useApp();

    return (
        <div className="relative w-full h-[400px] overflow-hidden rounded-b-[2.5rem] shadow-2xl mb-8">
            {/* Menu Button - Absolute Top Left */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="absolute top-4 left-4 z-50 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors shadow-lg"
            >
                <Menu size={24} />
            </button>

            {/* Background Image with Parallax-like scale */}
            <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                className="absolute inset-0 z-0"
            >
                <img
                    src={settings.bannerUrl || "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=2670&auto=format&fit=crop"}
                    className="w-full h-full object-cover"
                    alt="Banner"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4E0797] via-[#4E0797]/40 to-transparent opacity-60" />
            </motion.div>

            {/* Content Container - Glassmorphism */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-6 text-center">

                {/* Logo and Status */}
                <div className="mb-6 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <img
                            src={settings.logoUrl || "https://img.logoipsum.com/296.svg"}
                            className={`w-28 h-28 object-cover border-4 border-white/20 shadow-xl ${settings.logoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}
                            alt="Logo"
                        />

                        {/* Status Badge with Pulse */}
                        <motion.div
                            className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold border-2 border-white shadow-lg flex items-center gap-1 ${isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <span className={`w-2 h-2 rounded-full bg-white ${isStoreOpen ? 'animate-pulse' : ''}`} />
                            {isStoreOpen ? 'ABERTO' : 'FECHADO'}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Store Name & Info */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold mb-2 tracking-tight"
                >
                    {settings.storeName}
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-4 text-sm text-white/80 mb-6"
                >
                    <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                        <Clock size={14} className="text-cyan-400" /> {settings.deliveryTime || '30-45 min'}
                    </span>
                    <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                        <MapPin size={14} className="text-cyan-400" /> Entrega: R$ {settings.deliveryFee?.toFixed(2)}
                    </span>
                </motion.div>

                {/* Search Bar - Modern & Floating */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="w-full max-w-md relative group"
                >
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="O que você deseja pedir hoje?"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 text-gray-800 placeholder-gray-400 shadow-xl focus:ring-4 focus:ring-purple-500/30 focus:outline-none transition-all transform group-hover:scale-[1.02]"
                    />
                </motion.div>

            </div>
        </div>
    );
};
