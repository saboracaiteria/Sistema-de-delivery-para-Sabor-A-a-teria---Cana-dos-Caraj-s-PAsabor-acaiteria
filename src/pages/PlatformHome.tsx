import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, ChevronRight, CheckCircle, ShieldCheck, Smartphone, Zap, Palette, LayoutTemplate, ArrowRight, ExternalLink } from 'lucide-react';

export const PlatformHome = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);

  const features = [
    { icon: <Smartphone size={16} />, title: 'PWA APP', desc: 'Instalação nativa.' },
    { icon: <ShieldCheck size={16} />, title: 'CORE LOGIC', desc: 'Gestão 360º.' },
    { icon: <CheckCircle size={16} />, title: 'POS SYNC', desc: 'Impressão direta.' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* Background Kinetic - Compacted */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center select-none overflow-hidden">
        <motion.span style={{ y: y1 }} className="text-[15vw] font-black leading-none whitespace-nowrap">DELIVERY.OS</motion.span>
      </div>

      {/* Navigation - Ultra Slim */}
      <nav className="relative z-50 max-w-[1400px] mx-auto px-8 py-6 flex items-center justify-between border-b border-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 flex items-center justify-center border border-white/10">
            <Store size={16} className="text-white" />
          </div>
          <span className="text-sm font-black tracking-tighter text-white">CANAÃ <span className="text-orange-500 opacity-70">OS</span></span>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-1.5 border border-white/20 text-[10px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all"
        >
          Lojista
        </button>
      </nav>

      <main className="relative z-10 max-w-[1400px] mx-auto px-8 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Hero Content - Packed */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 bg-orange-500" />
              <span className="text-[9px] font-black tracking-[0.3em] uppercase text-white/30">Next-Gen POS Infrastructure</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase text-white">
              Digital <br /> 
              <span className="text-orange-600">Menu</span> <br />
              <span className="text-stroke">Evolution</span>
            </h1>

            <p className="text-md text-white/40 max-w-md mb-10 font-medium leading-relaxed">
              Sistema de alta performance para delivery que foge do óbvio. 
              Minimalismo técnico, conversão máxima.
            </p>

            <div className="flex gap-4 mb-20">
              <button className="bg-white text-black px-8 py-4 font-black text-[12px] uppercase tracking-wider hover:bg-orange-500 hover:text-white transition-colors flex items-center gap-2 group">
                Assinar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate('/demo')} className="border border-white/10 px-8 py-4 font-black text-[12px] uppercase tracking-wider hover:border-white transition-colors text-white">
                Demos
              </button>
            </div>

            {/* Compact Features Grid */}
            <div className="grid grid-cols-3 gap-1 border-t border-white/5 pt-12">
              {features.map((f, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="text-orange-500">{f.icon}</div>
                  <span className="text-[10px] font-black uppercase text-white">{f.title}</span>
                  <span className="text-[10px] text-white/30 leading-tight">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demos Side Panel - Consolidated */}
          <div className="lg:col-span-5 h-full flex flex-col gap-1">
            <div className="group relative cursor-pointer" onClick={() => {localStorage.setItem('preferredUI', 'modern'); navigate('/demo');}}>
              <div className="p-8 border border-white/10 bg-white/[0.02] hover:border-orange-500/50 transition-all flex flex-col gap-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-[80px] font-black translate-x-4 -translate-y-4">01</div>
                <h3 className="text-xl font-black uppercase text-white tracking-widest group-hover:text-orange-500 transition-colors">Modern UI</h3>
                <p className="text-xs text-white/30 max-w-[200px]">Design focado em produto e alta conversão mobile.</p>
                <div className="text-[9px] font-black tracking-widest text-orange-500 uppercase flex items-center gap-2">Explorar <ExternalLink size={10} /></div>
              </div>
            </div>

            <div className="group relative cursor-pointer" onClick={() => {localStorage.setItem('preferredUI', 'legacy'); navigate('/demo');}}>
              <div className="p-8 border border-white/10 bg-white/[0.02] hover:border-orange-500/50 transition-all flex flex-col gap-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-[80px] font-black translate-x-4 -translate-y-4">02</div>
                <h3 className="text-xl font-black uppercase text-white tracking-widest group-hover:text-orange-500 transition-colors">Legacy Stack</h3>
                <p className="text-xs text-white/30 max-w-[200px]">A estrutura clássica com usabilidade comprovada.</p>
                <div className="text-[9px] font-black tracking-widest text-orange-500 uppercase flex items-center gap-2">Explorar <ExternalLink size={10} /></div>
              </div>
            </div>

            {/* Quick Stats Banner - Dense */}
            <div className="mt-auto p-6 bg-orange-600/10 border border-orange-500/20 flex justify-between items-center">
              <div>
                <div className="text-2xl font-black text-white">99.9%</div>
                <div className="text-[8px] font-bold text-orange-500 tracking-widest uppercase italic">Infrastructure Uptime</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">100+</div>
                <div className="text-[8px] font-bold text-orange-500 tracking-widest uppercase italic">Daily Deployments</div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer - Minimalist Line */}
      <footer className="footer-border max-w-[1400px] mx-auto px-8 py-8 flex justify-between items-center text-white/20 text-[9px] uppercase tracking-[0.3em] font-bold">
        <span>© 2026 INFRASTRUCTURE UNIT</span>
        <div className="flex gap-8">
          <button onClick={() => navigate('/platform')} className="hover:text-white transition-opacity">System</button>
          <span>Brazil/Canaã</span>
        </div>
      </footer>

      <style>{`
        .text-stroke {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.15);
          color: transparent;
        }
      `}</style>
    </div>
  );
};
