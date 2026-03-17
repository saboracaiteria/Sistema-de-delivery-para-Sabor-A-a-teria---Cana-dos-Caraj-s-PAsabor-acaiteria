import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Store, LogOut, ChevronRight, Activity, Copy, CheckCircle, Plus, X, Palette, LayoutTemplate, Loader2, Trash2, AlertTriangle, Lock, Pencil, Save } from 'lucide-react';
import { useApp } from './App';
import type { Store as StoreType } from './types';
import { SUPER_ADMIN_PASSWORD } from './constants';

export const PlatformAdminPanel = () => {
  const { adminRole, setAdminRole } = useApp();
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setStores(data);
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

  const handleUpdateStoreName = async (id: string) => {
    if (!editingName.trim()) {
      setEditingStoreId(null);
      return;
    }
    try {
      const { error } = await supabase
        .from('stores')
        .update({ name: editingName.trim() })
        .eq('id', id);

      if (error) throw error;
      
      setStores(prev => prev.map(s => s.id === id ? { ...s, name: editingName.trim() } : s));
      setEditingStoreId(null);
    } catch (err: any) {
      alert(`Erro ao atualizar nome: ${err.message}`);
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
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 col-span-2 flex flex-col gap-1 justify-center">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Sistema</p>
              <p className="text-white font-bold text-sm flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Online · Todos os sistemas operacionais
              </p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store, idx) => {
            const accent = cardAccents[idx % cardAccents.length];
            return (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.07] hover:border-white/20 transition-all group"
              >
                {/* Top colored accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${accent.from} ${accent.to}`} />

                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-11 h-11 rounded-xl ${accent.icon} bg-opacity-20 flex items-center justify-center`}>
                      <Store size={22} className="text-white" />
                    </div>
                    <button
                      onClick={() => handleCopyLink(store.slug)}
                      className={`p-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${
                        copiedSlug === store.slug
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {copiedSlug === store.slug ? <CheckCircle size={13} /> : <Copy size={13} />}
                      {copiedSlug === store.slug ? 'Copiado!' : 'Copiar Link'}
                    </button>
                  </div>

                  {editingStoreId === store.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateStoreName(store.id);
                          if (e.key === 'Escape') setEditingStoreId(null);
                        }}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 outline-none font-bold text-white text-base focus:border-purple-400 transition-colors"
                        autoFocus
                      />
                      <button onClick={() => handleUpdateStoreName(store.id)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Salvar">
                        <Save size={18} />
                      </button>
                      <button onClick={() => setEditingStoreId(null)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors" title="Cancelar">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/title">
                      <h3 className="text-lg font-bold text-white tracking-tight">{store.name}</h3>
                      <button
                        onClick={() => { setEditingStoreId(store.id); setEditingName(store.name); }}
                        className="p-1 rounded text-white/30 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
                        title="Editar Nome"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  )}

                  <div className="mt-1 mb-4">
                    <span className="text-xs text-white/30 font-mono">/{store.slug}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.07]">
                    <button
                      onClick={() => setDeleteTarget(store)}
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Excluir Loja"
                    >
                      <Trash2 size={15} />
                    </button>

                    <a
                      href={`/#/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r ${accent.from} ${accent.to} text-white text-xs font-bold shadow-lg opacity-80 hover:opacity-100 transition-all active:scale-95`}
                    >
                      Abrir Loja <ChevronRight size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Add Store Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stores.length * 0.06 }}
            onClick={() => setShowCreateModal(true)}
            className="border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[200px] hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
          >
            <div className="w-14 h-14 bg-white/5 group-hover:bg-purple-500/20 rounded-full flex items-center justify-center text-white/30 group-hover:text-purple-300 transition-all">
              <Plus size={28} />
            </div>
            <p className="font-bold text-white/30 group-hover:text-purple-300 transition-colors text-sm">Criar Nova Loja</p>
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
  const [uiMode, setUiMode] = useState<'modern' | 'classic'>('modern');
  const [saving, setSaving] = useState(false);
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
      // 1. Create the auth user for the store owner
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: generatedEmail,
        password: ownerPassword,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este e-mail já está cadastrado.');
        } else {
          setError(`Erro ao criar conta: ${authError.message}`);
        }
        setSaving(false);
        return;
      }

      const userId = authData.user?.id;

      // 2. Create the store record
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert({
          name: storeName.trim(),
          slug: slug,
          owner_id: userId || null,
          owner_email: generatedEmail,
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
          store_status: 'open',
          delivery_fee: 5.00,
          delivery_only: false,
          opening_hours: [
            { dayOfWeek: 0, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 1, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 2, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 3, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 4, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 5, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 6, open: '08:00', close: '22:00', enabled: true },
          ],
        });
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
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

              {/* UI Mode Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Modelo do Cardápio</label>
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

              {/* Submit Button */}
              <button
                onClick={handleCreate}
                disabled={saving || !storeName.trim() || !ownerPassword.trim()}
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
