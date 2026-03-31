import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, MapPin, Upload, Trash2, CheckCircle, Info, MessageSquare, ToggleLeft } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../supabaseClient';
import { ImageCropModal } from '../../components/modals/ImageCropModal';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, isStoreOpen, isConfigured } = useApp();
  const navigate = useNavigate();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cropModalData, setCropModalData] = useState<{ imageUrl: string; field: 'logoUrl' | 'bannerUrl'; aspectRatio: number } | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handleSave = () => {
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `store-assets/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerUrl') => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      const aspectRatio = field === 'logoUrl' ? 1 : 16 / 9;
      setCropModalData({ imageUrl, field, aspectRatio });
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!cropModalData) return;
    const publicUrl = await uploadImageToSupabase(croppedFile);
    if (publicUrl) {
      updateSettings({ [cropModalData.field]: publicUrl });
    }
    setCropModalData(null);
  };

  const handleHourChange = (dayOfWeek: number, field: 'open' | 'close' | 'enabled', value: string | boolean) => {
    const updatedHours = settings.openingHours.map(h =>
      h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
    );
    updateSettings({ openingHours: updatedHours });
  };

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-lg"><ChevronLeft /></button>
        <h1 className="text-xl font-bold">Configurações</h1>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><ToggleLeft size={20} /> Controle da Loja</h3>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => updateSettings({ storeStatus: 'open' })} className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${settings.storeStatus === 'open' ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' : 'bg-white border-gray-200 text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${settings.storeStatus === 'open' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-xs font-bold">ABERTO</span>
            </button>
            <button onClick={() => updateSettings({ storeStatus: 'closed' })} className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${settings.storeStatus === 'closed' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' : 'bg-white border-gray-200 text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${settings.storeStatus === 'closed' ? 'bg-red-500' : 'bg-gray-300'}`} />
              <span className="text-xs font-bold">FECHADO</span>
            </button>
            <button onClick={() => updateSettings({ storeStatus: 'auto' })} className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${settings.storeStatus === 'auto' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${settings.storeStatus === 'auto' ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <span className="text-xs font-bold">AUTO</span>
            </button>
          </div>
          <div className="mt-3 text-center p-2 rounded bg-gray-50 border border-gray-100 text-xs font-medium uppercase">
            Status Atual: <strong className={isStoreOpen ? 'text-green-600' : 'text-red-600'}>{isStoreOpen ? 'Aberto Agora' : 'Fechado Agora'}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm font-outfit">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider"><MapPin size={18} className="text-purple-600" /> Logística e Taxas</h3>
            <div className="space-y-4">
                <div>
                   <label className="text-[10px] uppercase font-black text-gray-400 ml-1">Taxa de Entrega (R$)</label>
                   <input 
                     type="number" 
                     step="0.50"
                     className="w-full border-2 border-gray-100 focus:border-purple-500 rounded-xl p-3 text-sm font-bold outline-none transition-all" 
                     value={settings.deliveryFee || 0} 
                     onChange={e => updateSettings({ deliveryFee: parseFloat(e.target.value) || 0 })} 
                     placeholder="Ex: 5.00" 
                   />
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-purple-900">Apenas Retirada</span>
                        <span className="text-[10px] text-purple-600 font-medium">Desativa a entrega no checkout</span>
                    </div>
                    <button 
                        onClick={() => updateSettings({ deliveryOnly: !settings.deliveryOnly })} 
                        className={`h-6 w-11 rounded-full transition-colors flex items-center px-1 ${settings.deliveryOnly ? 'bg-purple-600' : 'bg-gray-300'}`}
                    >
                        <div className={`h-4 w-4 bg-white rounded-full transition-all ${settings.deliveryOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
                <button onClick={handleSave} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">Salvar Logística</button>
            </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><MessageSquare size={20} /> Mensagens</h3>
            <div className="space-y-3">
                <input className="w-full border rounded-lg p-3 text-sm" value={settings.openMessage || ''} onChange={e => updateSettings({ openMessage: e.target.value })} placeholder="Mensagem Aberto" />
                <input className="w-full border rounded-lg p-3 text-sm" value={settings.closedMessage || ''} onChange={e => updateSettings({ closedMessage: e.target.value })} placeholder="Mensagem Fechado" />
                <button onClick={handleSave} className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold">Salvar</button>
            </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Clock size={20} /> Estimativas e Horários</h3>
          <div className="space-y-3">
            <input className="w-full border rounded-lg p-3 text-sm" value={settings.deliveryTime || ''} onChange={e => updateSettings({ deliveryTime: e.target.value })} placeholder="Tempo Entrega" />
            <input className="w-full border rounded-lg p-3 text-sm" value={settings.pickupTime || ''} onChange={e => updateSettings({ pickupTime: e.target.value })} placeholder="Tempo Retirada" />
            <input className="w-full border rounded-lg p-3 text-sm" value={settings.deliveryCloseTime || ''} onChange={e => updateSettings({ deliveryCloseTime: e.target.value })} placeholder="Horário Limite Entrega" />
            <button onClick={handleSave} className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold">Salvar</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Clock size={20} /> Horários de Funcionamento</h3>
          <div className="space-y-3">
            {settings.openingHours.map((hour) => (
              <div key={hour.dayOfWeek} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <span className="font-medium">{dayNames[hour.dayOfWeek]}</span>
                    <button onClick={() => handleHourChange(hour.dayOfWeek, 'enabled', !hour.enabled)} className={`h-6 w-11 rounded-full transition-colors ${hour.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hour.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                {hour.enabled && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <input type="time" value={hour.open} onChange={e => handleHourChange(hour.dayOfWeek, 'open', e.target.value)} className="border p-2 rounded text-sm" />
                        <input type="time" value={hour.close} onChange={e => handleHourChange(hour.dayOfWeek, 'close', e.target.value)} className="border p-2 rounded text-sm" />
                    </div>
                )}
              </div>
            ))}
            <button onClick={handleSave} className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold mt-4">Salvar Horários</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-3">Logo da Loja</label>
          <div className="flex items-center gap-4">
            <img src={settings.logoUrl} className={`w-20 h-20 object-cover border ${settings.logoShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`} alt="Logo" />
            <label className={`flex-1 cursor-pointer bg-gray-50 p-3 rounded border border-dashed text-center ${isUploading ? 'opacity-50' : ''}`}>
              <Upload size={18} className="inline mr-2" /> {isUploading ? 'Enviando...' : 'Alterar Logo'}
              <input type="file" accept="image/*" hidden onChange={e => handleImage(e, 'logoUrl')} disabled={isUploading} />
            </label>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-3">Banner da Loja (Capa)</label>
          <div className="space-y-4">
            {settings.bannerUrl && (
              <img src={settings.bannerUrl} className="w-full h-32 object-cover border rounded-lg" alt="Banner" />
            )}
            <label className={`w-full flex-1 cursor-pointer bg-gray-50 p-4 rounded border border-dashed text-center flex flex-col items-center gap-2 ${isUploading ? 'opacity-50' : ''}`}>
              <Upload size={24} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">{isUploading ? 'Enviando...' : 'Alterar Banner / Capa'}</span>
              <input type="file" accept="image/*" hidden onChange={e => handleImage(e, 'bannerUrl')} disabled={isUploading} />
            </label>
          </div>
        </div>


        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><MapPin size={20} /> Informações Adicionais</h3>
            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Endereço da Loja</label>
                    <input className="w-full border rounded-lg p-3 text-sm" value={settings.businessAddress || ''} onChange={e => updateSettings({ businessAddress: e.target.value })} placeholder="Ex: Av. Principal, 123" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Link do Instagram (URL)</label>
                    <input className="w-full border rounded-lg p-3 text-sm" value={settings.instagramUrl || ''} onChange={e => updateSettings({ instagramUrl: e.target.value })} placeholder="Ex: https://instagram.com/sualoja" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Rodapé (Copyright)</label>
                    <input className="w-full border rounded-lg p-3 text-sm" value={settings.copyrightText || ''} onChange={e => updateSettings({ copyrightText: e.target.value })} placeholder="Ex: © 2026 Sabor Açaíteria" />
                </div>
                <button onClick={handleSave} className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold">Salvar Informações</button>
            </div>
        </div>

        <div className="bg-gray-800 text-white p-4 rounded-lg text-xs font-mono">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-400"><Info size={16} /> Diagnóstico</h3>
            <div>SUPABASE: {isConfigured ? 'ON' : 'OFF'}</div>
            <div>MUDANÇAS SALVAM: {isConfigured ? 'SIM' : 'NÃO'}</div>
        </div>
      </div>

      {showSaveConfirm && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle size={20} /> <span className="font-bold">Salvo!</span>
        </div>
      )}

      {cropModalData && (
        <ImageCropModal imageUrl={cropModalData.imageUrl} aspectRatio={cropModalData.aspectRatio} onComplete={handleCropComplete} onCancel={() => setCropModalData(null)} title="Recortar Imagem" />
      )}
    </div>
  );
};
