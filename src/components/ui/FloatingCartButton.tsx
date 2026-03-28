import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const FloatingCartButton: React.FC = () => {
  const { cart, slug } = useApp();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0);
  const navigate = useNavigate();

  const [animate, setAnimate] = useState(false);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 400);
      return () => clearTimeout(timer);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  if (cartCount === 0) return null;

  return (
    <button
      onClick={() => navigate(`/${slug}/cart`)}
      className={`fixed bottom-6 left-4 right-4 max-w-md mx-auto z-50 btn-press ${
        animate ? 'scale-105' : 'scale-100'
      } transition-transform duration-300`}
      aria-label="Ver carrinho"
    >
      <div
        className="flex items-center justify-between px-5 py-3.5 rounded-2xl text-white shadow-float"
        style={{ backgroundColor: 'var(--color-button-primary)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <ShoppingCart size={18} className="text-white" />
          </div>
          <span className="font-bold text-sm">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
        </div>

        <span className="font-heading font-bold text-sm tracking-wide">VER CARRINHO</span>

        <span className="font-bold text-sm">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
        </span>
      </div>
    </button>
  );
};
