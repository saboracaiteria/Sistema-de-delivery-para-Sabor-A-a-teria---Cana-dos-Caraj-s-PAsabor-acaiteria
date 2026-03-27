import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Edit, ChevronDown, ChevronUp, CheckCircle, X, ToggleRight, ToggleLeft } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { ProductGroup, ProductOption } from '../../types/types';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { supabase } from '../../supabaseClient';

export const AddonsPage: React.FC = () => {
  const { groups, addGroup, updateGroup, deleteGroup } = useApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<{ groupId: string; option: ProductOption | null } | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditData, setInlineEditData] = useState<Partial<ProductGroup>>({});

  const [deleteGroupConfirmation, setDeleteGroupConfirmation] = useState<{ id: string, title: string } | null>(null);
  const [deleteOptionConfirmation, setDeleteOptionConfirmation] = useState<{ groupId: string, option: ProductOption } | null>(null);
  const [activeGroupConfirmation, setActiveGroupConfirmation] = useState<{ group: ProductGroup, newActive: boolean } | null>(null);
  const [activeOptionConfirmation, setActiveOptionConfirmation] = useState<{ groupId: string, option: ProductOption, newActive: boolean } | null>(null);

  const handleAddGroup = () => {
    setEditingGroup({
      id: Date.now().toString(),
      title: '',
      min: 1,
      max: 1,
      options: []
    });
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: ProductGroup) => {
    setEditingGroup({ ...group });
    setIsModalOpen(true);
  };

  const handleSaveGroup = () => {
    if (!editingGroup || !editingGroup.title) return;
    const existingGroup = groups.find(g => g.id === editingGroup.id);
    if (existingGroup) {
      updateGroup(editingGroup);
    } else {
      addGroup(editingGroup);
    }
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const performDeleteGroup = (id: string) => {
    deleteGroup(id);
    setDeleteGroupConfirmation(null);
  };

  const handleAddOption = (groupId: string) => {
    setEditingOption({
      groupId,
      option: { id: Date.now().toString(), name: '', price: 0, description: '' }
    });
  };

  const handleEditOption = (groupId: string, option: ProductOption) => {
    setEditingOption({ groupId, option: { ...option } });
  };

  const handleSaveOption = () => {
    if (!editingOption || !editingOption.option || !editingOption.option.name) return;
    const group = groups.find(g => g.id === editingOption.groupId);
    if (!group) return;

    const existingOptionIndex = group.options.findIndex(o => o.id === editingOption.option!.id);
    let updatedOptions;
    if (existingOptionIndex >= 0) {
      updatedOptions = [...group.options];
      updatedOptions[existingOptionIndex] = editingOption.option;
    } else {
      updatedOptions = [...group.options, editingOption.option];
    }

    updateGroup({ ...group, options: updatedOptions });
    setEditingOption(null);
  };

  const performDeleteOption = (groupId: string, optionId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const updatedOptions = group.options.filter(o => o.id !== optionId);
    updateGroup({ ...group, options: updatedOptions });
    setDeleteOptionConfirmation(null);
  };

  const handleInlineEdit = (group: ProductGroup) => {
    setInlineEditId(group.id);
    setInlineEditData({ ...group });
  };

  const handleInlineSave = () => {
    if (!inlineEditData.title || inlineEditData.min === undefined || inlineEditData.max === undefined) {
      alert('Preencha todos os campos');
      return;
    }
    updateGroup(inlineEditData as ProductGroup);
    setInlineEditId(null);
    setInlineEditData({});
  };

  const performToggleGroupActive = async (group: ProductGroup, newActive: boolean) => {
    updateGroup({ ...group, active: newActive });
    await supabase.from('product_groups').update({ active: newActive }).eq('id', group.id);
    setActiveGroupConfirmation(null);
  };

  const performToggleOptionActive = async (groupId: string, option: ProductOption, newActive: boolean) => {
    await supabase.from('product_options').update({ active: newActive }).eq('id', option.id);
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const updatedOptions = group.options.map(o => o.id === option.id ? { ...o, active: newActive } : o);
      updateGroup({ ...group, options: updatedOptions });
    }
    setActiveOptionConfirmation(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/panel')} className="p-2 hover:bg-gray-200 rounded-lg"><ChevronLeft /></button>
          <h1 className="text-xl font-bold">Adicionais / Combos</h1>
        </div>
        <button onClick={handleAddGroup} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors">
          <Plus size={20} /> Novo Grupo
        </button>
      </div>

      <div className="space-y-3">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {inlineEditId === group.id ? (
              <div className="p-4 border-b border-gray-100">
                <div className="space-y-3">
                  <input className="w-full border p-2 rounded font-bold text-lg" placeholder="Título do Grupo" value={inlineEditData.title || ''} onChange={e => setInlineEditData({ ...inlineEditData, title: e.target.value })} autoFocus />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" className="w-full border p-2 rounded" placeholder="Min" value={inlineEditData.min || ''} onChange={e => setInlineEditData({ ...inlineEditData, min: parseInt(e.target.value) || 0 })} />
                    <input type="number" className="w-full border p-2 rounded" placeholder="Max" value={inlineEditData.max || ''} onChange={e => setInlineEditData({ ...inlineEditData, max: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleInlineSave} className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded font-bold flex items-center gap-1"><CheckCircle size={16} /> Salvar</button>
                    <button onClick={() => setInlineEditId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded font-bold flex items-center gap-1"><X size={16} /> Cancelar</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 flex justify-between items-center border-b border-gray-100 ${(group.active ?? true) ? '' : 'opacity-50'}`}>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{group.title}</h3>
                  <p className="text-sm text-gray-500">Min: {group.min} | Max: {group.max} | {group.options.length} opções</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => group.active ? setActiveGroupConfirmation({ group, newActive: false }) : performToggleGroupActive(group, true)} className={`p-2 rounded ${(group.active ?? true) ? 'text-green-600' : 'text-gray-400'}`}>
                    {(group.active ?? true) ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => handleInlineEdit(group)} className="p-2 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={20} /></button>
                  <button onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)} className="p-2 hover:bg-gray-100 rounded">
                    {expandedGroup === group.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <button onClick={() => handleEditGroup(group)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                  <button onClick={() => setDeleteGroupConfirmation({ id: group.id, title: group.title })} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                </div>
              </div>
            )}

            {expandedGroup === group.id && (
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-gray-700">Opções</h4>
                  <button onClick={() => handleAddOption(group.id)} className="text-purple-600 text-sm font-bold flex items-center gap-1 hover:text-purple-700">
                    <Plus size={16} /> Adicionar Opção
                  </button>
                </div>
                <div className="space-y-2">
                  {group.options.map(option => (
                    <div key={option.id} className={`bg-white p-3 rounded border border-gray-200 flex justify-between items-start ${(option.active ?? true) ? '' : 'opacity-50'}`}>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{option.name}</p>
                        {option.description && <p className="text-xs text-gray-500 mt-1">{option.description}</p>}
                        <p className="text-sm text-green-600 font-bold mt-1">+ R$ {option.price?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => option.active ? setActiveOptionConfirmation({ groupId: group.id, option, newActive: false }) : performToggleOptionActive(group.id, option, true)} className={`p-1 rounded ${(option.active ?? true) ? 'text-green-600' : 'text-gray-400'}`}>
                          {(option.active ?? true) ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button onClick={() => handleEditOption(group.id, option)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                        <button onClick={() => setDeleteOptionConfirmation({ groupId: group.id, option })} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && editingGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">{groups.find(g => g.id === editingGroup.id) ? 'Editar Grupo' : 'Novo Grupo'}</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Título do Grupo" value={editingGroup.title} onChange={e => setEditingGroup({ ...editingGroup, title: e.target.value })} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={editingGroup.min} onChange={e => setEditingGroup({ ...editingGroup, min: parseInt(e.target.value) || 0 })} className="w-full border p-3 rounded-lg" placeholder="Min" />
                <input type="number" value={editingGroup.max} onChange={e => setEditingGroup({ ...editingGroup, max: parseInt(e.target.value) || 0 })} className="w-full border p-3 rounded-lg" placeholder="Max" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold">Cancelar</button>
                <button onClick={handleSaveGroup} className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingOption && editingOption.option && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Novo/Editar Opção</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nome da Opção" value={editingOption.option.name} onChange={e => setEditingOption({ ...editingOption, option: { ...editingOption.option!, name: e.target.value } })} className="w-full border p-3 rounded-lg" />
              <textarea placeholder="Descrição" value={editingOption.option.description || ''} onChange={e => setEditingOption({ ...editingOption, option: { ...editingOption.option!, description: e.target.value } })} className="w-full border p-3 rounded-lg" rows={2} />
              <input type="number" step="0.01" placeholder="Preço" value={editingOption.option.price || ''} onChange={e => setEditingOption({ ...editingOption, option: { ...editingOption.option!, price: parseFloat(e.target.value) || 0 } })} className="w-full border p-3 rounded-lg" />
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditingOption(null)} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold">Cancelar</button>
                <button onClick={handleSaveOption} className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteGroupConfirmation} title="Excluir Grupo" message={`Tem certeza que deseja excluir "${deleteGroupConfirmation?.title}"?`} onConfirm={() => deleteGroupConfirmation && performDeleteGroup(deleteGroupConfirmation.id)} onCancel={() => setDeleteGroupConfirmation(null)} isDestructive />
      <ConfirmModal isOpen={!!deleteOptionConfirmation} title="Excluir Opção" message={`Tem certeza que deseja excluir "${deleteOptionConfirmation?.option.name}"?`} onConfirm={() => deleteOptionConfirmation && performDeleteOption(deleteOptionConfirmation.groupId, deleteOptionConfirmation.option.id)} onCancel={() => setDeleteOptionConfirmation(null)} isDestructive />
      <ConfirmModal isOpen={!!activeGroupConfirmation} title="Desativar Grupo" message={`Deseja desativar "${activeGroupConfirmation?.group.title}"?`} onConfirm={() => activeGroupConfirmation && performToggleGroupActive(activeGroupConfirmation.group, activeGroupConfirmation.newActive)} onCancel={() => setActiveGroupConfirmation(null)} isDestructive />
      <ConfirmModal isOpen={!!activeOptionConfirmation} title="Desativar Opção" message={`Deseja desativar "${activeOptionConfirmation?.option.name}"?`} onConfirm={() => activeOptionConfirmation && performToggleOptionActive(activeOptionConfirmation.groupId, activeOptionConfirmation.option, activeOptionConfirmation.newActive)} onCancel={() => setActiveOptionConfirmation(null)} isDestructive />
    </div>
  );
};
