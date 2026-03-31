import React, { useState, createContext, useContext, useEffect, useMemo, Component } from 'react';
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
// O hook usePersistedState agora é interno ao AppProvider para acessar currentSlug se necessário
// ou removido em favor de lógica explícita para evitar conflitos de ciclo de vida.

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
  slug: string | null;
  isConfigured: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  localUiMode: 'modern' | 'classic';
  setLocalUiMode: (mode: 'modern' | 'classic') => void;
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
  // Persistence state (Managed manually to be slug-aware)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<Role>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoaded, setCouponLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);

  const isStorageLoaded = roleLoaded && couponLoaded; // Cart load is slug-dependent

  // Supabase state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>(mockSettings);
  const [searchTerm, setSearchTerm] = useState('');
  const [localUiMode, setLocalUiMode] = useState<'modern' | 'classic'>('modern');

  const [isStoreOpen, setIsStoreOpen] = useState(false);

  // Store status update
  useEffect(() => {
    const status = calculateStoreStatus(settings);
    setIsStoreOpen(status);
  }, [settings]);

  // Update browser tab title
  useEffect(() => {
    if (settings && settings.storeName) {
      document.title = `${settings.storeName} | Delivery`;
    }
  }, [settings?.storeName]);

  // Manuelly parse slug from URL because we are outside <Routes>
  const currentSlug = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length > 0 && !['admin', 'platform', 'setup', 'cart', 'checkout'].includes(parts[0])) {
      return parts[0];
    }
    // Handle HashRouter case if needed
    const cleanHash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    const hashParts = cleanHash.split('/').filter(Boolean);
    if (hashParts.length > 0 && !['admin', 'platform', 'setup', 'cart', 'checkout'].includes(hashParts[0])) {
      return hashParts[0];
    }
    return null;
  }, [location.pathname, location.hash]);

  // Load Persistence (Role & Global things)
  useEffect(() => {
    const loadGlobal = async () => {
      const { value: r } = await Preferences.get({ key: 'adminRole' });
      if (r) setAdminRole(JSON.parse(r));
      setRoleLoaded(true);

      const { value: c } = await Preferences.get({ key: 'appliedCoupon' });
      if (c) setAppliedCoupon(JSON.parse(c));
      setCouponLoaded(true);
    };
    loadGlobal();
  }, []);

  // Save Global Persistence
  useEffect(() => {
    if (roleLoaded) Preferences.set({ key: 'adminRole', value: JSON.stringify(adminRole) });
  }, [adminRole, roleLoaded]);

  useEffect(() => {
    if (couponLoaded) Preferences.set({ key: 'appliedCoupon', value: JSON.stringify(appliedCoupon) });
  }, [appliedCoupon, couponLoaded]);

  // Namespace Cart by Slug
  useEffect(() => {
    const loadCart = async () => {
      setCartLoaded(false);
      if (!currentSlug) {
        setCart([]);
        setCartLoaded(true);
        return;
      }
      const key = `cart_${currentSlug}`;
      const { value } = await Preferences.get({ key });
      if (value) {
        setCart(JSON.parse(value));
      } else {
        setCart([]);
      }
      setCartLoaded(true);
    };
    loadCart();
  }, [currentSlug]);

  useEffect(() => {
    if (cartLoaded && currentSlug) {
      const key = `cart_${currentSlug}`;
      Preferences.set({ key, value: JSON.stringify(cart) });
    }
  }, [cart, currentSlug, cartLoaded]);

  // Initial data fetch
  useEffect(() => {
    const init = async () => {
      // If we are not in a store route (e.g. /, /admin, /platform), we don't need a store context
      const isPlatformRoute = ['/', '/admin', '/platform', '/setup'].includes(location.pathname);
      
      if (isPlatformRoute) {
        setStore(null);
        setSettings(mockSettings);
        setLoading(false);
        return;
      }

      if (!currentSlug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        if (isConfigured && currentSlug) {
          // Tenta buscar a loja pelo slug
          const { data: storeData, error: storeError } = await supabase
            .from('stores')
            .select('*')
            .eq('slug', currentSlug)
            .single();

          if (!storeError && storeData) {
            setStore(storeData);
            // Busca os dados reais
            await Promise.all([
              fetchProducts(storeData.id),
              fetchCategories(storeData.id),
              fetchGroups(storeData.id),
              fetchCoupons(storeData.id),
              fetchOrders(storeData.id),
              fetchSettings(storeData.id)
            ]);
            setLoading(false);
            return;
          }
          console.warn('Loja não encontrada no Supabase, usando dados mock como fallback:', currentSlug);
        }

        // Fallback para Dados Mock (se não configurado ou loja não encontrada)
        setProducts(mockProducts);
        setCategories(mockCategories);
        setGroups(mockGroups);
        setCoupons(mockCoupons);
        setSettings(mockSettings);
        
        // Se temos um slug mas não achamos na DB, criamos um objeto de loja mock 
        if (currentSlug) {
           setStore({ id: '00000000-0000-0000-0000-000000000001', slug: currentSlug, name: 'Nova Loja' });
        }
      } catch (error) {
        console.error('Erro crítico no AppContext:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isStorageLoaded && cartLoaded) {
      init();
    }
  }, [isStorageLoaded, cartLoaded, currentSlug, location.pathname]);

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
      storeId: p.store_id, 
      categoryId: p.category_id,
      displayOrder: p.display_order,
      groupIds: p.product_group_relations?.map((r: any) => r.group_id) || [] 
    })));
  };

  const fetchCategories = async (storeId: string) => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .order('display_order', { ascending: true });
    if (data) setCategories(data.map((c: any) => ({
      ...c,
      storeId: c.store_id,
      displayOrder: c.display_order
    })));
  };

  const fetchGroups = async (storeId: string) => {
    const { data } = await supabase
      .from('product_groups')
      .select('*, options:product_options(*)')
      .eq('store_id', storeId);
    if (data) setGroups(data.map((g: any) => ({
      ...g,
      storeId: g.store_id,
      options: g.options?.map((o: any) => ({
        ...o,
        storeId: o.store_id
      })) || []
    })));
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
    
    if (data) {
      // Normalize snake_case to camelCase for the application
      const normalizedSettings: GlobalSettings = {
        storeId: data.store_id,
        storeName: data.store_name,
        logoUrl: data.logo_url,
        logoShape: data.logo_shape,
        bannerUrl: data.banner_url,
        whatsappNumber: data.whatsapp_number,
        storeStatus: data.store_status,
        deliveryFee: data.delivery_fee,
        deliveryOnly: data.delivery_only,
        openingHours: data.opening_hours || [],
        themeColors: data.theme_colors,
        closedMessage: data.closed_message,
        openMessage: data.open_message,
        deliveryTime: data.delivery_time,
        pickupTime: data.pickup_time,
        deliveryCloseTime: data.delivery_close_time,
        instagramUrl: data.instagram_url,
        businessAddress: data.business_address,
        copyrightText: data.copyright_text,
        noteTitle: data.note_title,
        notePlaceholder: data.note_placeholder,
        checkoutReviewMessage: data.checkout_review_message,
        uiMode: data.ui_mode
      };
      setSettings(normalizedSettings);
      setLocalUiMode(data.ui_mode as any || 'classic');
    } else {
      setSettings(mockSettings);
    }
  };

  // Actions
  const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
  const removeFromCart = (cartId: string) => setCart(prev => prev.filter(item => item.cartId !== cartId));
  const updateCartQuantity = (cartId: string, quantity: number) => {
    setCart(prev => quantity <= 0 ? prev.filter(item => item.cartId !== cartId) : prev.map(item => item.cartId === cartId ? { ...item, quantity } : item));
  };
  const updateCartNote = (cartId: string, note: string) => setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, note } : item));
  const clearCart = () => setCart([]);

  const addProduct = async (p: any) => {
    if (isConfigured && store) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          store_id: store.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image,
          category_id: p.categoryId,
          display_order: p.displayOrder || 0,
          active: p.active ?? true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding product:', error);
        return;
      }

      // Handle group relations if any
      if (p.groupIds && p.groupIds.length > 0) {
        const relations = p.groupIds.map((gid: string) => ({
          product_id: data.id,
          group_id: gid
        }));
        await supabase.from('product_group_relations').insert(relations);
      }
      
      await fetchProducts(store.id);
    } else {
      setProducts(prev => [...prev, p]);
    }
  };

  const updateProduct = async (p: any) => {
    if (isConfigured && store) {
      const { error } = await supabase
        .from('products')
        .update({
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image,
          category_id: p.categoryId,
          display_order: p.displayOrder,
          active: p.active
        })
        .match({ id: p.id, store_id: store.id });

      if (error) {
          console.error('Error updating product:', error);
          return;
      }

      // Handle group relations (simplified: clear and re-insert)
      if (p.groupIds !== undefined) {
        await supabase.from('product_group_relations').delete().eq('product_id', p.id);
        if (p.groupIds.length > 0) {
          const relations = p.groupIds.map((gid: string) => ({
            product_id: p.id,
            group_id: gid
          }));
          await supabase.from('product_group_relations').insert(relations);
        }
      }
      
      await fetchProducts(store.id);
    } else {
      setProducts(prev => prev.map(old => old.id === p.id ? { ...old, ...p } : old));
    }
  };

  const deleteProduct = async (id: string) => {
    if (isConfigured && store) {
      const { error } = await supabase.from('products').delete().match({ id, store_id: store.id });
      if (error) console.error('Error deleting product:', error);
      else await fetchProducts(store.id);
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const reorderProducts = async (catId: string, prods: any[]) => {
    if (isConfigured && store) {
      const updates = prods.map((p, idx) => ({
        id: p.id,
        store_id: store.id,
        display_order: idx + 1
      }));
      // Using upsert for bulk update of display_order
      const { error } = await supabase.from('products').upsert(updates);
      if (error) console.error('Error reordering products:', error);
      else await fetchProducts(store.id);
    } else {
      setProducts(prev => {
        const otherCats = prev.filter(p => p.categoryId !== catId);
        const updatedProds = prods.map((p, idx) => ({ ...p, displayOrder: idx + 1 }));
        return [...otherCats, ...updatedProds];
      });
    }
  };

  const addCategory = async (c: any) => {
    if (isConfigured && store) {
      const { error } = await supabase
        .from('categories')
        .insert({
          store_id: store.id,
          title: c.title,
          icon: c.icon,
          display_order: c.displayOrder || 0,
          active: c.active ?? true
        });
      if (error) console.error('Error adding category:', error);
      else await fetchCategories(store.id);
    } else {
      setCategories(prev => [...prev, c]);
    }
  };

  const updateCategory = async (c: any) => {
    if (isConfigured && store) {
      const { error } = await supabase
        .from('categories')
        .update({
          title: c.title,
          icon: c.icon,
          display_order: c.displayOrder,
          active: c.active
        })
        .match({ id: c.id, store_id: store.id });
      if (error) console.error('Error updating category:', error);
      else await fetchCategories(store.id);
    } else {
      setCategories(prev => prev.map(old => old.id === c.id ? { ...old, ...c } : old));
    }
  };

  const deleteCategory = async (id: string) => {
    if (isConfigured && store) {
      const { error } = await supabase.from('categories').delete().match({ id, store_id: store.id });
      if (error) console.error('Error deleting category:', error);
      else await fetchCategories(store.id);
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const addGroup = async (g: any) => {
    if (isConfigured && store) {
       const { data, error } = await supabase
        .from('product_groups')
        .insert({
          store_id: store.id,
          title: g.title,
          min: g.min,
          max: g.max,
          active: g.active ?? true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding group:', error);
        return;
      }

      // Handle options
      if (g.options && g.options.length > 0) {
        const optionsData = g.options.map((o: any) => ({
          group_id: data.id,
          name: o.name,
          price: o.price,
          description: o.description,
          active: o.active ?? true
        }));
        await supabase.from('product_options').insert(optionsData);
      }
      
      await fetchGroups(store.id);
    } else {
      setGroups(prev => [...prev, g]);
    }
  };

  const updateGroup = async (g: any) => {
    if (isConfigured && store) {
      const { error } = await supabase
        .from('product_groups')
        .update({
          title: g.title,
          min: g.min,
          max: g.max,
          active: g.active
        })
        .match({ id: g.id, store_id: store.id });

      if (error) {
          console.error('Error updating group:', error);
          return;
      }

      // Handle options (clear and re-insert)
      if (g.options !== undefined) {
        await supabase.from('product_options').delete().eq('group_id', g.id);
        if (g.options.length > 0) {
          const optionsData = g.options.map((o: any) => ({
            group_id: g.id,
            name: o.name,
            price: o.price,
            description: o.description,
            active: o.active ?? true
          }));
          await supabase.from('product_options').insert(optionsData);
        }
      }
      
      await fetchGroups(store.id);
    } else {
      setGroups(prev => prev.map(old => old.id === g.id ? { ...old, ...g } : old));
    }
  };

  const deleteGroup = async (id: string) => {
    if (isConfigured && store) {
       const { error } = await supabase.from('product_groups').delete().match({ id, store_id: store.id });
       if (error) console.error('Error deleting group:', error);
       else await fetchGroups(store.id);
    } else {
      setGroups(prev => prev.filter(g => g.id !== id));
    }
  };

  const addCoupon = async (c: any) => {
     if (isConfigured && store) {
       const { error } = await supabase
        .from('coupons')
        .insert({
          store_id: store.id,
          code: c.code,
          type: c.type,
          value: c.value,
          min_order_value: c.minOrderValue,
          active: c.active ?? true
        });
      if (error) console.error('Error adding coupon:', error);
      else await fetchCoupons(store.id);
    } else {
      setCoupons(prev => [...prev, c]);
    }
  };

  const updateCoupon = async (c: any) => {
    if (isConfigured && store) {
      const { error } = await supabase
        .from('coupons')
        .update({
          code: c.code,
          type: c.type,
          value: c.value,
          min_order_value: c.minOrderValue,
          active: c.active
        })
        .match({ id: c.id, store_id: store.id });
      if (error) console.error('Error updating coupon:', error);
      else await fetchCoupons(store.id);
    } else {
      setCoupons(prev => prev.map(old => old.id === c.id ? { ...old, ...c } : old));
    }
  };

  const deleteCoupon = async (id: string) => {
    if (isConfigured && store) {
      const { error } = await supabase.from('coupons').delete().match({ id, store_id: store.id });
      if (error) console.error('Error deleting coupon:', error);
      else await fetchCoupons(store.id);
    } else {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateSettings = async (s: Partial<GlobalSettings>) => {
    const updated = { ...settings, ...s };
    setSettings(updated as GlobalSettings);

    if (isConfigured) {
      // Map camelCase to snake_case for Supabase
      const payload: any = {};
      if (s.storeName !== undefined) payload.store_name = s.storeName;
      if (s.logoUrl !== undefined) payload.logo_url = s.logoUrl;
      if (s.logoShape !== undefined) payload.logo_shape = s.logoShape;
      if (s.bannerUrl !== undefined) payload.banner_url = s.bannerUrl;
      if (s.whatsappNumber !== undefined) payload.whatsapp_number = s.whatsappNumber;
      if (s.storeStatus !== undefined) payload.store_status = s.storeStatus;
      if (s.deliveryFee !== undefined) payload.delivery_fee = s.deliveryFee;
      if (s.deliveryOnly !== undefined) payload.delivery_only = s.deliveryOnly;
      if (s.openingHours !== undefined) payload.opening_hours = s.openingHours;
      if (s.themeColors !== undefined) payload.theme_colors = s.themeColors;
      if (s.closedMessage !== undefined) payload.closed_message = s.closedMessage;
      if (s.openMessage !== undefined) payload.open_message = s.openMessage;
      if (s.deliveryTime !== undefined) payload.delivery_time = s.deliveryTime;
      if (s.pickupTime !== undefined) payload.pickup_time = s.pickupTime;
      if (s.deliveryCloseTime !== undefined) payload.delivery_close_time = s.deliveryCloseTime;
      if (s.instagramUrl !== undefined) payload.instagram_url = s.instagramUrl;
      if (s.businessAddress !== undefined) payload.business_address = s.businessAddress;
      if (s.copyrightText !== undefined) payload.copyright_text = s.copyrightText;
      if (s.noteTitle !== undefined) payload.note_title = s.noteTitle;
      if (s.notePlaceholder !== undefined) payload.note_placeholder = s.notePlaceholder;
      if (s.checkoutReviewMessage !== undefined) payload.checkout_review_message = s.checkoutReviewMessage;
      if (s.uiMode !== undefined) payload.ui_mode = s.uiMode;

      await supabase.from('settings').update(payload).eq('store_id', store?.id);
    }
  };

  const applyCoupon = (code: string) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) return { success: false, message: 'Cupom inválido ou expirado.' };
    setAppliedCoupon(coupon);
    return { success: true, message: `Cupom ${coupon.code} aplicado!` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const addOrder = async (o: OrderRecord) => {
    if (isConfigured && store) {
      const { error } = await supabase
        .from('orders')
        .insert({
          store_id: store.id,
          customer_name: o.customerName,
          whatsapp: o.whatsapp,
          method: o.method,
          address: o.address,
          payment_method: o.paymentMethod,
          total: o.total,
          items_summary: o.itemsSummary,
          full_details: o.fullDetails,
          status: o.status,
          discount_percent: o.discountPercent,
          is_quote: o.isQuote
        });
      if (error) console.error('Error adding order:', error);
      else await fetchOrders(store.id);
    } else {
      setOrders(prev => [o, ...prev]);
    }
  };

  const updateOrderStatus = async (id: string, s: OrderStatus) => {
    if (isConfigured && store) {
      const { error } = await supabase
        .from('orders')
        .update({ status: s })
        .match({ id, store_id: store.id });
      if (error) console.error('Error updating order status:', error);
      else await fetchOrders(store.id);
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: s } : o));
    }
  };

  const deleteOrder = async (id: string) => {
    if (isConfigured && store) {
      const { error } = await supabase.from('orders').delete().match({ id, store_id: store.id });
      if (error) console.error('Error deleting order:', error);
      else await fetchOrders(store.id);
    } else {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };
  const copyOrderToClipboard = (o: OrderRecord) => { /* logic */ };

  const contextValue: AppContextType = {
    products, categories, groups, cart, settings, coupons, orders, adminRole,
    appliedCoupon, applyCoupon, removeCoupon, addToCart, removeFromCart,
    updateCartQuantity, updateCartNote, clearCart, addProduct, updateProduct,
    deleteProduct, reorderProducts, addCategory, updateCategory, deleteCategory,
    addGroup, updateGroup, deleteGroup, addCoupon, updateCoupon, deleteCoupon,
    updateSettings, setAdminRole, addOrder, updateOrderStatus, deleteOrder,
    copyOrderToClipboard, checkStoreStatus: () => isStoreOpen ? 'open' : 'closed',
    isStoreOpen, isSidebarOpen, setSidebarOpen, loading, store,
    slug: currentSlug, isConfigured, searchTerm, setSearchTerm,
    localUiMode, setLocalUiMode
  };

  return (
    <AppContext.Provider value={contextValue}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </AppContext.Provider>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Ops! Algo deu errado.</h1>
          <pre className="p-4 bg-white border border-red-200 rounded-lg overflow-auto whitespace-pre-wrap text-sm">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-bold"
          >
            Recarregar Página
          </button>
        </div>
      );
    }
    return (this.props as any).children;
  }
}
