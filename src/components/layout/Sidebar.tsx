import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock as LockIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, setSidebarOpen, categories, setAdminRole } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    if (password === '1245') {
      setAdminRole('admin');
      navigate('/panel');
      setShowPassword(false);
      setSidebarOpen(false);
      setPassword('');
    } else if (password === '777') {
      setAdminRole('employee');
      navigate('/panel');
      setShowPassword(false);
      setSidebarOpen(false);
      setPassword('');
    } else {
      alert('Senha incorreta!');
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div
          className="p-4 text-white font-bold text-lg flex justify-between items-center transition-colors duration-300"
          style={{
            backgroundColor: 'var(--color-header-bg, #4E0797)',
            color: 'var(--color-header-text, #ffffff)'
          }}
        >
          <span>Menu</span>
          <button onClick={() => setSidebarOpen(false)}><X style={{ color: 'var(--color-header-text, #ffffff)' }} /></button>
        </div>
        <div className="py-2">
          <button onClick={() => { navigate('/'); setSidebarOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 border-l-4 border-transparent hover:border-brand-purple font-medium text-gray-700">
            Início
          </button>
          <div className="border-t border-gray-100 my-2" />
          {categories.map(cat => (
            <button key={cat.id} onClick={() => {
              navigate('/');
              setTimeout(() => document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' }), 100);
              setSidebarOpen(false);
            }} className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-600 flex items-center gap-2">
              <span>{cat.icon}</span> {cat.title}
            </button>
          ))}
          <div className="border-t border-gray-100 my-2" />
          <button onClick={() => setShowPassword(true)} className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-600 flex items-center justify-center gap-2">
            <LockIcon size={24} />
          </button>
        </div>
      </div>

      {showPassword && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-center">Acesso Restrito</h3>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="w-full p-3 border rounded-lg mb-4 text-center text-lg bg-gray-50 outline-none focus:ring-2 focus:ring-brand-purple"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => setShowPassword(false)} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold text-gray-700">Cancelar</button>
              <button onClick={handleAdminAccess} className="flex-1 py-3 bg-brand-purple text-white rounded-lg font-bold">Entrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
