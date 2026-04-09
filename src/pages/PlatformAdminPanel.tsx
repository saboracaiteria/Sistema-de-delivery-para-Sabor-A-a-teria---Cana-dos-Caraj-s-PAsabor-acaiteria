import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Store, LogOut, ChevronRight, Activity, Copy, CheckCircle, Plus, X, Palette, LayoutTemplate, Loader2, Trash2, AlertTriangle, Lock, Pencil, Save, Coffee, Box, Eye, EyeOff, Clock, Calendar, Smartphone } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { Store as StoreType } from '../types/types';
import { SUPER_ADMIN_PASSWORD } from '../types/constants';
import { applyAcaiteriaTemplate } from '../storeTemplateUtils';
import { cloneStoreData } from '../utils/cloneStoreUtils';

export const PlatformAdminPanel = () => {
  const { adminRole, setAdminRole } = useApp();
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPasswordStoreId, setEditingPasswordStoreId] = useState<string | null>(null);
  const [editingWhatsappValue, setEditingWhatsappValue] = useState('');
  const [isEditingGlobalWhatsapp, setIsEditingGlobalWhatsapp] = useState(false);
  const [globalWhatsapp, setGlobalWhatsapp] = useState('');
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [renewingStore, setRenewingStore] = useState<StoreType | null>(null);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [storeToClone, setStoreToClone] = useState<StoreType | null>(null);
  const [isEditingName, setIsEditingName] = useState<string | null>(null);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const toggleSecret = (id: string) => {
    setVisibleSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*, settings(store_status, whatsapp_number)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setStores(data);

      // Fetch global platform settings
      const { data: globalData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'landing_page_whatsapp')
        .single();
      
      if (globalData) {
        setGlobalWhatsapp(globalData.value || '');
        setEditingWhatsappValue(globalData.value || '');
      }
    } catch (err) {
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminRole !== 'superadmin') {
      navigate('/login');
      return;
    }
    fetchStores();
  }, [adminRole, navigate]);

  const handleCopyLink = (slug: string) => {
    const link = `${window.location.origin}/#/${slug}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  };

  const handleStoreCreated = () => {
    setShowCreateModal(false);
    fetchStores();
  };

  const [deleteTarget, setDeleteTarget] = useState<StoreType | null>(null);

  const handleDeleteStore = async (store: StoreType) => {
    try {
      // Delete related data first (foreign key constraints)
      await supabase.from('orders').delete().eq('store_id', store.id);
      await supabase.from('product_group_relations').delete().in('product_id', 
        (await supabase.from('products').select('id').eq('store_id', store.id)).data?.map(p => p.id) || []
      );
      await supabase.from('product_options').delete().eq('store_id', store.id);
      await supabase.from('product_groups').delete().eq('store_id', store.id);
      await supabase.from('products').delete().eq('store_id', store.id);
      await supabase.from('categories').delete().eq('store_id', store.id);
      await supabase.from('coupons').delete().eq('store_id', store.id);
      await supabase.from('daily_visitors').delete().eq('store_id', store.id);
      await supabase.from('suppliers').delete().eq('store_id', store.id);
      await supabase.from('purchases').delete().eq('store_id', store.id);
      await supabase.from('stock_items').delete().eq('store_id', store.id);
      await supabase.from('settings').delete().eq('store_id', store.id);
      
      const { error } = await supabase.from('stores').delete().eq('id', store.id);
      if (error) {
        alert(`Erro ao excluir loja: ${error.message}`);
        return;
      }
      
      setStores(prev => prev.filter(s => s.id !== store.id));
      setDeleteTarget(null);
      alert('Loja excluída com sucesso!');
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const handleUpdateStorePassword = async (id: string, newPassword: string) => {
    if (!newPassword.trim()) return;
    try {
      // 1. Get current store data to find owner_id
      const store = stores.find(s => s.id === id);
      if (!store) throw new Error("Loja não encontrada.");

      // 2. Sync password in Auth via RPC (only if owner_id exists)
      if (store.owner_id) {
        const { error: rpcError } = await supabase.rpc('update_store_owner_password', {
          p_user_id: store.owner_id,
          p_new_password: newPassword.trim()
        });

        if (rpcError) {
          console.error("Erro ao sincronizar senha no Auth:", rpcError);
          // Alert but continue to update store table so they are at least "synced" in the view
          // although RLS might fail if Auth is not updated.
          // Better to fail here if sync is critical.
          throw new Error(`Erro ao sincronizar login: ${rpcError.message}`);
        }
      }

      // 3. Update password in the stores table
      const { data, error } = await supabase
        .from('stores')
        .update({ password: newPassword.trim() })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("Sem permissão para atualizar ou loja não encontrada.");
      }
      
      setStores(prev => prev.map(s => s.id === id ? { ...s, password: newPassword.trim() } : s));
      alert('Senha atualizada no sistema e no login!');
    } catch (err: any) {
      alert(`Erro ao atualizar senha: ${err.message}`);
    }
  };

  const handleToggleStoreStatus = async (storeId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      const { error } = await supabase
        .from('settings')
        .update({ store_status: newStatus })
        .eq('store_id', storeId);

      if (error) throw error;

      setStores(prev => prev.map(s => {
        if (s.id === storeId) {
          const updatedSettings = Array.isArray(s.settings) 
            ? [{ ...s.settings[0], store_status: newStatus }]
            : { ...s.settings, store_status: newStatus };
          return { ...s, settings: updatedSettings };
        }
        return s;
      }));
    } catch (err: any) {
      alert(`Erro ao alterar status: ${err.message}`);
    }
  };

  const handleRenewPlan = async (storeId: string, durationDays: number, isCumulative: boolean) => {
    try {
      const store = stores.find(s => s.id === storeId);
      if (!store) return;

      const now = new Date();
      const currentExpiry = store.plan_expiry_date ? new Date(store.plan_expiry_date) : now;
      const baseDate = (isCumulative && currentExpiry > now) ? currentExpiry : now;
      
      const newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + durationDays);

      const { error } = await supabase
        .from('stores')
        .update({
          plan_type: durationDays <= 15 ? 'test' : 'paid',
          plan_duration_days: durationDays,
          plan_expiry_date: newExpiry.toISOString()
        })
        .eq('id', storeId);

      if (error) throw error;

      setStores(prev => prev.map(s => s.id === storeId ? { 
        ...s, 
        plan_type: durationDays <= 15 ? 'test' : 'paid',
        plan_duration_days: durationDays,
        plan_expiry_date: newExpiry.toISOString() 
      } : s));
      
      setRenewingStore(null);
      alert('Plano atualizado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao atualizar plano: ${err.message}`);
    }
  };


  const handleUpdateStoreName = async (id: string, name: string) => {
    if (!name.trim()) {
      setIsEditingName(null);
      return;
    }
    
    const newSlug = generateSlug(name);
    
    try {
      // 1. Update store name and slug
      const { error: storeError } = await supabase
        .from('stores')
        .update({ 
          name: name.trim(),
          slug: newSlug
        })
        .eq('id', id);

      if (storeError) throw storeError;
      
      // 2. Update store name in settings too
      await supabase
        .from('settings')
        .update({ store_name: name.trim() })
        .eq('store_id', id);

      setStores(prev => prev.map(s => s.id === id ? { ...s, name: name.trim(), slug: newSlug } : s));
      setIsEditingName(null);
      setEditingName('');
    } catch (err: any) {
      alert(`Erro ao atualizar nome e URL: ${err.message}`);
    }
  };

  const handleUpdateGlobalWhatsapp = async () => {
    try {
      if (!editingWhatsappValue.trim()) throw new Error("Número inválido.");

      const { error } = await supabase
        .from('platform_settings')
        .update({ value: editingWhatsappValue })
        .eq('key', 'landing_page_whatsapp');

      if (error) throw error;
      
      setGlobalWhatsapp(editingWhatsappValue);
      setIsEditingGlobalWhatsapp(false);
      alert('WhatsApp da Landing Page atualizado na tabela oficial!');
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0118] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-900 flex items-center justify-center shadow-2xl shadow-purple-900/50">
          <Store size={32} className="text-white" />
        </div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <motion.div key={i} className="w-2 h-2 bg-purple-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </div>
        <p className="text-purple-300 text-sm font-medium">Carregando plataforma...</p>
      </div>
    );
  }

  // Color palette per store index
  const cardAccents = [
    { from: 'from-purple-500', to: 'to-violet-700', icon: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
    { from: 'from-blue-500', to: 'to-indigo-700', icon: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
    { from: 'from-emerald-500', to: 'to-teal-700', icon: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
    { from: 'from-orange-500', to: 'to-rose-600', icon: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
    { from: 'from-pink-500', to: 'to-fuchsia-700', icon: 'bg-pink-500', badge: 'bg-pink-100 text-pink-700' },
    { from: 'from-cyan-500', to: 'to-sky-700', icon: 'bg-cyan-500', badge: 'bg-cyan-100 text-cyan-700' },
  ];

  const calculateRemaining = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, expired: false };
  };

  const LiveCountdown = ({ store }: { store: StoreType }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
      const interval = setInterval(() => setNow(new Date()), 60000);
      return () => clearInterval(interval);
    }, []);

    const remaining = calculateRemaining(store.plan_expiry_date);
    if (!remaining) return null;

    return (
      <div className="mt-3 bg-white/5 rounded-xl p-2.5 border border-white/5">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-purple-400" />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
              {store.plan_type === 'test' ? 'Período de Teste' : 'Plano Ativo'}
            </span>
          </div>
          <span className={`text-[10px] font-bold ${remaining.expired ? 'text-red-400' : (remaining.days < 3 ? 'text-orange-400' : 'text-emerald-400')}`}>
            {remaining.expired ? 'Expirado' : (
              <div className="flex gap-1">
                <span className="bg-white/10 px-1 rounded">{remaining.days}d</span>
                <span className="bg-white/10 px-1 rounded">{remaining.hours}h</span>
                <span className="bg-white/20 px-1 rounded opacity-70">{remaining.minutes}m</span>
              </div>
            )}
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
          <motion.div
            className={`h-full bg-gradient-to-r ${remaining.expired ? 'from-red-500 to-rose-600' : 'from-purple-500 to-emerald-500'} rounded-full`}
            initial={{ width: 0 }}
            animate={{ 
              width: remaining.expired ? '100%' : `${Math.max(0, Math.min(100, (remaining.days + remaining.hours/24) / (store.plan_duration_days || 30) * 100))}%` 
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <button
          onClick={() => setRenewingStore(store)}
          className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold text-white/50 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <Calendar size={12} className="text-purple-400" />
          Renovar Plano
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0118 0%, #130a2e 50%, #1a0a3e 100%)' }}>
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-8 pb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-800 flex items-center justify-center shadow-2xl shadow-purple-900/50">
                <Store size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Canaã Delivery OS</h1>
                <p className="text-purple-300 font-medium text-sm">Painel de Controle da Plataforma</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-900/40 hover:from-purple-400 hover:to-violet-500 transition-all"
              >
                <Plus size={20} /> Nova Loja
              </motion.button>
              <button
                onClick={() => { setAdminRole(null); navigate('/'); }}
                className="flex items-center gap-2 bg-white/5 backdrop-blur text-white/70 hover:text-white font-bold px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <LogOut size={18} /> Sair
              </button>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-purple-300">
                <Activity size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Lojas Ativas</span>
              </div>
              <p className="text-3xl font-black text-white">{stores.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Plano</span>
              </div>
              <div className="flex items-end gap-1">
                <p className="text-3xl font-black text-white">{stores.length}</p>
                <p className="text-white/40 font-bold text-sm mb-1">/20</p>
              </div>
              {/* Plan usage bar */}
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stores.length / 20) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 col-span-2 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Sistema</p>
                <p className="text-white font-bold text-sm flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online · Todos os sistemas 
                </p>
              </div>

              {/* WhatsApp Config (Where the user circled) */}
              <div className="flex flex-col items-end gap-1">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">WhatsApp Landing Page</p>
                {isEditingGlobalWhatsapp ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingWhatsappValue}
                      onChange={(e) => setEditingWhatsappValue(e.target.value)}
                      className="bg-purple-900/30 border border-purple-500/50 rounded-lg px-3 py-1 text-xs text-white outline-none w-36"
                      autoFocus
                    />
                    <button onClick={handleUpdateGlobalWhatsapp} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all">
                      <Save size={14} />
                    </button>
                    <button onClick={() => setIsEditingGlobalWhatsapp(false)} className="p-1.5 bg-white/5 text-white/50 rounded-lg hover:bg-white/10 transition-all">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setEditingWhatsappValue(globalWhatsapp);
                      setIsEditingGlobalWhatsapp(true);
                    }}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 transition-all group"
                  >
                    <Smartphone size={14} className="text-purple-400" />
                    <span className="text-sm font-bold text-white">{globalWhatsapp || 'Configurar'}</span>
                    <Pencil size={12} className="text-white/20 group-hover:text-purple-400 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white/60 text-sm font-bold uppercase tracking-widest">Lojas Registradas</h2>
          <span className="text-white/30 text-xs">{stores.length} loja{stores.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {stores.map((store, idx) => {
            const accent = cardAccents[idx % cardAccents.length];
            const remaining = calculateRemaining(store.plan_expiry_date);
            const storeStatus = Array.isArray(store.settings) ? store.settings[0]?.store_status : store.settings?.store_status;
            const isOpen = storeStatus === 'open';
            const isExpanded = editingStoreId === `expand_${store.id}`;
            
            return (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] hover:border-white/20 transition-all group cursor-pointer"
                onClick={() => setEditingStoreId(isExpanded ? null : `expand_${store.id}`)}
              >
                {/* Top colored accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${accent.from} ${accent.to}`} />

                <div className="p-3 sm:p-4">
                  {/* Compact Header: Icon + Status Dot */}
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${accent.icon} bg-opacity-20 flex items-center justify-center`}>
                      <Store size={18} className="text-white" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-red-400'} shadow-lg ${isOpen ? 'shadow-emerald-500/50' : 'shadow-red-500/50'}`} />
                    </div>
                  </div>

                  {/* Store Name & Link */}
                  {isEditingName === store.id ? (
                    <div className="flex items-center gap-2 mb-2" onClick={e => e.stopPropagation()}>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full bg-white/10 border border-purple-500/50 rounded-lg px-2 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-purple-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateStoreName(store.id, editingName);
                            if (e.key === 'Escape') setIsEditingName(null);
                          }}
                        />
                        <p className="text-[8px] text-purple-400 mt-1 font-bold">Nova URL: /{generateSlug(editingName)}</p>
                      </div>
                      <button
                        onClick={() => handleUpdateStoreName(store.id, editingName)}
                        className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all shadow-lg"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => setIsEditingName(null)}
                        className="p-1.5 bg-white/5 text-white/50 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between group/name mb-0.5">
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">{store.name}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingName(store.name);
                            setIsEditingName(store.id);
                          }}
                          className="p-1 text-white/20 hover:text-purple-400 opacity-0 group-hover/name:opacity-100 transition-all shrink-0"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[9px] sm:text-[10px] text-white/30 font-mono truncate">/{store.slug}</p>
                        {store.business_type && (
                          <span className="text-[8px] font-black uppercase bg-white/5 text-purple-300 px-1.5 py-0.5 rounded border border-white/5">
                            {store.business_type}
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {/* Compact Remaining Badge */}
                  {remaining && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${remaining.expired ? 'from-red-500 to-rose-600' : 'from-purple-500 to-emerald-500'} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ 
                            width: remaining.expired ? '100%' : `${Math.max(0, Math.min(100, (remaining.days + remaining.hours/24) / (store.plan_duration_days || 30) * 100))}%` 
                          }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${remaining.expired ? 'text-red-400' : (remaining.days < 3 ? 'text-orange-400' : 'text-emerald-400')}`}>
                        {remaining.expired ? 'Exp' : `${remaining.days}d`}
                      </span>
                    </div>
                  )}

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="pt-3 mt-3 border-t border-white/10 space-y-2.5">
                          {/* Status Toggle */}
                          <button
                            onClick={() => handleToggleStoreStatus(store.id, storeStatus || 'open')}
                            className={`w-full px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                              isOpen
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {isOpen ? 'Pausar Loja' : 'Ativar Loja'}
                          </button>

                          {/* Plan Info */}
                          {remaining && (
                            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-bold text-white/40 uppercase">{store.plan_type === 'test' ? 'Teste' : 'Plano'}</span>
                                <span className={`text-[9px] font-bold ${remaining.expired ? 'text-red-400' : 'text-emerald-400'}`}>
                                  {remaining.expired ? 'Expirado' : `${remaining.days}d ${remaining.hours}h`}
                                </span>
                              </div>
                              <button
                                onClick={() => setRenewingStore(store)}
                                className="w-full py-1 rounded-md bg-white/5 hover:bg-white/10 text-[9px] font-bold text-white/50 hover:text-white transition-all flex items-center justify-center gap-1"
                              >
                                <Calendar size={10} className="text-purple-400" />
                                Renovar
                              </button>
                            </div>
                          )}

                          {/* Credentials */}
                          <div className="space-y-2">

                            {store.owner_email && (
                              <div className="flex items-center gap-1.5 p-1">
                                <Activity size={10} className="text-purple-400 shrink-0" />
                                <span className="text-[10px] text-purple-300 truncate">{store.owner_email}</span>
                              </div>
                            )}
                            
                            {editingPasswordStoreId === store.id ? (
                              <div className="flex items-center gap-1.5">
                                <Lock size={10} className="text-white/30 shrink-0" />
                                <input
                                  type="text"
                                  value={editingPasswordValue}
                                  onChange={(e) => setEditingPasswordValue(e.target.value)}
                                  className="flex-1 bg-white/5 border border-white/20 rounded-md px-2 py-1 text-[10px] text-white outline-none focus:border-purple-500 transition-colors"
                                  placeholder="Nova senha..."
                                  autoFocus
                                />
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleUpdateStorePassword(store.id, editingPasswordValue);
                                    setEditingPasswordStoreId(null);
                                    setEditingPasswordValue('');
                                  }}
                                  className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors"
                                >
                                  <Save size={10} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPasswordStoreId(null);
                                    setEditingPasswordValue('');
                                  }}
                                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between group/pwd p-1 rounded-md hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-1.5">
                                  <Lock size={10} className="text-white/30 shrink-0" />
                                  <span className="text-[10px] text-white/60 font-mono">
                                    {visibleSecrets[store.id] ? (store.password || '••••') : '••••••••'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSecret(store.id);
                                    }}
                                    className="p-1.5 text-white/30 hover:text-white/70 transition-colors"
                                  >
                                    {visibleSecrets[store.id] ? <EyeOff size={10} /> : <Eye size={10} />}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPasswordValue(store.password || '');
                                      setEditingPasswordStoreId(store.id);
                                    }}
                                    className="p-1.5 text-white/30 hover:text-purple-400 transition-colors"
                                  >
                                    <Pencil size={10} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions Row */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleCopyLink(store.slug)}
                              className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all ${
                                copiedSlug === store.slug
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-white/5 text-white/50 hover:bg-white/10'
                              }`}
                            >
                              {copiedSlug === store.slug ? <CheckCircle size={10} /> : <Copy size={10} />}
                              {copiedSlug === store.slug ? 'Copiado' : 'Link'}
                            </button>
                            <a
                              href={`/#/${store.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex-1 py-1.5 rounded-lg bg-gradient-to-r ${accent.from} ${accent.to} text-white text-[9px] font-bold flex items-center justify-center gap-1 opacity-80 hover:opacity-100 transition-all active:scale-95`}
                            >
                              Abrir <ChevronRight size={10} />
                            </a>
                          </div>

                          {/* Delete & Clone */}
                          <div className="flex flex-col gap-1.5 pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setStoreToClone(store);
                                setShowCloneModal(true);
                              }}
                              className="w-full py-1 rounded-lg text-[9px] text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-1"
                            >
                              <Copy size={10} />
                              Clonar Loja
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(store);
                              }}
                              className="w-full py-1 rounded-lg text-[9px] text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-1"
                            >
                              <Trash2 size={10} />
                              Excluir
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}

          {/* Add Store Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stores.length * 0.04 }}
            onClick={() => setShowCreateModal(true)}
            className="border-2 border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[140px] hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
          >
            <div className="w-10 h-10 bg-white/5 group-hover:bg-purple-500/20 rounded-full flex items-center justify-center text-white/30 group-hover:text-purple-300 transition-all">
              <Plus size={22} />
            </div>
            <p className="font-bold text-white/30 group-hover:text-purple-300 transition-colors text-xs">Nova Loja</p>
          </motion.div>
        </div>
      </div>

      {/* Create Store Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateStoreModal
            onClose={() => setShowCreateModal(false)}
            onCreated={handleStoreCreated}
          />
        )}
      </AnimatePresence>

      {/* Delete Store Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteStoreModal
            store={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => handleDeleteStore(deleteTarget)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCloneModal && storeToClone && (
          <CloneStoreModal
            sourceStore={storeToClone}
            onClose={() => {
              setShowCloneModal(false);
              setStoreToClone(null);
            }}
            onCreated={handleStoreCreated}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {renewingStore && (
          <RenewPlanModal
            store={renewingStore}
            onClose={() => setRenewingStore(null)}
            onConfirm={(days, reset) => handleRenewPlan(renewingStore.id, days, reset)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};


// --- Create Store Modal ---

interface CreateStoreModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ onClose, onCreated }) => {
  const [storeName, setStoreName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [dataTemplate, setDataTemplate] = useState<'acaiteria' | 'empty'>('acaiteria');
  const [businessType, setBusinessType] = useState<'livre' | 'acaiteria' | 'sorveteria'>('acaiteria');
  const [uiMode, setUiMode] = useState<'modern' | 'classic'>('modern');
  const [saving, setSaving] = useState(false);
  const [planDuration, setPlanDuration] = useState<number>(7);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdLink, setCreatedLink] = useState('');

  // Auto-generate slug from store name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const slug = generateSlug(storeName);

  const handleCreate = async () => {
    if (!storeName.trim() || !ownerPassword.trim()) {
      setError('Preencha o nome da loja e a senha.');
      return;
    }
    if (ownerPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setSaving(true);
    setError(null);

    // Auto-generate internal email
    const generatedEmail = `${slug.toLowerCase()}@internal.com`;

    try {
      // 1. Create the auth user for the store owner via RPC
      // This is secure and doesn't log the admin out!
      const { data: userId, error: rpcError } = await supabase.rpc('create_store_owner', {
        p_email: generatedEmail,
        p_password: ownerPassword
      });

      if (rpcError) {
        setError(`Erro ao criar conta de login: ${rpcError.message}`);
        setSaving(false);
        return;
      }

      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + planDuration);

      // 2. Create the store record
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert({
          name: storeName.trim(),
          slug: slug,
          owner_id: userId || null,
          owner_email: generatedEmail,
          password: ownerPassword,
          plan_type: planDuration <= 15 ? 'test' : 'paid',
          plan_duration_days: planDuration,
          plan_start_date: new Date().toISOString(),
          plan_expiry_date: expiryDate.toISOString(),
          business_type: businessType,
        })
        .select()
        .single();

      if (storeError) {
        if (storeError.message.includes('duplicate')) {
          setError('Já existe uma loja com esse nome/URL. Troque o nome.');
        } else {
          setError(`Erro ao criar loja: ${storeError.message}`);
        }
        setSaving(false);
        return;
      }

      // 3. Create default settings for the store
      if (storeData) {
        await supabase.from('settings').insert({
          store_id: storeData.id,
          store_name: storeName.trim(),
          whatsapp_number: whatsappNumber,
          store_status: 'open',
          delivery_fee: 5.00,
          delivery_only: false,
          banner_url: dataTemplate === 'empty' ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670&auto=format&fit=crop' : null,
          note_title: 'Observações',
          note_placeholder: '',
          opening_hours: [
            { dayOfWeek: 0, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 1, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 2, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 3, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 4, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 5, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 6, open: '08:00', close: '22:00', enabled: true },
          ],
          ui_mode: uiMode
        });

        // 4. Se o usuário escolheu o template da Açaiteria, importar os dados
        if (dataTemplate === 'acaiteria') {
          await applyAcaiteriaTemplate(storeData.id);
        }
      }

      const link = `${window.location.origin}/#/${slug}`;
      setCreatedLink(link);
      setSuccess(true);
    } catch (err: any) {
      setError(`Erro inesperado: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 flex justify-between items-center">
          <h2 className="text-xl font-black text-white">Criar Nova Loja</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {success ? (
            // --- Success State ---
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Loja Criada! 🎉</h3>
              <p className="text-gray-500 mb-4">O cardápio já está no ar.</p>

              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-2 mb-4">
                <input type="text" readOnly value={createdLink} className="bg-transparent flex-1 font-medium text-sm text-gray-700 outline-none" />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdLink);
                  }}
                  className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                >
                  Copiar
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700 mb-4">
                <strong>Login do Lojista:</strong><br/>
                Loja: <strong>{slug}</strong><br/>
                Senha: <strong>{ownerPassword}</strong>
              </div>

              <button
                onClick={onCreated}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
              >
                Fechar
              </button>
            </motion.div>
          ) : (
            // --- Form State ---
            <>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              {/* Store Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nome da Loja</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                  placeholder="Ex: Açaí do João"
                />
                {slug && (
                  <p className="mt-1.5 text-xs text-gray-400 font-medium">
                    URL: <span className="text-purple-600 font-bold">/{slug}</span>
                  </p>
                )}
              </div>

              {/* Owner Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Senha do Lojista</label>
                <input
                  type="text"
                  required
                  value={ownerPassword}
                  onChange={e => setOwnerPassword(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none font-medium text-gray-800"
                  placeholder="Mínimo 6 caracteres"
                />
                <p className="mt-1.5 text-xs text-gray-400 font-medium leading-relaxed">
                  O lojista usará esta senha para acessar o próprio painel.
                </p>
              </div>

              {/* Whatsapp Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Número do WhatsApp</label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none font-medium text-gray-800"
                  placeholder="Ex: 55949xxxx-xxxx"
                />
                <p className="mt-1.5 text-xs text-gray-400 font-medium leading-relaxed">
                  WhatsApp que receberá os pedidos e aparecerá no cardápio.
                </p>
              </div>

              {/* Plan Duration Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Duração do Plano</label>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                  {[7, 15, 30, 60, 90, 120, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setPlanDuration(d)}
                      className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                        planDuration === d
                          ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                          : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-purple-200'
                      }`}
                    >
                      {d} dias
                      <div className="text-[8px] opacity-70 mt-0.5">
                        {d <= 15 ? 'Teste' : d === 365 ? 'Anual' : 'Plano'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Type Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Ramo de Atividade</label>
                <div className="flex gap-2">
                  {[
                    { id: 'livre', label: 'Livre', color: 'blue' },
                    { id: 'acaiteria', label: 'Açaíteria', color: 'purple' },
                    { id: 'sorveteria', label: 'Sorveteria', color: 'pink' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setBusinessType(item.id as any);
                        setDataTemplate(item.id === 'livre' ? 'empty' : 'acaiteria');
                      }}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                        businessType === item.id
                          ? `border-${item.color}-600 bg-${item.color}-600 text-white shadow-md`
                          : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Template Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Template da Loja (Dados)</label>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Acaiteria Option */}
                  <button
                    type="button"
                    onClick={() => setDataTemplate('acaiteria')}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-left ${dataTemplate === 'acaiteria' ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100' : 'border-gray-200 bg-white hover:border-purple-200'}`}
                  >
                    {dataTemplate === 'acaiteria' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${dataTemplate === 'acaiteria' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Coffee size={20} />
                    </div>
                    <p className="font-bold text-gray-900 text-sm">Açaíteria (Padrão)</p>
                    <p className="text-xs text-gray-500 mt-0.5">Categorias e produtos preenchidos</p>
                  </button>

                  {/* Empty Option */}
                  <button
                    type="button"
                    onClick={() => setDataTemplate('empty')}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-left ${dataTemplate === 'empty' ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100' : 'border-gray-200 bg-white hover:border-blue-200'}`}
                  >
                    {dataTemplate === 'empty' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${dataTemplate === 'empty' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Box size={20} />
                    </div>
                    <p className="font-bold text-gray-900 text-sm">Modo Livre</p>
                    <p className="text-xs text-gray-500 mt-0.5">Começar do zero (cardápio vazio)</p>
                  </button>
                </div>
              </div>

              {/* UI Mode Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Estilo Visual do Cardápio</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Modern Option */}
                  <button
                    type="button"
                    onClick={() => setUiMode('modern')}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-left ${uiMode === 'modern' ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100' : 'border-gray-200 bg-white hover:border-purple-200'}`}
                  >
                    {uiMode === 'modern' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${uiMode === 'modern' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Palette size={20} />
                    </div>
                    <p className="font-bold text-gray-900 text-sm">Moderno</p>
                    <p className="text-xs text-gray-500 mt-0.5">Visual clean e premium</p>
                  </button>

                  {/* Classic Option */}
                  <button
                    type="button"
                    onClick={() => setUiMode('classic')}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-left ${uiMode === 'classic' ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100' : 'border-gray-200 bg-white hover:border-orange-200'}`}
                  >
                    {uiMode === 'classic' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${uiMode === 'classic' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <LayoutTemplate size={20} />
                    </div>
                    <p className="font-bold text-gray-900 text-sm">Clássico</p>
                    <p className="text-xs text-gray-500 mt-0.5">Lista tradicional</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Número do WhatsApp</label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none font-medium text-gray-800"
                  placeholder="Ex: 55949xxxx-xxxx"
                />
              </div>

              {/* Whatsapp Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Número do WhatsApp</label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none font-medium text-gray-800"
                  placeholder="Ex: 55949xxxx-xxxx"
                />
                <p className="mt-1.5 text-xs text-gray-400 font-medium leading-relaxed">
                  WhatsApp que receberá os pedidos e aparecerá no cardápio.
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCreate}
                disabled={saving || !storeName.trim() || !ownerPassword.trim() || !whatsappNumber.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Criando...
                  </>
                ) : (
                  <>
                    <Plus size={20} /> Criar Loja
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Delete Store Confirmation Modal ---

interface DeleteStoreModalProps {
  store: StoreType;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteStoreModal: React.FC<DeleteStoreModalProps> = ({ store, onClose, onConfirm }) => {
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setError(null);

    if (!password1 || !password2) {
      setError('Preencha os dois campos de senha.');
      return;
    }

    if (password1 !== password2) {
      setError('As senhas não coincidem. Digite novamente.');
      setPassword1('');
      setPassword2('');
      return;
    }

    if (password1 !== SUPER_ADMIN_PASSWORD) {
      setError('Senha incorreta. Acesso negado.');
      setPassword1('');
      setPassword2('');
      return;
    }

    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-white" />
            <h2 className="text-xl font-black text-white">Excluir Loja</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-800 font-bold text-lg mb-1">"{store.name}"</p>
            <p className="text-red-600 text-sm font-medium">
              Todos os produtos, categorias, pedidos, cupons e configurações serão <strong>apagados permanentemente</strong>.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Password 1 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              <Lock size={14} className="inline mr-1" />
              Digite sua senha de Super Admin
            </label>
            <input
              type="password"
              value={password1}
              onChange={e => setPassword1(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none font-medium"
              placeholder="••••••••"
              disabled={deleting}
            />
          </div>

          {/* Password 2 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              <Lock size={14} className="inline mr-1" />
              Confirme a senha novamente
            </label>
            <input
              type="password"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none font-medium"
              placeholder="••••••••"
              disabled={deleting}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || !password1 || !password2}
              className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Excluindo...
                </>
              ) : (
                <>
                  <Trash2 size={18} /> Excluir
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Renew Plan Modal ---

interface RenewPlanModalProps {
  store: StoreType;
  onClose: () => void;
  onConfirm: (days: number, isCumulative: boolean) => void;
}

const RenewPlanModal: React.FC<RenewPlanModalProps> = ({ store, onClose, onConfirm }) => {
  const [selectedDays, setSelectedDays] = useState(30);
  const [isCumulative, setIsCumulative] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-inner">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Renovar Plano</h3>
              <p className="text-xs text-gray-500 font-medium">{store.name}</p>
            </div>
          </div>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Escolha a Duração</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[7, 15, 30, 60, 90, 120, 365].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDays(d)}
                className={`py-4 rounded-2xl text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                  selectedDays === d
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-lg shadow-purple-100'
                    : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-purple-200'
                }`}
              >
                <span>{d} dias</span>
                <span className="text-[9px] uppercase tracking-tighter opacity-60">
                  {d <= 15 ? 'Período Teste' : d === 365 ? 'Plano Anual' : 'Plano Mensal'}
                </span>
              </button>
            ))}
          </div>

          {/* Reset vs Cumulative Toggle */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-600">Modo de Renovação</span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isCumulative ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                {isCumulative ? 'Acumulativo' : 'Zerar e Iniciar'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsCumulative(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isCumulative ? 'bg-white shadow text-purple-700' : 'text-gray-400 hover:bg-white/50'}`}
              >
                Acumular
              </button>
              <button
                onClick={() => setIsCumulative(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!isCumulative ? 'bg-white shadow text-orange-600' : 'text-gray-400 hover:bg-white/50'}`}
              >
                Zerar Saldo
              </button>
            </div>
            <p className="text-[9px] text-gray-400 mt-2 leading-tight">
              {isCumulative 
                ? "* Adiciona os novos dias ao tempo que já resta na loja."
                : "* Ignora o tempo restante e inicia o novo plano hoje."}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-gray-400 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(selectedDays, isCumulative)}
              className="flex-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold hover:from-purple-500 hover:to-purple-700 shadow-xl shadow-purple-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} /> Renovar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Clone Store Modal ---

interface CloneStoreModalProps {
  sourceStore: StoreType;
  onClose: () => void;
  onCreated: () => void;
}

const CloneStoreModal: React.FC<CloneStoreModalProps> = ({ sourceStore, onClose, onCreated }) => {
  const [storeName, setStoreName] = useState(`${sourceStore.name} (Cópia)`);
  const [ownerPassword, setOwnerPassword] = useState(sourceStore.password || '');
  const [whatsappNumber, setWhatsappNumber] = useState(sourceStore.settings?.whatsapp_number || '');
  const [saving, setSaving] = useState(false);
  const [planDuration, setPlanDuration] = useState<number>(sourceStore.plan_duration_days || 7);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdLink, setCreatedLink] = useState('');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const slug = generateSlug(storeName);

  const handleClone = async () => {
    if (!storeName.trim() || !ownerPassword.trim()) {
      setError('Preencha o nome da loja e a senha.');
      return;
    }

    setSaving(true);
    setError(null);

    const generatedEmail = `${slug.toLowerCase()}@internal.com`;

    try {
      // 1. Create the auth user
      const { data: userId, error: rpcError } = await supabase.rpc('create_store_owner', {
        p_email: generatedEmail,
        p_password: ownerPassword
      });

      if (rpcError) {
        setError(`Erro ao criar conta de login: ${rpcError.message}`);
        setSaving(false);
        return;
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + planDuration);

      // 2. Create the store record
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert({
          name: storeName.trim(),
          slug: slug,
          owner_id: userId || null,
          owner_email: generatedEmail,
          password: ownerPassword,
          plan_type: planDuration <= 15 ? 'test' : 'paid',
          plan_duration_days: planDuration,
          plan_start_date: new Date().toISOString(),
          plan_expiry_date: expiryDate.toISOString(),
          business_type: sourceStore.business_type,
        })
        .select()
        .single();

      if (storeError) {
        setError(`Erro ao criar cópia: ${storeError.message}`);
        setSaving(false);
        return;
      }

      // 3. Clone all data using utility
      if (storeData) {
        const result = await cloneStoreData(sourceStore.id, storeData.id);
        if (!result) {
          setError('Loja criada, mas houve um erro ao copiar os dados. Verifique manualmente.');
        } else {
          // Atualiza o WhatsApp e Nome da Loja na nova loja clonada (para não herdar o da origem se for diferente)
          await supabase
            .from('settings')
            .update({ 
              store_name: storeName.trim(),
              whatsapp_number: whatsappNumber 
            })
            .eq('store_id', storeData.id);
        }
      }

      const link = `${window.location.origin}/#/${slug}`;
      setCreatedLink(link);
      setSuccess(true);
    } catch (err: any) {
      setError(`Erro inesperado: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-800 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Copy size={24} className="text-white" />
            <h2 className="text-xl font-black text-white">Clonar Loja</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {success ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Loja Clonada! 🚀</h3>
              <p className="text-gray-500 mb-4">Todos os dados de "{sourceStore.name}" foram copiados.</p>

              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-2 mb-4">
                <input type="text" readOnly value={createdLink} className="bg-transparent flex-1 font-medium text-sm text-gray-700 outline-none" />
                <button onClick={() => navigator.clipboard.writeText(createdLink)} className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors">
                  Copiar
                </button>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 mb-4">
                <strong>Novo Login:</strong><br/>
                Loja: <strong>{slug}</strong><br/>
                Senha: <strong>{ownerPassword}</strong>
              </div>

              <button onClick={onCreated} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                Ver na Plataforma
              </button>
            </motion.div>
          ) : (
            <>
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                  <Store size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Origem</p>
                  <p className="font-bold text-gray-700">{sourceStore.name}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 font-bold">Novo Nome da Loja</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  placeholder="Ex: Açaí do João (Nova Unidade)"
                />
                <p className="mt-1.5 text-xs text-gray-400 font-medium">Nova URL: <span className="text-emerald-600 font-bold">/{slug}</span></p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nova Senha</label>
                <input
                  type="text"
                  value={ownerPassword}
                  onChange={e => setOwnerPassword(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 font-bold">Número do WhatsApp</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  placeholder="Ex: 55949xxxx-xxxx"
                />
              </div>

              <button
                onClick={handleClone}
                disabled={saving || !storeName.trim() || !ownerPassword.trim() || !whatsappNumber.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? <><Loader2 size={20} className="animate-spin" /> Clonando Dados...</> : <><Copy size={20} /> Iniciar Clonagem</>}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

