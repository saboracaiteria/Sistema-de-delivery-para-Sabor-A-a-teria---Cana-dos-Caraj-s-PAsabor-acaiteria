import React, { useState, createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isConfigured } from '../supabaseClient';
import { usePersistedState } from '../usePersistedState';
import { calculateStoreStatus, formatCurrency } from '../storeUtils';
import { SUPER_ADMIN_EMAILS } from '../constants';
import { 
  Category, Product, ProductGroup, CartItem, ProductOption, 
  GlobalSettings, Role, Coupon, OrderRecord, OrderStatus, DeliveryMethod, OpeningHour
} from '../types';
import type { Store as StoreType } from '../types';
import { mockCategories, mockGroups, mockProducts, mockSettings, mockCoupons } from '../mockData';

// --- Context ---

// --- Context ---

interface AppContextType {
  store: StoreType | null;
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

  isModernUI: boolean;
  setIsModernUI: (modern: boolean) => void;

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
  updateOrderDiscount: (id: string, discountPercent: number) => Promise<void>;
  deleteOrder: (id: string) => void;
  copyOrderToClipboard: (order: OrderRecord) => void;

  checkStoreStatus: () => 'open' | 'closed';
  isStoreOpen: boolean;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<StoreType | null>(null);

  // Dados locais (apenas carrinho e estado da UI)
  const [cart, setCart, cartLoaded] = usePersistedState<CartItem[]>('cart', []);
  const currentCart = useMemo(() => cart.filter(item => item.product.storeId === store?.id), [cart, store?.id]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [adminRole, setAdminRole, roleLoaded] = usePersistedState<Role>('adminRole', null);
  const [appliedCoupon, setAppliedCoupon, couponLoaded] = usePersistedState<Coupon | null>('appliedCoupon', null);
  const [isModernUI, setIsModernUI, modernUILoaded] = usePersistedState<boolean>('isModernUI', true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isStorageLoaded = cartLoaded && roleLoaded && couponLoaded && modernUILoaded;

  // Dados do Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>({
    storeName: 'Minha Loja',
    logoUrl: '',
    logoShape: 'circle',
    bannerUrl: '',
    whatsappNumber: '',
    storeStatus: 'open',
    deliveryFee: 5.00,
    deliveryOnly: false,
    openingHours: []
  });

  // Reactive Store Status
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  // Reactive Store Status (Moved calculation logic to storeUtils.ts)

