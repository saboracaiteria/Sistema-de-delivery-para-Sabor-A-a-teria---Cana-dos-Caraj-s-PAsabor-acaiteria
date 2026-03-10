import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Share2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ShareQRCode = ({ variant = 'default' }: { variant?: 'default' | 'modern' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Default to the vercel URL for sharing, since localhost QR won't work for other devices
    const shareUrl = "https://sabor-acaiteria.vercel.app/";

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Sabor Açaíteria',
                    text: 'Faça seu pedido na Sabor Açaíteria!',
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            handleCopy();
        }
    };

    const triggerButton = variant === 'modern' ? (
        <button
            onClick={() => setIsOpen(true)}
            className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all shadow-lg active:scale-95 flex items-center justify-center"
            title="Compartilhar App"
        >
            <QrCode strokeWidth={2.5} size={22} className="text-white" />
        </button>
    ) : (
        <button
            onClick={() => setIsOpen(true)}
            className="p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors shadow-lg flex items-center justify-center"
            title="Compartilhar App"
        >
            <QrCode size={18} className="md:w-6 md:h-6 text-white" />
        </button>
    );

    return (
        <>
            {/* The small trigger button placed in the header */}
            {triggerButton}

            {/* The Expanded Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl p-6 shadow-2xl relative w-full max-w-[320px] mx-auto flex flex-col items-center text-center overflow-hidden"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 text-purple-600 mt-2">
                                <Share2 size={32} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-1">Compartilhar App</h3>
                            <p className="text-sm text-gray-500 mb-6 px-2">Mostre este código para seus amigos escanearem ou envie o link.</p>

                            <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100 mb-6">
                                <QRCodeSVG
                                    value={shareUrl}
                                    size={180}
                                    bgColor={"#ffffff"}
                                    fgColor={"#4E0797"}
                                    level={"Q"}
                                    includeMargin={false}
                                />
                            </div>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={handleCopy}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                    {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-md"
                                >
                                    <Share2 size={18} />
                                    Enviar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
