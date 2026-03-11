import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, ChevronRight, ChevronDown, CheckCircle, ShieldCheck, Smartphone, Zap, Palette, LayoutTemplate } from 'lucide-react';

export const PlatformHome = () => {
  const navigate = useNavigate();
  const [showDemoOptions, setShowDemoOptions] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-outfit text-gray-800 overflow-hidden relative">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-orange-200/30 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
            <Store size={22} className="text-white" />
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-orange-600 tracking-tight">
            Canaã Delivery
          </span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 bg-white text-purple-700 font-bold rounded-full shadow-sm border border-purple-100 hover:shadow-md hover:border-purple-200 transition-all text-sm flex items-center gap-2"
        >
          Área do Lojista
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 font-semibold text-sm mb-6"
        >
          <Zap size={16} className="text-orange-500" />
          <span>A plataforma definitiva para delivery</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 max-w-4xl"
        >
          Tenha seu próprio <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">cardápio digital</span> em minutos.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed font-medium"
        >
          Crie sua loja, adicione produtos, personalize cores e receba pedidos diretamente no seu WhatsApp ou Painel Administrativo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <a
            href="https://api.whatsapp.com/send?phone=YOUR_SALES_NUMBER&text=Ol%C3%A1!%20Gostaria%20de%20assinar%20a%20plataforma%20de%20card%C3%A1pios."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-full shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg"
          >
            Criar meu cardápio <ChevronRight size={20} />
          </a>
          <div className="relative flex flex-col items-center sm:items-start w-full sm:w-auto">
            <button
              onClick={() => setShowDemoOptions(!showDemoOptions)}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 font-bold rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 text-lg"
            >
              Ver Loja de Exemplo <ChevronDown size={20} className={`transition-transform duration-300 ${showDemoOptions ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDemoOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-3 w-full min-w-[240px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 flex flex-col text-left left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0"
                >
                  <button
                    onClick={() => {
                      localStorage.setItem('preferredUI', 'modern');
                      window.dispatchEvent(new CustomEvent('changeUIMode', { detail: 'modern' }));
                      navigate('/sabor-acaiteria');
                    }}
                    className="w-full px-5 py-4 flex items-center gap-3 hover:bg-purple-50 transition-colors border-b border-gray-50 text-gray-800"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <Palette size={18} />
                    </div>
                    <div>
                      <span className="block font-bold">Versão Moderna</span>
                      <span className="block text-xs text-gray-500 font-medium mt-0.5">Design limpo e focado no produto</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('preferredUI', 'legacy');
                      window.dispatchEvent(new CustomEvent('changeUIMode', { detail: 'legacy' }));
                      navigate('/sabor-acaiteria');
                    }}
                    className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-800"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                      <LayoutTemplate size={18} />
                    </div>
                    <div>
                      <span className="block font-bold">Versão Clássica</span>
                      <span className="block text-xs text-gray-500 font-medium mt-0.5">O formato tradicional de lista</span>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
        >
          {[
            { icon: <Smartphone size={32} />, title: "App PWA Nativo", desc: "Seus clientes podem instalar seu cardápio como um app no celular, sem precisar da App Store." },
            { icon: <ShieldCheck size={32} />, title: "Gestão Completa", desc: "Painel administrativo intuitivo para gerenciar produtos, estoques, cupons e histórico de vendas." },
            { icon: <CheckCircle size={32} />, title: "Impressão Térmica", desc: "Suporte integrado para impressoras Bluetooth POS, imprimindo comandas de forma automática." }
          ].map((feature, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-md border border-gray-100 p-8 rounded-3xl text-left shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-md py-8 text-center text-gray-500 text-sm font-medium relative z-10">
        <p>© 2026 Canaã Delivery Plataforma. Desenvolvido por @_nildoxz</p>
      </footer>
    </div>
  );
};
