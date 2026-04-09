import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, ChevronRight, CheckCircle, ShieldCheck, Smartphone, Zap, Palette, LayoutTemplate } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const PlatformHome = () => {
  const navigate = useNavigate();
  const { settings } = useApp();

  const salesWhatsApp = settings.whatsappNumber || '5594991234567'; // Fallback se não configurado
  const whatsappBaseUrl = `https://api.whatsapp.com/send?phone=${salesWhatsApp}&text=`;
  const defaultMessage = encodeURIComponent('Olá! Gostaria de criar meu cardápio digital.');

  const features = [
    {
      icon: <Smartphone size={28} />,
      title: 'App PWA Exclusivo',
      desc: 'Seu cardápio vira um aplicativo no celular do cliente. Sem taxas de App Store e ocupando pouquíssimo espaço.',
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
    // Redireciona para a loja padrão ou para a primeira loja ativa
    navigate('/demo');
  };

  const goLegacy = () => {
    localStorage.setItem('preferredUI', 'legacy');
    window.dispatchEvent(new CustomEvent('changeUIMode', { detail: 'legacy' }));
    navigate('/demo');
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
            Canaã{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-400">
              Delivery OS
            </span>
          </span>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="px-5 py-2.5 bg-white/5 backdrop-blur text-white/80 hover:text-white font-bold rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm"
        >
          Área do Lojista
        </button>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-10 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-purple-500/30 text-purple-300 font-semibold text-[10px] mb-4 backdrop-blur"
        >
          <Zap size={14} className="text-orange-400" />
          <span>A plataforma definitiva para delivery</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-3 max-w-4xl text-white"
        >
          Venda mais com o{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">
            Cardápio Digital
          </span>{' '}
          mais amado de Canaã.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-base text-white/50 max-w-lg mb-6 leading-relaxed font-medium"
        >
          Elimine falhas nos pedidos e organize seu delivery com a plataforma que automatiza seu WhatsApp e fideliza seus clientes com um design premium.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-purple-700 rounded-full translate-y-1 blur-sm opacity-60 group-hover:opacity-80 transition-opacity" />
            <a
              href={`${whatsappBaseUrl}${defaultMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-full shadow-xl shadow-purple-900/50 hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2 text-base border border-white/10"
            >
              Criar meu cardápio <ChevronRight size={18} />
            </a>
          </div>
        </motion.div>

        {/* Quem Somos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-8 w-full max-w-2xl relative group"
        >
          {/* 3D glow behind */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-violet-600/10 rounded-2xl translate-y-1.5 blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />

          <div className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left overflow-hidden hover:border-white/20 transition-all">
            {/* Left accent */}
            <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-purple-500 to-violet-700 rounded-full" />

            <div className="pl-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Quem Somos
              </div>

              <h2 className="text-base md:text-lg font-black text-white leading-snug mb-1.5 tracking-tight">
                Tecnologia de ponta com{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-300">
                  DNA Local
                </span>{' '}
                impulsionando Canaã.
              </h2>

              <p className="text-white/40 leading-relaxed font-medium text-[13px]">
                Nascemos para empoderar o empreendedor da nossa região. O <strong className="text-white/60">Canaã Delivery OS</strong> não é apenas um software, é o parceiro que você precisa para escalar suas vendas com ferramentas intuitivas e suporte que fala a sua língua.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 mb-4 flex flex-col items-center gap-2"
        >
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Recursos &amp; Exemplos</p>
          <div className="h-px w-10 bg-white/10" />
        </motion.div>

        {/* All Cards Grid — features (3) + demos (2) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-5xl"
        >
          {/* Features row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {features.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl translate-y-1 blur-md opacity-25 group-hover:opacity-45 transition-opacity`} />
                <div className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 p-4 rounded-xl text-left hover:border-white/20 transition-all overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${card.gradient} opacity-70`} />
                  <div className={`w-[36px] h-[36px] bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center mb-3 shadow-xl`}>
                    <div className="text-white scale-[0.7]">{card.icon}</div>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 tracking-tight">{card.title}</h3>
                  <p className="text-white/40 font-medium leading-relaxed text-[11px]">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Demos row — 2 cards centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:px-20 mb-8">
            {demos.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={card.action ?? undefined}
                className="relative group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl translate-y-1 blur-md opacity-30 group-hover:opacity-55 transition-opacity`} />
                <div className="relative bg-white/[0.05] backdrop-blur-md border border-white/10 p-4 rounded-xl text-left hover:border-white/25 transition-all overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${card.gradient}`} />
                  <div className={`w-[36px] h-[36px] bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center mb-3 shadow-xl`}>
                    <div className="text-white scale-[0.7]">{card.icon}</div>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 tracking-tight">{card.title}</h3>
                  <p className="text-white/40 font-medium leading-relaxed text-[11px] mb-2">{card.desc}</p>
                  {card.actionLabel && (
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold text-transparent bg-clip-text bg-gradient-to-r ${card.gradient}`}>
                      {card.actionLabel}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pricing Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="w-full"
          >
            <div className="flex flex-col items-center gap-1 mb-6">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Planos e Preços</p>
              <h2 className="text-xl md:text-3xl font-black text-white tracking-tight text-center">Escolha o plano <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">ideal para você.</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {[
                {
                  name: 'Essencial',
                  price: '0,00',
                  period: '7 e 15 dias grátis',
                  tag: 'OFERTA INICIAL',
                  features: ['Cardápio Digital PWA', 'Pedidos via WhatsApp', 'Até 50 produtos', 'Suporte Básico'],
                  gradient: 'from-gray-500 to-slate-700',
                  highlight: false,
                  delay: 0
                },
                {
                  name: 'Profissional',
                  price: '69,90',
                  period: '/ mês',
                  tag: 'VALOR PROMOCIONAL',
                  features: ['Tudo do Essencial', 'Gestão de Estoque', 'Cupons de Desconto', 'Impressão Automática', 'Suporte Prioritário'],
                  gradient: 'from-purple-500 to-violet-700',
                  highlight: true,
                  delay: 0.1
                },
                {
                  name: 'Elite Plus',
                  price: '129,90',
                  period: '/ mês',
                  tag: 'OFERTA LIMITADA',
                  features: ['Tudo do Profissional', 'Domínio Personalizado', 'Relatórios Avançados', 'Acesso Multi-usuário', 'Consultoria VIP'],
                  gradient: 'from-amber-400 to-orange-600',
                  highlight: false,
                  delay: 0.2
                }
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: plan.delay }}
                  className={`relative group ${plan.highlight ? 'scale-105 z-10' : ''}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} rounded-[1.25rem] translate-y-2 blur-xl opacity-20 transition-opacity`} />
                  <div className={`relative h-full bg-white/[0.04] backdrop-blur-xl border ${plan.highlight ? 'border-purple-500/50' : 'border-white/10'} p-5 rounded-[1.25rem] text-left hover:border-white/20 transition-all flex flex-col`}>
                    {plan.highlight && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg">
                        Mais Popular
                      </div>
                    )}
                    
                    <div className="mb-4">
                      {plan.tag && (
                        <motion.div
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/50 text-orange-400 text-[8px] font-black uppercase tracking-wider mb-2"
                        >
                          <Zap size={10} className="fill-orange-400" />
                          {plan.tag}
                        </motion.div>
                      )}
                      
                      <h3 className="text-lg font-bold text-white/50 mb-0.5 tracking-tight uppercase text-[9px]">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-gray-400 text-[10px] font-bold">R$</span>
                        <span className="text-2xl font-black text-white">{plan.price}</span>
                        <span className="text-white/30 text-[9px] font-medium ml-1">{plan.period}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6 flex-1">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center shrink-0 shadow-sm shadow-black/20`}>
                            <CheckCircle size={9} className="text-white" />
                          </div>
                          <span className="text-[11px] font-medium text-white/50">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <a 
                      href={`${whatsappBaseUrl}${encodeURIComponent(`Olá! Gostaria de assinar o plano ${plan.name} para o meu negócio.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-center ${
                      plan.highlight 
                        ? `bg-gradient-to-r ${plan.gradient} text-white shadow-xl shadow-purple-900/40 hover:-translate-y-0.5 active:translate-y-0` 
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}>
                      Começar Agora
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-white/25 text-sm font-medium relative z-10">
        <p>© 2026 Plataforma de Delivery · Canaã Delivery OS</p>
      </footer>
    </div>
  );
};
