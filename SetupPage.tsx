
import React, { useState } from 'react';
import { Database, Save, AlertCircle } from 'lucide-react';
import { supabase } from './supabaseClient';

export const SetupPage = () => {
    const [url, setUrl] = useState('');
    const [key, setKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        if (!url || !key) {
            alert('Por favor, preencha ambos os campos.');
            return;
        }

        setIsSaving(true);
        try {
            localStorage.setItem('OBBA_SUPABASE_URL', url.trim());
            localStorage.setItem('OBBA_SUPABASE_ANON_KEY', key.trim());

            // Force reload to pick up new client config
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar configurações.');
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <Database className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Conectar Banco de Dados</h1>
                    <p className="text-gray-500 text-center mt-2">
                        Bem-vindo ao seu novo Delivery App! Para começar, precisamos conectar ao seu banco de dados Supabase.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="https://exemplo.supabase.co"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project API Key (Anon)</label>
                        <input
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="eyJhbG..."
                            value={key}
                            onChange={e => setKey(e.target.value)}
                        />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <strong>Onde encontrar?</strong><br />
                            No painel do Supabase: Project Settings {'>'} API {'>'} Project URL e Anon/Public Key.
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        <Save size={20} />
                        {isSaving ? 'Salvando...' : 'Salvar e Conectar'}
                    </button>
                </div>
            </div>
        </div>
    );
};
