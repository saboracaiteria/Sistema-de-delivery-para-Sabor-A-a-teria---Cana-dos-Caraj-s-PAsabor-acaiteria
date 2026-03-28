import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ShoppingCart } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Header: React.FC = () => {
  const { setSidebarOpen, settings, cart, slug } = useApp();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sticky top-0 z-40 header-glass transition-all duration-300"
      style={{
        backgroundColor: 'var(--color-header-bg, #4E0797)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.25)'
      }}
    >
      <div className="max-w-lg mx-auto w-full flex items-center justify-between">
        {/* Menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors btn-press"
          aria-label="Abrir menu"
        >
          <Menu size={24} style={{ color: 'var(--color-header-text, #ffffff)' }} />
        </button>

        {/* Store name - centered */}
        <div className="flex flex-col items-center">
          <span
            className="font-heading font-bold text-lg leading-tight tracking-wide"
            style={{ color: 'var(--color-header-text, #ffffff)', fontFamily: 'Poppins, sans-serif' }}
          >
            {settings.storeName || 'Açaíteria'}
          </span>
        </div>

        {/* Cart icon shortcut */}
        <button
          onClick={() => navigate(`/${slug}/cart`)}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors btn-press relative"
          aria-label="Ver carrinho"
        >
          <ShoppingCart size={22} style={{ color: 'var(--color-header-text, #ffffff)' }} />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
