import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, ChevronRight, CheckCircle, ShieldCheck, Smartphone, Zap, Palette, LayoutTemplate } from 'lucide-react';

export const PlatformHome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Smartphone size={28} />,
      title: 'App PWA Nativo',
      desc: 'Seus clientes instalam seu cardápio como um app no celular, sem App Store.',
      gradient: 'from-purple-500 to-violet-700',
      glow: 'shadow-purple-900/40',
      action: null as null | (() => void),
      actionLabel: null as null | string,
    },
    {
      icon: <ShieldCheck size={28} />,
      title: 'Gestão Completa',
      desc: 'Painel intuitivo para produtos, estoques, cupons e histórico de vendas.',
      gradient: 'from-emerald-500 to-teal-700',
      glow: 'shadow-emerald-900/40',
      action: null,
      actionLabel: null,
    },
    {
      icon: <CheckCircle size={28} />,
      title: 'Impressão Térmica',
      desc: 'Suporte para impressoras Bluetooth POS, imprimindo comandas automaticamente.',
      gradient: 'from-orange-500 to-rose-600',
      glow: 'shadow-orange-900/40',
      action: null,
      actionLabel: null,
    },
  ];

  const goModern = () => {
    localStorage.setItem('preferredUI', 'modern');
    window.dispatchEvent(new CustomEvent('changeUIMode', { detail: 'modern' }));
    navigate('/sabor-acaiteria');
  };

  const goLegacy = () => {
    localStorage.setItem('preferredUI', 'legacy');
    window.dispatchEvent(new CustomEvent('changeUIMode', { detail: 'legacy' }));
    navigate('/sabor-acaiteria');
  };

  const demos = [
    {
      icon: <Palette size={28} />,
      title: 'Versão Moderna',
      desc: 'Design premium e limpo, focado no produto e na conversão.',
      gradient: 'from-pink-500 to-fuchsia-700',
      glow: 'shadow-pink-900/40',
      action: goModern,
      actionLabel: 'Ver Exemplo →',
    },
    {
      icon: <LayoutTemplate size={28} />,
      title: 'Versão Clássica',
      desc: 'O formato tradicional de lista com categorias e preços claros.',
      gradient: 'from-cyan-500 to-sky-700',
      glow: 'shadow-cyan-900/40',
      action: goLegacy,
      actionLabel: 'Ver Exemplo →',
    },
  ];

  const allCards = [...features, ...demos];

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
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 bg-purple-700/50 rounded-xl blur-md translate-y-1" />
            <div className="relative w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-700 rounded-xl flex items-center justify-center shadow-xl shadow-purple-900/50 border border-white/10">
              <Store size={22} className="text-white" />
            </div>
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Plataforma{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-400">
              Delivery
            </span>
          </span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 bg-white/5 backdrop-blur text-white/80 hover:text-white font-bold rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm"
        >
          Área do Lojista
        </button>
      </nav>

      {/* Hero */}
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-purple-700 rounded-full translate-y-1.5 blur-sm opacity-60 group-hover:opacity-80 transition-opacity" />
            <a
              href="https://api.whatsapp.com/send?phone=YOUR_SALES_NUMBER&text=Ol%C3%A1!%20Gostaria%20de%20assinar%20a%20plataforma%20de%20card%C3%A1pios."
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-10 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-full shadow-xl shadow-purple-900/50 hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2 text-lg border border-white/10"
            >
              Criar meu cardápio <ChevronRight size={20} />
            </a>
          </div>
        </motion.div>

        {/* Quem Somos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-20 w-full max-w-3xl relative group"
        >
          {/* 3D glow behind */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-violet-600/10 rounded-3xl translate-y-2 blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />

          <div className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-3xl p-8 text-left overflow-hidden hover:border-white/20 transition-all">
            {/* Left accent */}
            <div className="absolute left-0 top-8 bottom-8 w-[3px] bg-gradient-to-b from-purple-500 to-violet-700 rounded-full" />

            <div className="pl-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Quem Somos
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white leading-snug mb-4 tracking-tight">
                Uma empresa de{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-300">
                  Delivery Inteligente
                </span>{' '}
                focada em simplificar o delivery.
              </h2>

              <p className="text-white/50 leading-relaxed font-medium text-base">
                Somos uma empresa local, criada com o compromisso de empoderar pequenos negócios de alimentação. 
                Nossa missão é oferecer soluções de delivery <strong className="text-white/70">intuitivas, minimalistas e diretas ao ponto</strong> — 
                para que cada empreendedor possa vender mais, com menos esforço e sem complicação.
              </p>

              <div className="mt-5 flex items-center gap-2 text-white/30 text-xs font-bold">
                <span>📍</span>
                <span>Sua Localização — Brasil</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 mb-6 flex flex-col items-center gap-2"
        >
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Recursos &amp; Exemplos</p>
          <div className="h-px w-16 bg-white/10" />
        </motion.div>

        {/* All Cards Grid — features (3) + demos (2) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-5xl"
        >
          {/* Features row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {features.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-3xl translate-y-2 blur-md opacity-25 group-hover:opacity-45 transition-opacity`} />
                <div className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 p-7 rounded-3xl text-left hover:border-white/20 transition-all overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.gradient} opacity-70`} />
                  <div className={`w-[52px] h-[52px] bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-xl`}>
                    <div className="text-white">{card.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{card.title}</h3>
                  <p className="text-white/40 font-medium leading-relaxed text-sm">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Demos row — 2 cards centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:px-20">
            {demos.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={card.action ?? undefined}
                className="relative group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-3xl translate-y-2 blur-md opacity-30 group-hover:opacity-55 transition-opacity`} />
                <div className="relative bg-white/[0.05] backdrop-blur-md border border-white/10 p-7 rounded-3xl text-left hover:border-white/25 transition-all overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.gradient}`} />
                  <div className={`w-[52px] h-[52px] bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-xl`}>
                    <div className="text-white">{card.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{card.title}</h3>
                  <p className="text-white/40 font-medium leading-relaxed text-sm mb-4">{card.desc}</p>
                  {card.actionLabel && (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r ${card.gradient}`}>
                      {card.actionLabel}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-white/25 text-sm font-medium relative z-10">
        <p>© 2026 Plataforma de Delivery · Desenvolvido por @_nildoxz</p>
      </footer>
    </div>
  );
};
