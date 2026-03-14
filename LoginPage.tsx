import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Lock, Mail, AlertCircle, ArrowRight, Store } from 'lucide-react';
import { useApp } from './App';
import { SUPER_ADMIN_EMAILS, SUPER_ADMIN_PASSWORD } from './constants';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAdminRole, settings } = useApp(); // Assume useApp is exported from App.tsx or use a simpler context if needed

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Check Super Admin locally first
      if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase()) && password === SUPER_ADMIN_PASSWORD) {
        // Also try to sign in via Supabase silently for API access
        try {
          await supabase.auth.signInWithPassword({ email, password });
        } catch (_) {
          // Ignore Supabase auth errors for super admin — local auth is enough
        }
        setAdminRole('superadmin');
        navigate('/platform');
        return;
      }

      // 2. Regular store owner — authenticate via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Find if this user owns a store
        const { data: storesData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', data.user.id);
          
        if (storeError) {
             console.error("Error finding store:", storeError);
        }

        setAdminRole('admin');
        const lastSlug = localStorage.getItem('currentStoreSlug') || 'sabor-acaiteria';
        navigate(`/${lastSlug}/panel`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-300/30 blur-3xl"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-orange-300/20 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 z-10 relative"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-200 rotate-3 cursor-pointer hover:rotate-6 transition-transform">
            <Store size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 font-outfit text-center">
            Portal Canaã Delivery
          </h1>
          <p className="text-gray-500 text-center mt-2 font-medium">
            Acesso para Lojistas e Administração
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3 border border-red-100"
          >
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium text-gray-800"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium text-gray-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar no Painel <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
             <p className="text-sm text-gray-500">Desenvolvido por @_nildoxz</p>
        </div>
      </motion.div>
    </div>
  );
};
