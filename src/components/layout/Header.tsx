import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { ShareQRCode } from '../ui/ShareQRCode';
import { PwaInstallPrompt } from '../ui/PwaInstallPrompt';

export const Header: React.FC = () => {
    const { setSidebarOpen, searchTerm, setSearchTerm } = useApp();
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] p-3 md:p-4 flex flex-col pointer-events-none">
            <div className="flex items-center justify-between w-full">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="pointer-events-auto p-2.5 bg-white/80 backdrop-blur-lg border border-white/50 rounded-2xl text-slate-800 hover:bg-white transition-all shadow-sm active:scale-95 flex items-center justify-center"
                    aria-label="Abrir menu"
                >
                    <Menu strokeWidth={2.5} size={20} />
                </button>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <ShareQRCode variant="modern" />
                    
                    <div className="flex items-center gap-2 text-slate-800">
                        <AnimatePresence>
                            {isSearchVisible && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 220, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    className="relative overflow-hidden"
                                >
                                    <input
                                        type="text"
                                        autoFocus
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar..."
                                        className="w-full h-10 bg-white/80 backdrop-blur-lg border border-white/50 rounded-2xl px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all shadow-sm"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <button 
                            onClick={() => setIsSearchVisible(!isSearchVisible)}
                            className={`p-2.5 backdrop-blur-lg border border-white/50 rounded-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center ${isSearchVisible ? 'bg-purple-600 text-white' : 'bg-white/80 hover:bg-white'}`}
                        >
                            {isSearchVisible ? <X strokeWidth={2.5} size={20} /> : <Search strokeWidth={2.5} size={20} />}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="pointer-events-auto w-full max-w-sm self-center pointer-events-auto" style={{ marginTop: '0.5rem', pointerEvents: 'auto' }}>
                <PwaInstallPrompt variant="modern" />
            </div>
        </div>
    );
};
