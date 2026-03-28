import React, { useState } from 'react';
import { Copy, Check, Database, AlertTriangle, Terminal } from 'lucide-react';

const SQL_FILE_PATH = '/supabase/migrations/FINAL_V10_COMPLETE.sql';
const FALLBACK_SQL = `-- Se você está vendo isso, o arquivo ${SQL_FILE_PATH} não pôde ser lido automaticamente.
-- Por favor, abra o arquivo manualmente na pasta do projeto e copie seu conteúdo.
`;

// Como o arquivo é grande (687 linhas), vou carregar ele de forma dinâmica 
// ou apenas fornecer o botão que "conhece" o conteúdo se eu injetar aqui.
// Para fins de praticidade e como sou eu quem está editando, vou colocar 
// uma versão que busca o conteúdo ou o tem embutido.

export const DatabaseSetup: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            // Tenta ler o arquivo se ele estiver disponível via URL (ex: se estiver em public/)
            const response = await fetch(SQL_FILE_PATH);
            if (response.ok) {
                const text = await response.text();
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                return;
            }
            
            // Se falhar o fetch, avisa o usuário (provavelmente o arquivo não está na pasta public/)
            alert(`O arquivo não está na pasta 'public/'. Por favor, copie manualmente do caminho:\n${SQL_FILE_PATH}`);
        } catch (err) {
            console.error('Falha ao copiar:', err);
            await navigator.clipboard.writeText(FALLBACK_SQL);
            alert('Erro ao carregar SQL. Copie manualmente do arquivo: supabase/migrations/FINAL_V10_COMPLETE.sql');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                        <Database size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Configuração do Banco de Dados</h1>
                        <p className="text-gray-500 text-sm">Restauração e Inicialização do Supabase</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="p-6 border-b border-gray-100 bg-amber-50">
                        <div className="flex gap-3 items-start">
                            <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                            <div>
                                <h3 className="font-bold text-amber-900">Atenção Master Admin</h3>
                                <p className="text-sm text-amber-800 mt-1">
                                    Este SQL contém toda a estrutura do sistema (Tabelas, RLS, RPCs e Lojas Padrão).
                                    Use-o apenas no <b>SQL Editor do Supabase</b> se precisar restaurar o sistema do zero.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 mb-6">
                            <Terminal size={48} className="text-gray-400 mb-4" />
                            <h4 className="font-semibold text-gray-700">Script SQL FINAL V10</h4>
                            <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
                                687 linhas de código SQL prontas para restaurar todas as tabelas e politicas de segurança.
                            </p>

                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 transform active:scale-95 ${
                                    copied 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'
                                }`}
                            >
                                {copied ? (
                                    <><Check size={20} /> Conteúdo Copiado!</>
                                ) : (
                                    <><Copy size={20} /> Copiar SQL Completo</>
                                )}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-900 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto max-h-40">
                                <pre>
                                    {`-- =====================================================================
-- SABOR AÇAÍTERIA — FINAL SQL V10 (COMPLETO)
-- Inclui: Tabelas, Funções, RPCs, RLS, Storage, Bootstrap Auth
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;
CREATE TABLE IF NOT EXISTS stores (...);
-- [Restante do código...]`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-1 text-sm uppercase tracking-wider">Passo 1</h4>
                        <p className="text-xs text-blue-800">Clique no botão roxo acima para copiar o script.</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <h4 className="font-bold text-indigo-900 mb-1 text-sm uppercase tracking-wider">Passo 2</h4>
                        <p className="text-xs text-indigo-800">Cole no SQL Editor do seu projeto Supabase e execute.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
