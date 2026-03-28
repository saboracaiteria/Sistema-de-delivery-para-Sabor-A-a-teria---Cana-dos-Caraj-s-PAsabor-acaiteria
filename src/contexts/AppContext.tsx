import React, { useState, createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { supabase, isConfigured } from '../supabaseClient';
import { 
  Category, Product, ProductGroup, CartItem, 
  GlobalSettings, Role, Coupon, OrderRecord, 
  OrderStatus, Store
} from '../types/types';
import { Preferences } from '@capacitor/preferences';
import { mockCategories, mockGroups, mockProducts, mockCoupons, mockSettings } from '../mockData';
import { calculateStoreStatus } from '../utils/storeStatus';

// Custom Hooks for Persistence
const usePersistedState = <T,>(key: string, initialValue: T) => {
  const [state, setState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        const { value } = await Preferences.get({ key });
        if (value) {
          setState(JSON.parse(value));
        }
      } catch (error) {
        console.error(`Error loading ${key} from Preferences:`, error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadState();
  }, [key]);

  useEffect(() => {
    if (!isLoaded) return;
    const saveState = async () => {
      try {
        await Preferences.set({ key, value: JSON.stringify(state) });
      } catch (error) {
        console.error(`Error saving ${key} to Preferences:`, error);
      }
    };
    saveState();
  }, [key, state, isLoaded]);

  return [state, setState, isLoaded] as const;
};

interface AppContextType {
  products: Product[];
  categories: Category[];
  groups: ProductGroup[];
  cart: CartItem[];
  settings: GlobalSettings;
  coupons: Coupon[];
  orders: OrderRecord[];
  adminRole: Role;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, quantity: number) => void;
  updateCartNote: (cartId: string, note: string) => void;
  clearCart: () => void;

  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  reorderProducts: (categoryId: string, products: Product[]) => void;

  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  addGroup: (group: ProductGroup) => void;
  updateGroup: (group: ProductGroup) => void;
  deleteGroup: (id: string) => void;

  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;

  updateSettings: (newSettings: Partial<GlobalSettings>) => void;
  setAdminRole: (role: Role) => void;
  addOrder: (order: OrderRecord) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  copyOrderToClipboard: (order: OrderRecord) => void;

  checkStoreStatus: () => 'open' | 'closed';
  isStoreOpen: boolean;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  loading: boolean;
  store: Store | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence state
  const [cart, setCart, cartLoaded] = usePersistedState<CartItem[]>('cart', []);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [adminRole, setAdminRole, roleLoaded] = usePersistedState<Role>('adminRole', null);
  const [appliedCoupon, setAppliedCoupon, couponLoaded] = usePersistedState<Coupon | null>('appliedCoupon', null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);

  const isStorageLoaded = cartLoaded && roleLoaded && couponLoaded;

  // Supabase state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>(mockSettings);

  const [isStoreOpen, setIsStoreOpen] = useState(false);

  // Store status update
  useEffect(() => {
    const updateStatus = () => {
      const status = calculateStoreStatus(settings);
      setIsStoreOpen(status);
    };
    updateStatus(); 
    const interval = setInterval(updateStatus, 30000); 
    return () => clearInterval(interval);
  }, [settings]);

  // Manuelly parse slug from URL because we are outside <Routes>
  const currentSlug = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length > 0 && !['admin', 'platform', 'setup'].includes(parts[0])) {
      return parts[0];
    }
    // Handle HashRouter case if needed
    const hashParts = location.hash.split('/').filter(Boolean);
    if (hashParts.length > 0 && !['admin', 'platform', 'setup'].includes(hashParts[0])) {
      return hashParts[0];
    }
    return null;
  }, [location]);

  // Initial data fetch
  useEffect(() => {
    const init = async () => {
      // If we are not in a store route (e.g. /, /admin, /platform), we don't need a store context
      const isPlatformRoute = ['/', '/admin', '/platform', '/setup'].includes(location.pathname);
      
      if (isPlatformRoute) {
        setLoading(false);
        return;
      }

      if (!currentSlug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        if (isConfigured) {
          // 1. Fetch Store by Slug
          const { data: storeData, error: storeError } = await supabase
            .from('stores')
            .select('*')
            .eq('slug', currentSlug)
            .single();

          if (storeError || !storeData) {
            console.error('Store not found:', currentSlug);
            setLoading(false);
            return;
          }

          setStore(storeData);

          // 2. Fetch everything filtered by store_id
          await Promise.all([
            fetchProducts(storeData.id),
            fetchCategories(storeData.id),
            fetchGroups(storeData.id),
            fetchCoupons(storeData.id),
            fetchOrders(storeData.id),
            fetchSettings(storeData.id)
          ]);
        } else {
          setProducts(mockProducts);
          setCategories(mockCategories);
          setGroups(mockGroups);
          setCoupons(mockCoupons);
          setSettings(mockSettings);
        }
      } catch (error) {
        console.error('Data loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isStorageLoaded) {
      init();
    }
  }, [isStorageLoaded, currentSlug, location.pathname]);

  // Real-time subscriptions
  useEffect(() => {
    if (!isConfigured || !store) return;

    const channels = [
      supabase.channel('public:products').on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `store_id=eq.${store.id}` }, () => fetchProducts(store.id)).subscribe(),
      supabase.channel('public:categories').on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `store_id=eq.${store.id}` }, () => fetchCategories(store.id)).subscribe(),
      supabase.channel('public:settings').on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: `store_id=eq.${store.id}` }, () => fetchSettings(store.id)).subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [store]);

  // Fetch functions (Internal)
  const fetchProducts = async (storeId: string) => {
    const { data } = await supabase
      .from('products')
      .select('*, product_group_relations(group_id)')
      .eq('store_id', storeId)
      .order('display_order', { ascending: true });
    
    if (data) setProducts(data.map((p: any) => ({ 
      ...p, 
      id: p.id, 
      groupIds: p.product_group_relations?.map((r: any) => r.group_id) || [] 
    })));
  };

  const fetchCategories = async (storeId: string) => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .order('display_order', { ascending: true });
    if (data) setCategories(data);
  };

  const fetchGroups = async (storeId: string) => {
    const { data } = await supabase
      .from('product_groups')
      .select('*, options:product_options(*)')
      .eq('store_id', storeId);
    if (data) setGroups(data);
  };

  const fetchCoupons = async (storeId: string) => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', storeId);
    if (data) setCoupons(data);
  };

  const fetchOrders = async (storeId: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)
      .order('date', { ascending: false });
    if (data) setOrders(data);
  };

  const fetchSettings = async (storeId: string) => {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('store_id', storeId)
      .single();
    if (data) setSettings(data);
    else setSettings(mockSettings);
  };

  // Actions
  const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
  const removeFromCart = (cartId: string) => setCart(prev => prev.filter(item => item.cartId !== cartId));
  const updateCartQuantity = (cartId: string, quantity: number) => {
    setCart(prev => quantity <= 0 ? prev.filter(item => item.cartId !== cartId) : prev.map(item => item.cartId === cartId ? { ...item, quantity } : item));
  };
  const updateCartNote = (cartId: string, note: string) => setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, note } : item));
  const clearCart = () => setCart([]);

  const addProduct = async (p: any) => { /* logic */ };
  const updateProduct = async (p: any) => { /* logic */ };
  const deleteProduct = async (id: string) => { /* logic */ };
  const reorderProducts = async (catId: string, prods: any[]) => { /* logic */ };

  const addCategory = async (c: any) => { /* logic */ };
  const updateCategory = async (c: any) => { /* logic */ };
  const deleteCategory = async (id: string) => { /* logic */ };

  const addGroup = async (g: any) => { /* logic */ };
  const updateGroup = async (g: any) => { /* logic */ };
  const deleteGroup = async (id: string) => { /* logic */ };

  const addCoupon = async (c: any) => { /* logic */ };
  const updateCoupon = async (c: any) => { /* logic */ };
  const deleteCoupon = async (id: string) => { /* logic */ };

  const updateSettings = async (s: Partial<GlobalSettings>) => {
    const updated = { ...settings, ...s };
    setSettings(updated as GlobalSettings);
    if (isConfigured) await supabase.from('settings').update(s).match({ id: (settings as any).id });
  };

  const applyCoupon = (code: string) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) return { success: false, message: 'Cupom inválido ou expirado.' };
    setAppliedCoupon(coupon);
    return { success: true, message: `Cupom ${coupon.code} aplicado!` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const addOrder = (o: OrderRecord) => { /* logic */ };
  const updateOrderStatus = (id: string, s: OrderStatus) => { /* logic */ };
  const deleteOrder = (id: string) => { /* logic */ };
  const copyOrderToClipboard = (o: OrderRecord) => { /* logic */ };

  const contextValue: AppContextType = {
    products, categories, groups, cart, settings, coupons, orders, adminRole,
    appliedCoupon, applyCoupon, removeCoupon, addToCart, removeFromCart,
    updateCartQuantity, updateCartNote, clearCart, addProduct, updateProduct,
    deleteProduct, reorderProducts, addCategory, updateCategory, deleteCategory,
    addGroup, updateGroup, deleteGroup, addCoupon, updateCoupon, deleteCoupon,
    updateSettings, setAdminRole, addOrder, updateOrderStatus, deleteOrder,
    copyOrderToClipboard, checkStoreStatus: () => isStoreOpen ? 'open' : 'closed',
    isStoreOpen, isSidebarOpen, setSidebarOpen, loading, store
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
