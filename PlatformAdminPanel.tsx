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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Store className="text-purple-600" size={32} />
              Canaã Delivery OS
            </h1>
            <p className="text-gray-500 font-medium">Lojas Registradas na Plataforma</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all active:scale-95"
            >
              <Plus size={20} /> Nova Loja
            </button>
            <button
              onClick={() => { setAdminRole(null); navigate('/'); }}
              className="flex items-center gap-2 bg-white text-red-600 font-bold px-4 py-2.5 rounded-xl border border-red-100 shadow-sm hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} /> Sair
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-full text-purple-600">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">Lojas Ativas</p>
              <p className="text-2xl font-black text-gray-900">{stores.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-full text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">Limite do Plano</p>
              <p className="text-2xl font-black text-gray-900">{stores.length}/20</p>
            </div>
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-purple-100 to-orange-50 rounded-xl flex items-center justify-center text-purple-600">
                  <Store size={24} />
                </div>
                <button
                  onClick={() => handleCopyLink(store.slug)}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold ${copiedSlug === store.slug ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'}`}
                  title="Copiar Link da Loja"
                >
                  {copiedSlug === store.slug ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copiedSlug === store.slug ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>

              <div className="flex-1 mb-1">
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
                      className="flex-1 border-b-2 border-purple-500 bg-transparent outline-none font-bold text-gray-900 text-xl py-0.5"
                      autoFocus
                    />
                    <button 
                      onClick={() => handleUpdateStoreName(store.id)} 
                      className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                      title="Salvar"
                    >
                      <Save size={20} />
                    </button>
                    <button 
                      onClick={() => setEditingStoreId(null)} 
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Cancelar"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group/title">
                    <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                    <button
                      onClick={() => {
                        setEditingStoreId(store.id);
                        setEditingName(store.name);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-50 hover:text-purple-600"
                      title="Editar Nome"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600">
                    /{store.slug}
                  </div>
                  <button
                    onClick={() => setDeleteTarget(store)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Excluir Loja"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <a
                  href={`/#/${store.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors"
                >
                  <ChevronRight size={20} />
                </a>
              </div>
            </motion.div>
          ))}

          {/* Add Store Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowCreateModal(true)}
            className="border-2 border-dashed border-gray-300 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[200px] hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
          >
            <div className="w-14 h-14 bg-gray-100 group-hover:bg-purple-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-purple-600 transition-colors">
              <Plus size={28} />
            </div>
            <p className="font-bold text-gray-400 group-hover:text-purple-600 transition-colors">Criar Nova Loja</p>
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
    if (!storeName.trim() || !ownerEmail.trim() || !ownerPassword.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    if (ownerPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. Create the auth user for the store owner
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: ownerEmail,
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
          opening_hours: JSON.stringify([
            { dayOfWeek: 0, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 1, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 2, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 3, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 4, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 5, open: '08:00', close: '22:00', enabled: true },
            { dayOfWeek: 6, open: '08:00', close: '22:00', enabled: true },
          ]),
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
                E-mail: <strong>{ownerEmail}</strong><br/>
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

              {/* Owner Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">E-mail do Lojista</label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={e => setOwnerEmail(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                  placeholder="lojista@email.com"
                />
              </div>

              {/* Owner Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Senha do Lojista</label>
                <input
                  type="text"
                  value={ownerPassword}
                  onChange={e => setOwnerPassword(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                  placeholder="Mínimo 6 caracteres"
                />
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
                disabled={saving || !storeName.trim() || !ownerEmail.trim() || !ownerPassword.trim()}
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
