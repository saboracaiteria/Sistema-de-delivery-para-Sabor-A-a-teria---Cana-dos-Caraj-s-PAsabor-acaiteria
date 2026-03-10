import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePwaInstall } from './usePwaInstall';

export const PwaInstallPrompt = ({ variant = 'default' }: { variant?: 'default' | 'modern' }) => {
    const { isReadyToInstall, isIOS, isStandalone, handleInstallClick } = usePwaInstall();
    const [showIosModal, setShowIosModal] = useState(false);

    // Don't show if already installed or not ready
    if (isStandalone || !isReadyToInstall) {
        return null;
    }

    const onInstallClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const shouldShowIosInstructions = await handleInstallClick();
        if (shouldShowIosInstructions) {
            setShowIosModal(true);
        }
    };

    return (
        <>
            {/* The Install Button */}
            {variant === 'modern' ? (
                <button
                    onClick={onInstallClick}
                    className="absolute top-4 left-16 md:left-20 z-50 p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-900/40 active:scale-95 flex items-center gap-2 font-bold text-sm h-[42px] overflow-hidden group"
                >
                    <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer" />
                    <Download size={18} className="animate-bounce" />
                    <span className="hidden sm:inline">Instalar App</span>
                </button>
            ) : (
                <button
                    onClick={onInstallClick}
                    className="absolute top-3 left-12 md:top-4 md:left-14 z-50 px-3 py-1.5 md:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-white hover:opacity-90 transition-opacity shadow-lg flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold border border-white/20 ml-2"
                >
                    <Download size={16} className="md:w-[18px] md:h-[18px] animate-bounce" />
                    <span>Instalar App</span>
                </button>
            )}

            {/* iOS Instructions Modal */}
            <AnimatePresence>
                {showIosModal && (
                    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowIosModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.9 }}
                            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                            className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative z-10"
                        >
                            <div className="p-6">
                                <button
                                    onClick={() => setShowIosModal(false)}
                                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <Smartphone size={32} className="text-purple-600" />
                                </div>

                                <h3 className="text-2xl font-black text-center text-gray-900 mb-2">Instale o App no iOS</h3>
                                <p className="text-gray-500 text-center mb-8 text-sm leading-relaxed">
                                    Para instalar em seu iPhone ou iPad, siga os passos abaixo:
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                                            <Share size={20} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">Passo 1</p>
                                            <p className="text-gray-600 text-sm mt-0.5">Toque no ícone de <strong>Compartilhar</strong> na barra inferior do Safari.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                                            <PlusSquare size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">Passo 2</p>
                                            <p className="text-gray-600 text-sm mt-0.5">Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowIosModal(false)}
                                    className="w-full mt-8 bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                                >
                                    Entendi
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
