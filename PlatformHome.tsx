import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, ChevronRight, ChevronDown, CheckCircle, ShieldCheck, Smartphone, Zap, Palette, LayoutTemplate } from 'lucide-react';

export const PlatformHome = () => {
  const navigate = useNavigate();
  const [showDemoOptions, setShowDemoOptions] = useState(false);

  const features = [
    {
      icon: <Smartphone size={28} />,
      title: "App PWA Nativo",
      desc: "Seus clientes instalam seu cardápio como um app no celular, sem App Store.",
      gradient: "from-purple-500 to-violet-700",
      glow: "shadow-purple-900/40",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Gestão Completa",
      desc: "Painel intuitivo para produtos, estoques, cupons e histórico de vendas.",
      gradient: "from-emerald-500 to-teal-700",
      glow: "shadow-emerald-900/40",
    },
    {
      icon: <CheckCircle size={28} />,
      title: "Impressão Térmica",
      desc: "Suporte para impressoras Bluetooth POS, imprimindo comandas automaticamente.",
      gradient: "from-orange-500 to-rose-600",
      glow: "shadow-orange-900/40",
    },
  ];

  return (
    <div
      className="min-h-screen font-outfit overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #0a0118 0%, #130a2e 50%, #1a0a3e 100%)' }}
    >
      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-700/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 3D-style logo box */}
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 bg-purple-700/50 rounded-xl blur-md translate-y-1" />
            <div className="relative w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-700 rounded-xl flex items-center justify-center shadow-xl shadow-purple-900/50 border border-white/10">
              <Store size={22} className="text-white" />
            </div>
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Canaã <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-400">Delivery</span>
          </span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 bg-white/5 backdrop-blur text-white/80 hover:text-white font-bold rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm"
        >
          Área do Lojista
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-purple-500/30 text-purple-300 font-semibold text-sm mb-8 backdrop-blur"
        >
          <Zap size={15} className="text-orange-400" />
          <span>A plataforma definitiva para delivery</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6 max-w-4xl text-white"
        >
          Tenha seu próprio{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">
            cardápio digital
          </span>{' '}
          em minutos.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed font-medium"
        >
          Crie sua loja, adicione produtos, personalize cores e receba pedidos diretamente no WhatsApp ou no Painel Administrativo.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          {/* Primary CTA - 3D style */}
          <div className="relative w-full sm:w-auto group">
            <div className="absolute inset-0 bg-purple-700 rounded-full translate-y-1.5 blur-sm opacity-60 group-hover:opacity-80 transition-opacity" />
            <a
              href="https://api.whatsapp.com/send?phone=YOUR_SALES_NUMBER&text=Ol%C3%A1!%20Gostaria%20de%20assinar%20a%20plataforma%20de%20card%C3%A1pios."
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-full shadow-xl shadow-purple-900/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 text-lg border border-white/10"
            >
              Criar meu cardápio <ChevronRight size={20} />
            </a>
          </div>

          {/* Demo Dropdown */}
          <div className="relative flex flex-col items-center sm:items-start w-full sm:w-auto">
            <button
              onClick={() => setShowDemoOptions(!showDemoOptions)}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 backdrop-blur text-white/80 hover:text-white font-bold rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-lg"
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
                  className="absolute top-full mt-3 w-full min-w-[260px] bg-[#1a0a3e]/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-900/50 border border-white/10 overflow-hidden z-20 flex flex-col text-left left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0"
                >
                  <button
                    onClick={() => {
                      localStorage.setItem('preferredUI', 'modern');
                      window.dispatchEvent(new CustomEvent('changeUIMode', { detail: 'modern' }));
                      navigate('/sabor-acaiteria');
                    }}
                    className="w-full px-5 py-4 flex items-center gap-3 hover:bg-purple-500/10 transition-colors border-b border-white/5 text-white"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/30">
                      <Palette size={18} className="text-white" />
                    </div>
                    <div>
                      <span className="block font-bold text-white">Versão Moderna</span>
                      <span className="block text-xs text-white/40 font-medium mt-0.5">Design limpo e focado no produto</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('preferredUI', 'legacy');
                      window.dispatchEvent(new CustomEvent('changeUIMode', { detail: 'legacy' }));
                      navigate('/sabor-acaiteria');
                    }}
                    className="w-full px-5 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-white"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <LayoutTemplate size={18} className="text-white/70" />
                    </div>
                    <div>
                      <span className="block font-bold text-white">Versão Clássica</span>
                      <span className="block text-xs text-white/40 font-medium mt-0.5">O formato tradicional de lista</span>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Feature Cards — 3D soft style */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="relative group"
            >
              {/* 3D shadow layer */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl translate-y-2 blur-md opacity-30 group-hover:opacity-50 transition-opacity`} />
              
              {/* Card body */}
              <div className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 p-7 rounded-3xl text-left hover:border-white/20 transition-all overflow-hidden">
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feature.gradient} opacity-70`} />

                <div className={`w-13 h-13 w-[52px] h-[52px] bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-xl ${feature.glow} shadow-lg`}>
                  <div className="text-white">{feature.icon}</div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-white/40 font-medium leading-relaxed text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-white/25 text-sm font-medium relative z-10">
        <p>© 2026 Canaã Delivery Plataforma · Desenvolvido por @_nildoxz</p>
      </footer>
    </div>
  );
};
