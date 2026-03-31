import React, { useState, useEffect, Component } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
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

const StorefrontWrapper = () => {
  const { localUiMode } = useApp();
  return localUiMode === 'modern' ? <ModernUI /> : <HomePage />;
};

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
  
  // Remove Global Headers and Carts from /cart, and /checkout
  // Since they implement their own immersive local UI components.
  const isStorefront = isStoreSpecificRoute && (pathParts.length === 1 || pathParts[1] === 'modern');
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
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
      {isStorefront && <Header />}

      <Routes>
        {/* === Rotas da Plataforma (Nível Superior) === */}
        <Route path="/" element={<PlatformHome />} />
        <Route path="/admin" element={<LoginPage />} />
        <Route path="/platform" element={<PlatformAdminPanel />} />
        <Route path="/setup" element={<SetupPage />} />

        {/* === Rotas da Loja (Baseadas no Slug) === */}
        <Route path="/:slug" element={<StorefrontWrapper />} />
        <Route path="/:slug/cart" element={<CartPage />} />
        <Route path="/:slug/checkout" element={<CheckoutPage />} />
        
        {/* Redirecionar rotas antigas para as rotas limpas */}
        <Route path="/:slug/modern" element={<Navigate to="/:slug" replace />} />

        {/* === Rotas Administrativas da Loja === */}
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
