import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, Lock as LockIcon, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useApp } from '../contexts/AppContext';
import { SUPER_ADMIN_PASSWORD } from '../constants';

export const Sidebar = () => {
  const { isSidebarOpen, setSidebarOpen, store, categories, setAdminRole } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [accessLoading, setAccessLoading] = useState(false);

  const handleAdminAccess = async () => {
    if (!password) return;

    setAccessLoading(true);
    try {
      // 1. Fetch latest store data to avoid stale password issues
      const { data: latestStore, error: fetchError } = await supabase
        .from('stores')
        .select('password, slug')
        .eq('slug', store?.slug)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar senha mais recente:", fetchError);
      }

      const currentStorePassword = latestStore?.password || store?.password;

      // 2. Check Super Admin Password
      if (password === SUPER_ADMIN_PASSWORD) {
        setAdminRole('superadmin');
        navigate(store?.slug ? `/${store.slug}/panel` : '/platform');
        setShowPassword(false);
        setSidebarOpen(false);
        setPassword('');
        return;
      }

      // 3. Check Store-specific Password (using latest from DB)
      if (currentStorePassword && password === currentStorePassword) {
        setAdminRole('admin');
        navigate(`/${store?.slug}/panel`);
        setShowPassword(false);
        setSidebarOpen(false);
        setPassword('');
        return;
      }

      alert('Senha incorreta!');
    } catch (err) {
      console.error("Erro no acesso administrativo:", err);
      alert("Ocorreu um erro ao verificar o acesso.");
    } finally {
      setAccessLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[75vw] sm:w-[320px] bg-white shadow-2xl z-[70] rounded-r-3xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div
              className="p-6 text-white font-bold text-xl flex justify-between items-center"
              style={{
                backgroundColor: 'var(--color-header-bg, #4E0797)',
                color: 'var(--color-header-text, #ffffff)'
              }}
            >
              <span className="tracking-wide">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X style={{ color: 'var(--color-header-text, #ffffff)' }} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <button
                onClick={() => { navigate(`/${store?.slug || ''}`); setSidebarOpen(false); }}
                className="w-full text-left px-4 py-3.5 hover:bg-purple-50 text-gray-700 font-medium rounded-xl transition-all flex items-center gap-3"
              >
                <span className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg">
                  <Menu size={18} />
                </span>
                Início
              </button>

              <div className="border-t border-gray-100 my-2 mx-4" />

              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Categorias
              </div>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    navigate(`/${store?.slug || ''}`);
                    setTimeout(() => document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' }), 100);
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-600 rounded-xl transition-all flex items-center gap-3 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="font-medium">{cat.title}</span>
                </button>
              ))}
            </div>

            {/* Footer / Admin Access */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowPassword(true)}
                className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-purple-300 text-gray-500 hover:text-purple-600 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <LockIcon size={18} />
                <span className="text-sm font-medium">Área Administrativa</span>
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* Password Modal (kept as is, but could be animated too) */}
      {showPassword && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Acesso Restrito</h3>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 text-center text-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold tracking-widest"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPassword(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdminAccess}
                disabled={accessLoading}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
              >
                {accessLoading ? <Loader2 size={18} className="animate-spin" /> : 'Entrar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
