import { supabase } from '../supabaseClient';
import { Product, Category, ProductGroup, Coupon, OrderRecord, GlobalSettings, OrderStatus } from '../types/types';

export const supabaseService = {
  // Products
  async fetchProducts() {
    const { data } = await supabase.from('products').select('*, product_group_relations(group_id)').order('display_order', { ascending: true });
    return data?.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      categoryId: p.category_id,
      groupIds: p.product_group_relations?.map((r: any) => r.group_id) || [],
      displayOrder: p.display_order ?? 0,
      active: p.active ?? true
    })) || [];
  },

  async addProduct(p: Partial<Product>) {
    const { data, error } = await supabase.from('products').insert([{
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category_id: p.categoryId
    }]).select().single();
    if (error) throw error;
    
    if (p.groupIds?.length) {
      const relations = p.groupIds.map(gid => ({ product_id: data.id, group_id: gid }));
      await supabase.from('product_group_relations').insert(relations);
    }
    return data;
  },

  // Categories
  async fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
    return data?.map(c => ({
      id: c.id,
      title: c.title,
      icon: c.icon,
      displayOrder: c.display_order ?? 0,
      active: c.active ?? true
    })) || [];
  },

  // Groups
  async fetchGroups() {
    const { data } = await supabase.from('product_groups').select('*, options:product_options(*)');
    return data?.map(g => ({
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
    })) || [];
  },

  // Orders
  async fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('date', { ascending: false });
    return data?.map(o => ({
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
    })) || [];
  },

  async addOrder(o: OrderRecord) {
    const { data, error } = await supabase.from('orders').insert([{
      customer_name: o.customerName,
      whatsapp: o.whatsapp,
      method: o.method,
      address: o.address,
      payment_method: o.paymentMethod,
      total: o.total,
      items_summary: o.itemsSummary,
      full_details: o.fullDetails,
      status: o.status
    }]).select().single();
    if (error) throw error;
    return data;
  },

  // Settings
  async fetchSettings() {
    const { data } = await supabase.from('settings').select('*').single();
    if (!data) return null;
    return {
      storeName: data.store_name,
      logoUrl: data.logo_url,
      logoShape: data.logo_shape || 'circle',
      bannerUrl: data.banner_url,
      whatsappNumber: data.whatsapp_number,
      storeStatus: data.store_status,
      deliveryFee: data.delivery_fee,
      deliveryOnly: data.delivery_only,
      openingHours: data.opening_hours,
      themeColors: data.theme_colors,
      closedMessage: data.closed_message,
      openMessage: data.open_message,
      deliveryTime: data.delivery_time,
      pickupTime: data.pickup_time,
      deliveryCloseTime: data.delivery_close_time,
      instagramUrl: data.instagram_url,
      businessAddress: data.business_address,
      copyrightText: data.copyright_text
    };
  }
};
