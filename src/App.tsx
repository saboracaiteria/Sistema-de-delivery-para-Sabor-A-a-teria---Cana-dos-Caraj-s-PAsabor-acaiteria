import React, { useState, useEffect, Component } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

import { AppProvider, useApp } from './contexts/AppContext';
import { PrinterProvider } from './PrinterContext';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { FloatingCartButton } from './components/ui/FloatingCartButton';
import { ExitModal } from './components/ui/ExitModal';

import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

import { AdminPanel } from './pages/admin/AdminPanel';
import { OrdersPage } from './pages/admin/OrdersPage';
import { CouponsPage } from './pages/admin/CouponsPage';
import { AddonsPage } from './pages/admin/AddonsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { ThemeSettingsPage } from './pages/admin/ThemeSettingsPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { PrinterSettingsPage } from './pages/admin/PrinterSettingsPage';
import { DatabaseSetup } from './pages/admin/DatabaseSetup';

import { PlatformHome } from './pages/PlatformHome';
import { LoginPage } from './pages/LoginPage';
import { PlatformAdminPanel } from './pages/PlatformAdminPanel';
import { SetupPage } from './pages/SetupPage';
import { ModernUI } from './pages/ModernUI';

const AppContent = () => {
  const {
    categories, addCategory, updateCategory, deleteCategory,
    products, addProduct, updateProduct, deleteProduct, reorderProducts,
    groups, orders, loading, settings
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  const isPlatformHome = location.pathname === '/';
  const isAdminRoute = location.pathname.includes('/panel') || location.pathname.startsWith('/platform') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/setup');
  const isStoreSpecificRoute = !isPlatformHome && !isAdminRoute;
  
  // Remove Global Headers and Carts from /modern, /cart, and /checkout
  // Since they implement their own immersive local UI components.
  // We also ensure uiMode isn't 'modern' to avoid a brief flash before redirect
  const isClassicStorefront = isStoreSpecificRoute && pathParts.length === 1 && settings?.uiMode !== 'modern';
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const handleBackButton = async () => {
      if (location.pathname === '/') {
        setShowExitModal(true);
      } else {
        navigate(-1);
      }
    };

    const listener = CapacitorApp.addListener('backButton', handleBackButton);
    return () => {
      listener.then(l => l.remove());
    };
  }, [location, navigate]);

  const handleConfirmExit = () => {
    CapacitorApp.exitApp();
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #2d0d5a 0%, #4E0797 50%, #7c3aed 100%)' }}
      >
        <div className="absolute w-72 h-72 rounded-full opacity-10 bg-white" style={{ top: '-10%', right: '-15%' }} />
        <div className="absolute w-48 h-48 rounded-full opacity-10 bg-white" style={{ bottom: '-5%', left: '-10%' }} />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="text-7xl animate-bounce" style={{ animationDuration: '1.2s' }}>🍇</div>
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-white/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-white font-heading font-bold text-xl tracking-wide">Carregando...</p>
            <p className="text-purple-200 text-sm mt-1">Preparando os melhores sabores 🍨</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:pb-0">
      <ExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
      {isClassicStorefront && <Header />}

      <Routes>
        {/* === Rotas da Plataforma (Nível Superior) === */}
        <Route path="/" element={<PlatformHome />} />
        <Route path="/admin" element={<LoginPage />} />
        <Route path="/platform" element={<PlatformAdminPanel />} />
        <Route path="/setup" element={<SetupPage />} />

        {/* === Rotas da Loja (Baseadas no Slug) === */}
        <Route path="/:slug" element={<HomePage />} />
        <Route path="/:slug/modern" element={<ModernUI />} />
        <Route path="/:slug/cart" element={<CartPage />} />
        <Route path="/:slug/checkout" element={<CheckoutPage />} />

        {/* --- Painel Admin da Loja --- */}
        <Route path="/:slug/panel" element={<AdminPanel />} />
        <Route path="/:slug/panel/orders" element={<OrdersPage />} />
        <Route path="/:slug/panel/coupons" element={<CouponsPage />} />
        <Route path="/:slug/panel/addons" element={<AddonsPage />} />
        <Route path="/:slug/panel/settings" element={<SettingsPage />} />
        <Route path="/:slug/panel/theme" element={<ThemeSettingsPage />} />
        <Route path="/:slug/panel/inventory" element={<InventoryPage products={products} />} />
        <Route path="/:slug/panel/printer" element={<PrinterSettingsPage />} />
        <Route path="/:slug/panel/database" element={<DatabaseSetup />} />

        <Route path="/:slug/panel/categories" element={
          <CategoriesPage
            categories={categories}
            addCategory={addCategory}
            updateCategory={updateCategory}
            deleteCategory={deleteCategory}
          />
        } />

        <Route path="/:slug/panel/products" element={
          <ProductsPage
            products={products}
            categories={categories}
            groups={groups}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
            reorderProducts={reorderProducts}
          />
        } />

        <Route path="/:slug/panel/reports" element={
          <ReportsPage orders={orders} />
        } />

        {/* Fallback para rotas legadas ou sem slug (usa slug padrão se configurado no AppContext) */}
        <Route path="/panel/*" element={<AdminPanel />} />
      </Routes>

      {isStoreSpecificRoute && <Sidebar />}
      {isClassicStorefront && <FloatingCartButton />}
    </div>
  );
};



const App = () => (
  <HashRouter>
    <AppProvider>
      <PrinterProvider>
        <AppContent />
      </PrinterProvider>
    </AppProvider>
  </HashRouter>
);

export default App;
