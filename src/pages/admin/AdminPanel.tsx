import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Settings, BarChart2, List, Folder, ToggleLeft, Tag, Palette, Package, Printer, LogOut, Database } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const AdminPanel: React.FC = () => {
  const { adminRole, setAdminRole } = useApp();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    if (!adminRole) navigate(`/${slug}`);
  }, [adminRole, navigate, slug]);

  const menuItems = [
    { title: 'Pedidos', icon: <FileText size={24} />, path: '/panel/orders', role: ['admin', 'employee'] },
    { title: 'Configurações', icon: <Settings size={24} />, path: '/panel/settings', role: ['admin'] },
    { title: 'Relatório', icon: <BarChart2 size={24} />, path: '/panel/reports', role: ['admin'] },
    { title: 'Categorias', icon: <List size={24} />, path: '/panel/categories', role: ['admin'] },
    { title: 'Produtos', icon: <Folder size={24} />, path: '/panel/products', role: ['admin'] },
    { title: 'Adicionais', icon: <ToggleLeft size={24} />, path: '/panel/addons', role: ['admin'] },
    { title: 'Cupons', icon: <Tag size={24} />, path: '/panel/coupons', role: ['admin'] },
    { title: 'Cores do Site', icon: <Palette size={24} />, path: '/panel/theme', role: ['admin'] },
    { title: 'Estoque', icon: <Package size={24} />, path: '/panel/inventory', role: ['admin'] },
    { title: 'Impressora', icon: <Printer size={24} />, path: '/panel/printer', role: ['admin', 'employee'] },
    { title: 'Setup DB', icon: <Database size={24} />, path: '/panel/database', role: ['admin'] },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
    <div className="flex justify-between items-center mb-6 text-2xl font-bold text-gray-800">
        <div>Painel Administrativo</div>
        <button onClick={() => { setAdminRole(null); navigate(`/${slug}`); }} className="text-red-600 flex items-center gap-2 font-bold p-2 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={20} /> Sair
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {menuItems.filter(item => item.role.includes(adminRole || '')).map((item) => (
          <div
            key={item.title}
            onClick={() => navigate(`/${slug}${item.path}`)}
            className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer min-h-[100px]"
          >
            <div className="text-gray-600">{item.icon}</div>
            <span className="font-medium text-gray-700 text-sm text-center">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