  // Timer Effect
  useEffect(() => {
    const updateStatus = () => {
      const status = calculateStoreStatus(settings);
      setIsStoreOpen(status);
    };

    updateStatus(); // Initial check
    const interval = setInterval(updateStatus, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [settings]); // Re-run when settings change
  
  // PWA Update Check on Focus 
  useEffect(() => {
    const handleUpdateCheck = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg) {
            reg.update();
            console.log('Verificando atualizações do PWA ao ganhar foco...');
          }
        });
      }
    };
    window.addEventListener('focus', handleUpdateCheck);
    return () => window.removeEventListener('focus', handleUpdateCheck);
  }, []);


  useEffect(() => {
    const init = async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error('Erro fatal ao carregar dados:', error);
      } finally {
        setLoading(false);
        console.log('App loaded', new Date().toISOString());
      }
    };
    if (isStorageLoaded) {
      init();
    }
  }, [isStorageLoaded]);

  // Listen for UI changes from Landing Page
  useEffect(() => {
    const handleUIChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'modern') {
        setIsModernUI(true);
      } else if (customEvent.detail === 'legacy') {
        setIsModernUI(false);
      }
    };
    window.addEventListener('changeUIMode', handleUIChange);
    return () => window.removeEventListener('changeUIMode', handleUIChange);
  }, [setIsModernUI]);

  // Visitor Tracking
  useEffect(() => {
    const trackVisitor = async () => {
      // Don't track if no store is loaded yet
      if (!store?.id) return;
      
      // Check if already visited this specific store this session
      const trackKey = `visited_${store.slug}`;
      if (sessionStorage.getItem(trackKey)) return;

      try {
        if (!isConfigured) return; // Don't track if offline/mock

        const { error } = await supabase.rpc('increment_visitor_count', { p_store_id: store.id });

        if (!error) {
          sessionStorage.setItem(trackKey, 'true');
          console.log(`Visitor tracked for store: ${store.slug}`);
        } else {
          console.error("Error tracking visitor:", error);
        }
      } catch (err) {
        console.error("Error in visitor tracking:", err);
      }
    };

    trackVisitor();
  }, [store?.id]); // Run when store is identified



  // Configurar subscriptions para atualizações em tempo real
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (!store?.id) return;

    let previousOrderCount = orders.length;

    const handleNewOrder = async () => {
      await fetchOrders(store.id);

      // Check if a new order was added (count increased)
      if (orders.length > previousOrderCount && 'Notification' in window && Notification.permission === 'granted') {
        // Only show notification if page is not visible
        if (document.hidden) {
          new Notification('Novo Pedido! 🔔', {
            body: 'Um novo pedido foi recebido. Clique para visualizar.',
            icon: settings.logoUrl || '/logo.png',
            tag: 'new-order',
            requireInteraction: true
          });
        }
      }
      previousOrderCount = orders.length;
    };

    const channels = [
      supabase.channel('public:products').on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `store_id=eq.${store.id}` }, () => fetchProducts(store.id)).subscribe(),
      supabase.channel('public:categories').on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `store_id=eq.${store.id}` }, () => fetchCategories(store.id)).subscribe(),
      supabase.channel('public:groups').on('postgres_changes', { event: '*', schema: 'public', table: 'product_groups', filter: `store_id=eq.${store.id}` }, () => fetchGroups(store.id)).subscribe(),
      supabase.channel('public:options').on('postgres_changes', { event: '*', schema: 'public', table: 'product_options', filter: `store_id=eq.${store.id}` }, () => fetchGroups(store.id)).subscribe(),
      supabase.channel('public:coupons').on('postgres_changes', { event: '*', schema: 'public', table: 'coupons', filter: `store_id=eq.${store.id}` }, () => fetchCoupons(store.id)).subscribe(),
      supabase.channel('public:orders').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `store_id=eq.${store.id}` }, handleNewOrder).subscribe(),
      supabase.channel('public:settings').on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: `store_id=eq.${store.id}` }, () => fetchSettings(store.id)).subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [orders.length, store?.id]);

  // --- Funções de Fetch
  const fetchData = async () => {
    try {
      if (isConfigured) {
        // Online Mode: Fetch from Supabase
        let currentStoreId: string | null = null;
        const hash = window.location.hash;

        // 1. Check if logged into Admin Panel
        const { data: { session } } = await supabase.auth.getSession();
        const isAdminSession = hash.includes('/panel') || hash.includes('/login') || hash.includes('/platform') || hash.includes('/setup');
        
        if (session && session.user && isAdminSession) {
          // Check if Super Admin
          const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '');
          
          // Admin Mode: Fetch the store they own (or all if superadmin)
          let query = supabase.from('stores').select('*');
          if (!isSuperAdmin) {
            query = query.eq('owner_id', session.user.id);
          }
          
          const { data: storesData } = await query;
          
          if (storesData && storesData.length > 0) {
            // Tentar pegar o slug da URL primeiro
            const match = hash.match(/^#\/([^/?#]+)/);
            let urlSlug = null;
            if (match && match[1] && !['login', 'panel', 'platform', 'setup', 'cart', 'checkout'].includes(match[1])) {
              urlSlug = match[1];
            }

            const savedSlug = localStorage.getItem('currentStoreSlug');
            
            let matchedStore = null;
            if (urlSlug) {
              matchedStore = storesData.find(s => s.slug === urlSlug);
            }
            if (!matchedStore && savedSlug) {
              matchedStore = storesData.find(s => s.slug === savedSlug);
            }
            if (!matchedStore) {
              matchedStore = storesData[0];
            }

            setStore(matchedStore);
            currentStoreId = matchedStore.id;
            localStorage.setItem('currentStoreSlug', matchedStore.slug);
            console.log('Store resolved for admin:', matchedStore.slug, isSuperAdmin ? '(Super Admin)' : '(Owner)');
          } else {
            console.warn('No stores found for user:', session.user.email);
          }
        } else {
          // 2. Client Mode: Fetch store by slug
          let slug = 'sabor-acaiteria'; // Default fallback
          const match = hash.match(/^#\/([^/?#]+)/);

          if (match && match[1] && !['login', 'panel', 'cart', 'checkout', 'platform', 'setup'].includes(match[1])) {
            slug = match[1];
          } else {
            // Try to find if we already have it in localStorage
            const savedSlug = localStorage.getItem('currentStoreSlug');
            if (savedSlug) slug = savedSlug;
          }

          const { data: storeData } = await supabase.from('stores').select('*').eq('slug', slug).single();
          if (storeData) {
            setStore(storeData);
            currentStoreId = storeData.id;
            localStorage.setItem('currentStoreSlug', slug);
          }
        }

        if (currentStoreId) {
          await Promise.all([
            fetchProducts(currentStoreId),
            fetchCategories(currentStoreId),
            fetchGroups(currentStoreId),
            fetchCoupons(currentStoreId),
            fetchOrders(currentStoreId),
            fetchSettings(currentStoreId)
          ]);
        } else {
          // Clear state if no store is resolved
          batch(() => {
            setStore(null);
            setProducts([]);
            setCategories([]);
            setGroups([]);
            setCoupons([]);
            setOrders([]);
            setSettings(mockSettings);
          });
        }
      } else {
        // Offline Mode: Load mock data (Sabor Açaíteria)
        console.warn("⚠️ MODO OFFLINE: Carregando dados mock da Loja de Exemplo...");
        batch(() => {
          setProducts(mockProducts);
          setCategories(mockCategories);
          setGroups(mockGroups);
          setCoupons(mockCoupons);
          setOrders([]);
          setSettings(mockSettings);
        });
        console.log("✅ Dados mock carregados com sucesso!");
        console.log(`   📦 ${mockProducts.length} produtos | 📂 ${mockCategories.length} categorias | 🎁 ${mockCoupons.length} cupons`);
      }
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
    }
  };

  const batch = (fn: () => void) => fn();


  const fetchProducts = async (storeId: string) => {
    const { data } = await supabase.from('products').select(`
      *,
      product_group_relations (group_id)
    `).eq('store_id', storeId).order('display_order', { ascending: true });

    if (data) {
      // Mapear para o formato interno (adicionar groupIds e displayOrder)
      const mappedProducts: Product[] = data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        categoryId: p.category_id,
        groupIds: p.product_group_relations?.map((r: any) => r.group_id) || [],
        displayOrder: p.display_order ?? 0,
        active: p.active ?? true,
        storeId: p.store_id || storeId
      }));
      setProducts(mappedProducts);
    }
  };

  const fetchCategories = async (storeId: string) => {
    const { data } = await supabase.from('categories').select('*').eq('store_id', storeId).order('display_order', { ascending: true });
    if (data) {
      const mappedCategories: Category[] = data.map(c => ({
        id: c.id,
        title: c.title,
        icon: c.icon,
        displayOrder: c.display_order ?? 0,
        active: c.active ?? true
      }));
      setCategories(mappedCategories);
    }
  };

  const fetchGroups = async (storeId: string) => {
    const { data } = await supabase.from('product_groups').select(`
      *,
      options:product_options(*)
    `).eq('store_id', storeId);

    if (data) {
      // Mapear opções para garantir ordem ou formato se necessário
      const mappedGroups: ProductGroup[] = data.map(g => ({
        id: g.id,
        title: g.title,
        min: g.min,
        max: g.max,
        options: (g.options || []).map((o: any) => ({
          id: o.id,
          name: o.name,
          price: o.price,
          description: o.description,
          active: o.active ?? true
        })),
        active: g.active ?? true
      }));
      setGroups(mappedGroups);
    }
  };

  const fetchCoupons = async (storeId: string) => {
    const { data } = await supabase.from('coupons').select('*').eq('store_id', storeId);
    if (data) {
      const mappedCoupons: Coupon[] = data.map(c => ({
        id: c.id,
        code: c.code,
        type: c.type,
        value: c.value,
        active: c.active,
        usageCount: c.usage_count,
        minOrderValue: c.min_order_value
      }));
      setCoupons(mappedCoupons);
    }
  };

  const fetchOrders = async (storeId: string) => {
    const { data } = await supabase.from('orders').select('*').eq('store_id', storeId).order('date', { ascending: false });
    if (data) {
      // Mapear campos snake_case para camelCase
      const mappedOrders: OrderRecord[] = data.map(o => ({
        id: o.id,
        date: o.date,
        customerName: o.customer_name,
        whatsapp: o.whatsapp,
        method: o.method,
        address: o.address,
        paymentMethod: o.payment_method,
        total: o.total,
        itemsSummary: o.items_summary,
        fullDetails: o.full_details,
        status: o.status
      }));
      setOrders(mappedOrders);
    }
  };

  const fetchSettings = async (storeId: string) => {
    const { data } = await supabase.from('settings').select('*').eq('store_id', storeId).single();
    if (data) {
      setSettings({
        storeName: data.store_name,
        logoUrl: data.logo_url,
        logoShape: data.logo_shape || 'circle',
        bannerUrl: data.banner_url,
        whatsappNumber: data.whatsapp_number,
        storeStatus: data.store_status,
        deliveryFee: data.delivery_fee,
        deliveryOnly: data.delivery_only,
        openingHours: typeof data.opening_hours === 'string' ? JSON.parse(data.opening_hours) : (data.opening_hours || []),
        themeColors: data.theme_colors || {},
        closedMessage: data.closed_message || '🔴 Loja Fechada',
        openMessage: data.open_message || '🟢 Aberto até às 23:00',
        deliveryTime: data.delivery_time || '40min à 1h',
        pickupTime: data.pickup_time || '20min à 45min',
        deliveryCloseTime: data.delivery_close_time || '21:00',
        instagramUrl: data.instagram_url,
        businessAddress: data.business_address,
        copyrightText: data.copyright_text,
        checkoutReviewMessage: data.checkout_review_message
      });
    }
  };

  // Aplicar tema
  useEffect(() => {
    if (settings.themeColors) {
      const root = document.documentElement;
      const colors = settings.themeColors as any;

      if (colors.headerBg) root.style.setProperty('--color-header-bg', colors.headerBg);
      if (colors.headerText) root.style.setProperty('--color-header-text', colors.headerText);
      if (colors.background) root.style.setProperty('--color-background', colors.background);
      if (colors.cardBg) root.style.setProperty('--color-card-bg', colors.cardBg);
      if (colors.cardText) root.style.setProperty('--color-card-text', colors.cardText);
      if (colors.buttonPrimary) root.style.setProperty('--color-button-primary', colors.buttonPrimary);
      if (colors.buttonText) root.style.setProperty('--color-button-text', colors.buttonText);
      if (colors.textPrimary) root.style.setProperty('--color-text-primary', colors.textPrimary);
      if (colors.textSecondary) root.style.setProperty('--color-text-secondary', colors.textSecondary);
    }
  }, [settings.themeColors]);

  // Handle URL coupon parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
    const urlCoupon = searchParams.get('cupom') || hashParams.get('cupom');

    if (urlCoupon) {
      localStorage.setItem('pending_coupon', urlCoupon.toUpperCase());
    }

    const pendingCoupon = localStorage.getItem('pending_coupon');

    if (pendingCoupon && coupons.length > 0 && !appliedCoupon) {
      const validCoupon = coupons.find(c => c.code.toUpperCase() === pendingCoupon && c.active);
      if (validCoupon) {
        setAppliedCoupon(validCoupon);
        localStorage.removeItem('pending_coupon'); // Clean up after applying
      }
    }
  }, [coupons, appliedCoupon, window.location.search, window.location.hash]);

  // --- Funções de Mutação (CRUD) ---

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateCartQuantity = (cartId: string, quantity: number) => {
    setCart(prev => {
      // Don't remove items here to allow user to type '0' without cart closing
      return prev.map(item => item.cartId === cartId ? { ...item, quantity } : item);
    });
  };

  const updateCartNote = (cartId: string, note: string) => {
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, note } : item));
  };

  const clearCart = () => setCart(prev => prev.filter(item => item.product.storeId !== store?.id));

  const addProduct = async (p: Product) => {
    if (!isConfigured) {
      console.warn("OFFLINE: Product added locally.");
      const mockId = Date.now().toString();
      const newProduct = { ...p, id: mockId };
      setProducts(prev => [...prev, newProduct]);
      return;
    }

    if (!store?.id) {
      alert("Erro: Loja não identificada. Por favor, recarregue a página.");
      return;
    }

    // 1. Inserir produto
    const { data: productData, error } = await supabase.from('products').insert([{
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category_id: p.categoryId,
      store_id: store?.id
    }]).select().single();

    if (error || !productData) {
      console.error('Erro ao adicionar produto:', error);
      alert(`Erro ao adicionar produto: ${error?.message || 'Falha desconhecida no banco'}`);
      return;
    }

    // 2. Inserir relações de grupo
    if (p.groupIds && p.groupIds.length > 0) {
      const relations = p.groupIds.map(gid => ({
        product_id: productData.id,
        group_id: gid
      }));
      await supabase.from('product_group_relations').insert(relations);
    }

    // 3. Atualizar estado local imediatamente
    const newProduct: Product = {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      image: productData.image,
      categoryId: productData.category_id,
      groupIds: p.groupIds || [],
      active: productData.active ?? true,
      storeId: productData.store_id,
      displayOrder: productData.display_order
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = async (p: Product) => {
    // 0. Update Local State Immediately (Optimistic)
    setProducts(prev => prev.map(prod => prod.id === p.id ? p : prod));

    // 1. Atualizar produto
    const { error } = await supabase.from('products').update({
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category_id: p.categoryId,
      active: p.active // Include active status
    }).eq('id', p.id);

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      alert(`Erro ao atualizar produto: ${error.message}`);
      // Revert optimistic update (optional, but good for UX)
      // fetchProducts(); 
      return;
    }

    // 2. Atualizar relações (remover todas e adicionar novas)
    await supabase.from('product_group_relations').delete().eq('product_id', p.id);

    if (p.groupIds && p.groupIds.length > 0) {
      const relations = p.groupIds.map(gid => ({
        product_id: p.id,
        group_id: gid
      }));
      await supabase.from('product_group_relations').insert(relations);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id)); // Optimistic delete
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert(`Erro ao deletar produto: ${error.message}`);
  };

  const reorderProducts = async (categoryId: string, reorderedProducts: Product[]) => {
    // Optimistic update: update local state immediately
    setProducts(prev => {
      const otherProducts = prev.filter(p => p.categoryId !== categoryId);
      return [...otherProducts, ...reorderedProducts];
    });

    // Update each product's display_order in Supabase
    try {
      for (const product of reorderedProducts) {
        const { error } = await supabase.from('products').update({
          display_order: product.displayOrder
        }).eq('id', product.id);
        
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Erro ao reordenar produtos:", err);
      alert(`Erro ao salvar nova ordem dos produtos: ${err.message}`);
    }
  };

  const addCategory = async (c: Category) => {
    if (!isConfigured) {
      console.warn("OFFLINE: Category added locally.");
      const newCat = { ...c, id: Date.now().toString() };
      setCategories(prev => [...prev, newCat]);
      return;
    }
    if (!store?.id) {
      alert("Erro: Loja não identificada.");
      return;
    }
    // Inserir e obter o ID gerado pelo banco
    const { data: catData, error } = await supabase.from('categories').insert([{ title: c.title, icon: c.icon, store_id: store?.id }]).select().single();
    if (error || !catData) {
      alert(`Erro ao criar categoria: ${error?.message || 'Erro desconhecido'}`);
      return;
    }
    // Atualizar estado local imediatamente
    setCategories(prev => [...prev, { id: catData.id, title: catData.title, icon: catData.icon, active: catData.active ?? true, displayOrder: catData.display_order }]);
  };

  const updateCategory = async (c: Category) => {
    setCategories(prev => prev.map(cat => cat.id === c.id ? c : cat)); // Optimistic
    const { error } = await supabase.from('categories').update({
      title: c.title,
      icon: c.icon,
      active: c.active // Include active status
    }).eq('id', c.id);
    if (error) alert(`Erro ao atualizar categoria: ${error.message}`);
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id)); // Optimistic
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) alert(`Erro ao deletar categoria: ${error.message}`);
  };

  const addGroup = async (g: ProductGroup) => {
    if (!isConfigured) {
      console.warn("OFFLINE: Group added locally.");
      const newGroup = { ...g, id: Date.now().toString() };
      setGroups(prev => [...prev, newGroup]);
      return;
    }

    if (!store?.id) {
      alert("Erro: Loja não identificada.");
      return;
    }

    // 1. Inserir grupo
    const { data: groupData, error } = await supabase.from('product_groups').insert([{
      title: g.title,
      min: g.min,
      max: g.max,
      store_id: store?.id
    }]).select().single();

    if (error || !groupData) {
      alert(`Erro ao criar grupo de opcionais: ${error?.message}`);
      return;
    }

    // 2. Inserir opções
    let insertedOptions: any[] = [];
    if (g.options && g.options.length > 0) {
      const options = g.options.map(o => ({
        group_id: groupData.id,
        name: o.name,
        price: o.price,
        description: o.description,
        store_id: store?.id
      }));
      const { data: optData } = await supabase.from('product_options').insert(options).select();
      insertedOptions = optData || [];
    }

    // 3. Atualizar estado local imediatamente
    const newGroup: ProductGroup = {
      id: groupData.id,
      title: groupData.title,
      min: groupData.min,
      max: groupData.max,
      active: groupData.active ?? true,
      options: insertedOptions.map(o => ({ id: o.id, name: o.name, price: o.price, description: o.description, active: o.active ?? true }))
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const updateGroup = async (g: ProductGroup) => {
    setGroups(prev => prev.map(grp => grp.id === g.id ? g : grp)); // Optimistic

    // 1. Atualizar grupo
    await supabase.from('product_groups').update({
      title: g.title,
      min: g.min,
      max: g.max,
      active: g.active // Include active status
    }).eq('id', g.id);

    // 2. Atualizar opções (estratégia simples: delete all + insert all)
    // CUIDADO: Isso muda os IDs das opções. Se pedidos referenciarem opções por ID, isso quebraria histórico.
    // Como pedidos salvam snapshot (fullDetails), não deve ser problema crítico agora.
    const { error: delError } = await supabase.from('product_options').delete().eq('group_id', g.id);
    if (delError) {
      alert(`Erro ao atualizar opções do grupo: ${delError.message}`);
      return;
    }

    if (g.options && g.options.length > 0) {
      const options = g.options.map(o => ({
        group_id: g.id,
        name: o.name,
        price: o.price,
        description: o.description,
        active: o.active,
        store_id: store?.id
      }));
      const { error: insError } = await supabase.from('product_options').insert(options);
      if (insError) alert(`Erro ao inserir novas opções: ${insError.message}`);
    }
  };

  const deleteGroup = async (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id)); // Optimistic
    const { error } = await supabase.from('product_groups').delete().eq('id', id);
    if (error) alert(`Erro ao deletar grupo: ${error.message}`);
  };

  const addCoupon = async (c: Coupon) => {
    if (!isConfigured) {
      console.warn("OFFLINE: Coupon added locally.");
      const newCoupon = { ...c, id: Date.now().toString() };
      setCoupons(prev => [...prev, newCoupon]);
      return;
    }

    if (!store?.id) {
      alert("Erro: Loja não identificada.");
      return;
    }

    const { data: couponData, error } = await supabase.from('coupons').insert([{
      code: c.code,
      type: c.type,
      value: c.value,
      active: c.active,
      usage_count: c.usageCount,
      min_order_value: c.minOrderValue,
      store_id: store?.id
    }]).select().single();

    if (error || !couponData) {
      console.error('Erro ao adicionar cupom:', error);
      alert(`Erro ao criar cupom: ${error?.message || 'Erro desconhecido'}`);
      return;
    }
    // Atualizar estado local imediatamente
    setCoupons(prev => [...prev, {
      id: couponData.id,
      code: couponData.code,
      type: couponData.type,
      value: couponData.value,
      active: couponData.active,
      usageCount: couponData.usage_count,
      minOrderValue: couponData.min_order_value
    }]);
  };

  const updateCoupon = async (c: Coupon) => {
    const { error } = await supabase.from('coupons').update({
      code: c.code,
      type: c.type,
      value: c.value,
      active: c.active,
      usage_count: c.usageCount,
      min_order_value: c.minOrderValue
    }).eq('id', c.id);
    
    if (error) alert(`Erro ao atualizar cupom: ${error.message}`);
  };

  const deleteCoupon = async (id: string) => {
    // Optimistic Update
    setCoupons(prev => prev.filter(c => c.id !== id));
    
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      alert(`Erro ao deletar cupom: ${error.message}`);
      // Re-fetch if error to restore state
      if (store?.id) fetchCoupons(store.id);
    }
  };

  const updateSettings = async (s: Partial<GlobalSettings>) => {
    // Optimistic Update
    setSettings(prev => ({ ...prev, ...s }));

    if (!isConfigured) return;

    if (!store?.id) {
      console.error("Erro: store.id ausente ao tentar salvar configurações");
      return;
    }

    const dbSettings: any = { store_id: store.id };
    if (s.storeName !== undefined) dbSettings.store_name = s.storeName;
    if (s.logoUrl !== undefined) dbSettings.logo_url = s.logoUrl;
    if (s.logoShape !== undefined) dbSettings.logo_shape = s.logoShape;
    if (s.bannerUrl !== undefined) dbSettings.banner_url = s.bannerUrl;
    if (s.whatsappNumber !== undefined) dbSettings.whatsapp_number = s.whatsappNumber;
    if (s.storeStatus !== undefined) dbSettings.store_status = s.storeStatus;
    if (s.deliveryFee !== undefined) dbSettings.delivery_fee = s.deliveryFee;
    if (s.deliveryOnly !== undefined) dbSettings.delivery_only = s.deliveryOnly;
    if (s.openingHours !== undefined) dbSettings.opening_hours = s.openingHours;
    if (s.themeColors !== undefined) dbSettings.theme_colors = s.themeColors;
    if (s.closedMessage !== undefined) dbSettings.closed_message = s.closedMessage;
    if (s.openMessage !== undefined) dbSettings.open_message = s.openMessage;
    if (s.deliveryTime !== undefined) dbSettings.delivery_time = s.deliveryTime;
    if (s.pickupTime !== undefined) dbSettings.pickup_time = s.pickupTime;
    if (s.deliveryCloseTime !== undefined) dbSettings.delivery_close_time = s.deliveryCloseTime;
    if (s.instagramUrl !== undefined) dbSettings.instagram_url = s.instagramUrl;
    if (s.businessAddress !== undefined) dbSettings.business_address = s.businessAddress;
    if (s.copyrightText !== undefined) dbSettings.copyright_text = s.copyrightText;
    if (s.checkoutReviewMessage !== undefined) dbSettings.checkout_review_message = s.checkoutReviewMessage;

    // Se dbSettings tiver apenas store_id e nenhum outro campo para atualizar, e s não for vazio, algo está errado
    // Mas se s estiver vazio (ex: Save button), queremos salvar o estado ATUAL.
    // Para simplificar, se dbSettings tiver apenas store_id, enviamos o settings completo (mapeado)
    if (Object.keys(dbSettings).length === 1) {
      Object.assign(dbSettings, {
        store_name: settings.storeName,
        logo_url: settings.logoUrl,
        logo_shape: settings.logoShape,
        banner_url: settings.bannerUrl,
        whatsapp_number: settings.whatsappNumber,
        store_status: settings.storeStatus,
        delivery_fee: settings.deliveryFee,
        delivery_only: settings.deliveryOnly,
        opening_hours: settings.openingHours,
        theme_colors: settings.themeColors,
        closed_message: settings.closedMessage,
        open_message: settings.openMessage,
        delivery_time: settings.deliveryTime,
        pickup_time: settings.pickupTime,
        delivery_close_time: settings.deliveryCloseTime,
        instagram_url: settings.instagramUrl,
        business_address: settings.businessAddress,
        copyright_text: settings.copyrightText,
        checkout_review_message: settings.checkoutReviewMessage
      });
    }

    try {
      console.log('Salvando configurações para store_id:', store.id, dbSettings);
      
      // Usar RPC SECURITY DEFINER — aceita JWT ou senha da loja como auth
      const { error } = await supabase.rpc('save_store_settings', {
        p_store_id: store.id,
        p_settings: dbSettings,
        p_store_password: (store as any).password || null
      });

      if (error) {
        console.error("Erro ao atualizar configurações no Supabase:", error);
        alert(`Erro ao salvar configurações no servidor: ${error.message}`);
        throw error;
      }

      // Sincronizar nome da loja na tabela 'stores' se alterado
      if (s.storeName !== undefined) {
        const { error: storeError } = await supabase
          .from('stores')
          .update({ name: s.storeName })
          .eq('id', store.id);
        
        if (storeError) {
          console.error("Erro ao sincronizar nome na tabela stores:", storeError);
        } else {
          setStore(prev => prev ? { ...prev, name: s.storeName || '' } : prev);
        }
      }
    } catch (err: any) {
      console.error("Exceção ao atualizar configurações:", err);
      throw err;
    }
  };

  const addOrder = async (o: OrderRecord) => {
    if (!isConfigured) {
      console.warn("OFFLINE: Order added locally.");
      setOrders(prev => [o, ...prev]);
      return;
    }

    if (!store?.id) {
        console.error("Erro: Loja não identificada ao criar pedido.");
        return;
    }

    const { error } = await supabase.from('orders').insert([{
      date: o.date,
      customer_name: o.customerName,
      whatsapp: o.whatsapp,
      method: o.method,
      address: o.address,
      payment_method: o.paymentMethod,
      total: o.total,
      items_summary: o.itemsSummary,
      full_details: o.fullDetails,
      status: o.status,
      store_id: store?.id
    }]);

    if (error) {
      console.error("Erro ao salvar pedido:", error);
      alert(`Erro ao enviar pedido para o sistema: ${error.message}`);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    await supabase.from('orders').update({ status }).eq('id', id);
  };

  const updateOrderDiscount = async (id: string, discountPercent: number) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, discountPercent } : o));
    const { error } = await supabase.from('orders').update({ discount_percent: discountPercent }).eq('id', id);
    if (error) {
      console.error('Erro ao atualizar desconto:', error);
      alert('Erro ao salvar desconto no banco de dados.');
    }
  };

  const deleteOrder = async (id: string) => {
    console.log('Deletando pedido:', id);

    const { error } = await supabase.from('orders').delete().eq('id', id);

    if (error) {
      console.error('Erro ao deletar pedido:', error);
      alert(`Erro ao deletar pedido: ${error.message}`);
      return;
    }

    // Only update local state if delete was successful
    setOrders(prev => prev.filter(o => o.id !== id));
    console.log('Pedido deletado com sucesso');
  };

  const copyOrderToClipboard = (order: OrderRecord) => {
    // Format order details similar to WhatsApp message
    const itemsText = order.fullDetails.map(i => {
      let txt = `${i.quantity}x ${i.product.name}`;

      // Get option names from groups
      const selectedOptionsText: string[] = [];
      Object.entries(i.selectedOptions).forEach(([optionId, qty]) => {
        if ((qty as number) > 0) {
          for (const group of groups) {
            const option = group.options.find(opt => opt.id === optionId);
            if (option) {
              selectedOptionsText.push(`${option.name} ${qty}x`);
              break;
            }
          }
        }
      });

      if (selectedOptionsText.length > 0) {
        txt += `\n   (${selectedOptionsText.join(', ')})`;
      }

      if (i.note) txt += `\n   Obs: ${i.note}`;
      return txt;
    }).join('\n');

    const text = `*Pedido #${order.id}*\n` +
      `Cliente: ${order.customerName}\n` +
      `Tel: ${order.whatsapp}\n` +
      `Tipo: ${order.method}\n` +
      `Endereço: ${order.address}\n` +
      `Pagamento: ${order.paymentMethod}\n\n` +
      `Itens:\n${itemsText}\n\n` +
      `*Total: ${formatCurrency(order.total)}*`;

    navigator.clipboard.writeText(text).then(() => {
      alert('Pedido copiado para área de transferência!');
    });
  };

  const applyCoupon = (code: string) => {
    const coupon = coupons.find(c => c.code === code.toUpperCase() && c.active);
    if (!coupon) {
      return { success: false, message: 'Cupom inválido ou expirado' };
    }

    // Check minimum order value
    const subtotal = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return { success: false, message: `Valor mínimo para este cupom: ${formatCurrency(coupon.minOrderValue)}` };
    }

    setAppliedCoupon(coupon);
    return { success: true, message: 'Cupom aplicado com sucesso!' };
  };

  const removeCoupon = () => setAppliedCoupon(null);



  return (
    <AppContext.Provider value={{
      store, products, categories, groups, cart: currentCart, settings, coupons, orders, adminRole, isSidebarOpen,
      isModernUI, setIsModernUI,
      addToCart, removeFromCart, updateCartQuantity, updateCartNote, clearCart,
      addProduct, updateProduct, deleteProduct, reorderProducts,
      addCategory, updateCategory, deleteCategory,
      addGroup, updateGroup, deleteGroup,
      addCoupon, updateCoupon, deleteCoupon,
      updateSettings, setAdminRole, addOrder,
      updateOrderStatus,
      updateOrderDiscount,
      deleteOrder,
      copyOrderToClipboard,
      checkStoreStatus: () => isStoreOpen ? 'open' : 'closed',
      isStoreOpen,
      setSidebarOpen,
      appliedCoupon, applyCoupon, removeCoupon,
      loading,
      searchTerm,
      setSearchTerm
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider };