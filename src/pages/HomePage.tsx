import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ProductCarousel } from '../components/ui/ProductCarousel';
import { Footer } from '../components/layout/Footer';

export const HomePage: React.FC = () => {
  const { categories, products, settings, isStoreOpen } = useApp();
  const status = isStoreOpen ? 'open' : 'closed';
  const activeCategories = categories.filter(cat => cat.active !== false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* === HERO SECTION === */}
      <div className="relative">
        {settings.bannerUrl ? (
          <div className="w-full h-52 md:h-64 overflow-hidden relative">
            <img src={settings.bannerUrl} alt="Banner da loja" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-36 relative" style={{ background: 'linear-gradient(135deg, var(--color-header-bg) 0%, #7c3aed 100%)' }}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 0), radial-gradient(circle at 80% 20%, white 1px, transparent 0), radial-gradient(circle at 50% 50%, white 0.5px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
        )}

        <div className="absolute -bottom-14 left-0 right-0 flex justify-center">
          <div className={`p-1.5 shadow-xl ${settings.logoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`} style={{ background: 'white' }}>
            <img src={settings.logoUrl} alt={settings.storeName || 'Logo'} className={`w-28 h-28 object-cover ${settings.logoShape === 'circle' ? 'rounded-full' : 'rounded-xl'}`} />
          </div>
        </div>
      </div>

      <div className="h-16" />

      <div className="px-4 mt-2">
        <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
          <div className="text-center mb-3">
            <h1 className="font-heading font-bold text-xl text-gray-800">{settings.storeName || 'Sabor Açaíteria'}</h1>
          </div>

          <div className="flex flex-col items-center gap-2 mb-3">
            {status === 'closed' ? (
              <span className="status-closed inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-full font-semibold text-sm tracking-wide">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {settings.closedMessage || 'Loja Fechada'}
              </span>
            ) : (
              <span className="status-open inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-full font-semibold text-sm tracking-wide">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {settings.openMessage || 'Aberto Agora'}
              </span>
            )}
            {settings.deliveryOnly && status === 'open' && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-1.5 rounded-full font-medium text-xs">
                📦 Somente retirada
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                <Clock size={12} />
                <span>Entrega</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{settings.deliveryTime || '40min–1h'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                <Clock size={12} />
                <span>Retirada</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{settings.pickupTime || '20–45min'}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-xs font-medium">
              Entregas encerram às <strong>{settings.deliveryCloseTime || '21:00'}h</strong>
            </p>
          </div>
        </div>

        {activeCategories.length > 1 && (
          <div className="flex overflow-x-auto no-scrollbar gap-2 mb-5 pb-0.5">
            {activeCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-purple-300 hover:text-purple-600 transition-colors shadow-sm active:scale-95 btn-press"
              >
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            ))}
          </div>
        )}

        <div className="space-y-7 pb-32">
          {activeCategories.map(cat => {
            const catProducts = products.filter(p => p.categoryId === cat.id && p.active !== false);
            return (
              <section key={cat.id} id={`cat-${cat.id}`} className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <h2 className="font-heading font-bold text-lg text-gray-800">{cat.title}</h2>
                  <span className="ml-auto text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                    {catProducts.length} itens
                  </span>
                </div>

                {catProducts.length === 0 ? (
                  <div className="bg-white border border-gray-100 rounded-2xl py-10 px-4 text-center shadow-card">
                    <span className="text-3xl mb-2 block">🍽️</span>
                    <p className="text-gray-400 text-sm">Nenhum produto disponível agora</p>
                  </div>
                ) : (
                  <ProductCarousel products={catProducts} />
                )}
              </section>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};
