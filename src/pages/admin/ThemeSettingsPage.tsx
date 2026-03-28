import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Palette, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const ThemeSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const navigate = useNavigate();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const colors = [
    { key: 'headerBg', label: 'Fundo do Cabeçalho', default: '#4E0797' },
    { key: 'headerText', label: 'Texto do Cabeçalho', default: '#ffffff' },
    { key: 'background', label: 'Fundo da Página', default: '#f6f6f6' },
    { key: 'cardBg', label: 'Fundo dos Cards', default: '#ffffff' },
    { key: 'cardText', label: 'Texto dos Cards', default: '#333333' },
    { key: 'buttonPrimary', label: 'Botão Principal', default: '#e50914' },
    { key: 'buttonText', label: 'Texto do Botão', default: '#ffffff' },
    { key: 'textPrimary', label: 'Texto Principal', default: '#1e1e1e' },
    { key: 'textSecondary', label: 'Texto Secundário', default: '#666666' },
  ];

  const handleColorChange = (key: string, value: string) => {
    const currentTheme = settings.themeColors || {};
    updateSettings({
      themeColors: {
        ...currentTheme,
        [key]: value
      }
    });
  };

  const handleSave = () => {
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Deseja restaurar as cores padrão?')) {
      updateSettings({ themeColors: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-lg"><ChevronLeft /></button>
        <h1 className="text-xl font-bold">Cores do Site</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Palette size={20} /> Personalizar Cores
          </h3>
          <button onClick={handleReset} className="text-sm text-red-600 font-bold hover:underline">Restaurar Padrão</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colors.map(color => {
            const currentValue = (settings.themeColors as any)?.[color.key] || color.default;
            return (
              <div key={color.key} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-gray-50">
                <input type="color" value={currentValue} onChange={(e) => handleColorChange(color.key, e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700">{color.label}</label>
                  <span className="text-xs text-gray-500 uppercase">{currentValue}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={handleSave} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 mt-6">Salvar Alterações</button>
      </div>

      {showSaveConfirm && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <span className="font-bold">Salvo!</span>
        </div>
      )}
    </div>
  );
};
