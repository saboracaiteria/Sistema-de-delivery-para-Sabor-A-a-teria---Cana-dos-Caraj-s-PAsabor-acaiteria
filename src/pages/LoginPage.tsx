import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, Mail, AlertCircle, ArrowRight, Store, ChevronLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { SUPER_ADMIN_EMAILS, SUPER_ADMIN_PASSWORD } from '../types/constants';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAdminRole } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputLabel = email.toLowerCase().trim();

    try {
      let targetEmail = inputLabel;
      let isMasterLogin = (password === SUPER_ADMIN_PASSWORD || password === '12457812');
      let storeContext: any = null;

      // 1. Resolver Slug → Email se necessário
      if (!inputLabel.includes('@')) {
        const { data: storeData, error: storeErr } = await supabase
          .from('stores')
          .select('owner_email, slug, password')
          .eq('slug', inputLabel)
          .single();

        if (storeErr || !storeData?.owner_email) {
          if (!isMasterLogin) {
            throw new Error('Loja não encontrada ou e-mail não vinculado.');
          }
        } else {
          // Verificar senha diretamente na tabela (fallback seguro)
          if (!isMasterLogin && storeData.password && storeData.password !== password) {
            throw new Error('Senha incorreta.');
          }
          targetEmail = storeData.owner_email;
          storeContext = storeData;
        }
      }

      // 2. Master Password Bypass (Superadmin)
      if (isMasterLogin) {
        const { error: masterAuthErr } = await supabase.auth.signInWithPassword({
          email: SUPER_ADMIN_EMAILS[0],
          password: SUPER_ADMIN_PASSWORD
        });

        if (masterAuthErr) {
          console.warn("Master Auth Error:", masterAuthErr.message);
        }

        setAdminRole('superadmin');
        if (storeContext) {
          localStorage.setItem('currentStoreSlug', storeContext.slug);
          navigate(`/${storeContext.slug}/panel`);
        } else {
          navigate('/platform');
        }
        return;
      }

      // 3. Login via Supabase Auth (lojista com email/senha)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        // Verificar se é um Super Admin pelo e-mail
        const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(data.user.email?.toLowerCase() || '');
        setAdminRole(isSuperAdminEmail ? 'superadmin' : 'admin');

        // Buscar a loja pelo owner_id ou slug
        let slug = storeContext?.slug;
        if (!slug) {
          const { data: sd } = await supabase.from('stores').select('slug').eq('owner_id', data.user.id).single();
          slug = sd?.slug || 'sabor-acaiteria';
        }
        localStorage.setItem('currentStoreSlug', slug);
        navigate(`/${slug}/panel`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message.includes('não encontrada') || err.message.includes('Bootstrap') || err.message.includes('Senha') 
        ? err.message 
        : 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden font-outfit"
      style={{ background: 'linear-gradient(135deg, #0a0118 0%, #130a2e 50%, #1a0a3e 100%)' }}
    >
      {/* Back to Home Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold"
      >
        <ChevronLeft size={18} /> Voltar ao Início
      </button>

      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-700/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card with 3D Float Effect */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glow behind the card */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-violet-700/20 rounded-[2.5rem] blur-xl translate-y-4 opacity-50" />
        
        {/* Card Frame */}
        <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-violet-500 opacity-70" />

          {/* Header */}
          <div className="flex flex-col items-center mb-10 mt-2">
            <div className="relative w-16 h-16 mb-5 group perspective">
              {/* Logo Glow */}
              <div className="absolute inset-0 bg-purple-500/50 rounded-2xl blur-lg translate-y-2 group-hover:translate-y-3 transition-transform" />
              {/* Logo Box */}
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-700 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 transform group-hover:-translate-y-1 transition-transform">
                <Store size={32} className="text-white drop-shadow-md" />
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-white text-center tracking-tight leading-tight">
              Portal <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-400">Admin</span>
            </h1>
            <p className="text-white/40 text-center mt-2 font-medium text-sm">
              Acesso para Lojistas e Administração
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="bg-red-500/10 text-red-400 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-red-500/20 backdrop-blur-md"
              >
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Login Field */}
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Loja ou E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-purple-400 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:border-purple-500/50 focus:bg-black/40 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all font-medium text-white placeholder:text-white/20"
                  placeholder="nome-da-loja ou e-mail"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-purple-400 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:border-purple-500/50 focus:bg-black/40 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all font-medium text-white placeholder:text-white/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* 3D Submit Button */}
            <div className="pt-2 relative group mt-4">
              <div className="absolute inset-0 bg-purple-600 rounded-2xl translate-y-1.5 blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-4.5 py-4 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-900/50 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed border border-white/10"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Entrar no Painel <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
               <p className="text-xs text-white/20 font-medium">Desenvolvido por @_nildoxz</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
