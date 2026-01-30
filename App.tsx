
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AppView, CartItem, Product, UserDetails, AppSettings, SizeOption, AddonOption, Category, Order } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { supabase } from './supabase';

import { LandingView } from './LandingView';
import { MenuView } from './MenuView';
import { ProductDetailView } from './ProductDetailView';
import { CartView } from './CartView';
import { CheckoutView } from './CheckoutView';
import { UserDetailsView } from './UserDetailsView';
import { FinalSummaryView } from './FinalSummaryView';
import { OrderTrackerView } from './OrderTrackerView';
import { AdminView } from './AdminView';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails>({ name: '', phone: '', address: '', diningMode: 'EAT_IN' });
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);

  const checkIsAdmin = () => {
    const path = window.location.pathname.toLowerCase();
    return path === '/admin' || path === '/admin/' || path.endsWith('/admin') || path.endsWith('/admin/');
  };

  const [isDashboard, setIsDashboard] = useState(checkIsAdmin());

  const showToast = useCallback((msg: string) => { 
    setToast(msg); 
    setTimeout(() => setToast(null), 6000); 
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [configRes, catRes, prodRes] = await Promise.all([
        supabase.from('kiosk_config').select('*').eq('id', 1).maybeSingle(),
        supabase.from('kiosk_categories').select('*'),
        supabase.from('kiosk_products').select('*')
      ]);

      if (configRes.data && catRes.data && prodRes.data) {
        setSettings({
          brandName: configRes.data.brand_name || DEFAULT_SETTINGS.brandName,
          primaryColor: configRes.data.primary_color || DEFAULT_SETTINGS.primaryColor,
          themeMode: configRes.data.theme_mode as 'light' | 'dark' || DEFAULT_SETTINGS.themeMode,
          currency: configRes.data.currency || DEFAULT_SETTINGS.currency,
          workingHours: configRes.data.working_hours || DEFAULT_SETTINGS.workingHours,
          forceHolidays: configRes.data.force_holidays || [],
          notificationWebhookUrl: configRes.data.notification_webhook_url || '',
          categories: catRes.data.map(c => ({ id: c.id, label: c.label, icon: c.icon, backgroundImage: c.background_image })),
          products: prodRes.data.map(p => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price) || 0,
            image: p.image,
            category: p.category_id,
            description: p.description,
            isBestseller: p.is_bestseller,
            sizes: p.sizes || [],
            addons: p.addons || []
          }))
        });
      }

      const { data: ordersData } = await supabase.from('kiosk_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (ordersData) setLiveOrders(ordersData);

    } catch (err) { 
      console.error("Critical Load failed:", err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchSettings(); 

    const channel = supabase
      .channel('kiosk_orders_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kiosk_orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLiveOrders(prev => [payload.new as Order, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setLiveOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new as Order : o));
        } else if (payload.eventType === 'DELETE') {
          setLiveOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    const handlePopState = () => {
      setIsDashboard(checkIsAdmin());
    };
    window.addEventListener('popstate', handlePopState);

    return () => { 
      supabase.removeChannel(channel); 
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchSettings]);

  const cartTotal = useMemo(() => Math.round(cart.reduce((acc, item) => acc + (item.price + item.selectedSize.price) * item.quantity, 0) * 100) / 100, [cart]);
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  
  const addToCart = useCallback((product: Product, quantity: number, size: SizeOption, addons: AddonOption[]) => { 
    setCart(prev => { 
      const idx = prev.findIndex(i => i.id === product.id && i.selectedSize.label === size.label); 
      if (idx > -1) { const n = [...prev]; n[idx].quantity += quantity; return n; } 
      return [...prev, { ...product, quantity, selectedSize: size, selectedAddons: addons }]; 
    }); 
    showToast(`Added ${product.name}`); 
    setView(AppView.MENU); 
  }, [showToast]);
  
  const updateQuantity = useCallback((id: string, delta: number, index?: number) => { 
    setCart(prev => {
      if (id === 'ALL') return [];
      const newState = [...prev];
      if (index !== undefined && index >= 0 && index < newState.length) {
        if (delta === -9999) { newState.splice(index, 1); return newState; }
        newState[index].quantity = Math.max(0, newState[index].quantity + delta);
        return newState.filter(item => item.quantity > 0);
      }
      return prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0);
    }); 
  }, []);

  const handleOrderConfirmed = async () => {
    setIsSubmittingOrder(true);
    const orderNumber = Math.floor(Math.random() * 900) + 100;
    try {
      const { data, error } = await supabase.from('kiosk_orders').insert([{ 
        order_number: orderNumber, 
        customer_details: userDetails, 
        cart_items: cart, 
        total_price: cartTotal,
        status: 'pending'
      }]).select('id').single();
      
      if (error) throw error;
      if (data) {
        setCurrentOrderId(data.id);
        
        if (settings.notificationWebhookUrl) {
          const summaryLines = cart.map(i => `• ${i.quantity}x ${i.name} (${i.selectedSize.label})`);
          const payload = {
            order_id: data.id,
            order_number: orderNumber,
            customer_name: userDetails.name,
            customer_phone: userDetails.phone,
            total: `${settings.currency} ${cartTotal.toFixed(2)}`,
            mode: userDetails.diningMode,
            address: userDetails.address || 'N/A',
            items_summary: summaryLines.join('\n'),
            telegram_actions: [
              { label: "✅ Mark Ready", status: "ready" },
              { label: "👨‍🍳 Preparing", status: "preparing" },
              { label: "🚚 Out for Delivery", status: "out_for_delivery" },
              { label: "🏁 Complete", status: "completed" }
            ]
          };

          fetch(settings.notificationWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(e => console.error("Automation error:", e));
        }
      }

      setView(AppView.ORDER_CONFIRMED);
    } catch (err: any) { 
      console.error("Order failed:", err);
      showToast("Order save error.");
      setView(AppView.ORDER_CONFIRMED); 
    } finally { 
      setIsSubmittingOrder(false); 
    }
  };

  const handleSaveSettings = useCallback(async (newSettings: AppSettings) => {
    setIsSubmittingOrder(true);
    try {
      // 1. Sync Configuration
      const configPayload: any = {
        id: 1,
        brand_name: newSettings.brandName,
        primary_color: newSettings.primaryColor,
        theme_mode: newSettings.themeMode,
        currency: newSettings.currency,
        working_hours: newSettings.workingHours,
        force_holidays: newSettings.forceHolidays
      };

      // Only include webhook if we aren't troubleshooting schema cache
      if (newSettings.notificationWebhookUrl !== undefined) {
        configPayload.notification_webhook_url = newSettings.notificationWebhookUrl || '';
      }

      const { error: configError } = await supabase.from('kiosk_config').upsert(configPayload);
      
      if (configError) {
        if (configError.message.includes('notification_webhook_url')) {
          throw new Error("Missing Column: Please run 'ALTER TABLE kiosk_config ADD COLUMN notification_webhook_url TEXT;' in Supabase SQL Editor.");
        }
        throw new Error(`Config Error: ${configError.message}`);
      }

      // 2. Clear & Sync Categories (Soft Sync)
      const { error: delProdError } = await supabase.from('kiosk_products').delete().neq('id', '_root_');
      const { error: delCatError } = await supabase.from('kiosk_categories').delete().neq('id', '_root_');
      
      // 3. Re-insert Categories
      const { error: catError } = await supabase.from('kiosk_categories').upsert(newSettings.categories.map(c => ({
        id: c.id,
        label: c.label || 'New Category',
        icon: c.icon || '📦',
        background_image: c.backgroundImage || null
      })));
      if (catError) throw new Error(`Category Error: ${catError.message}`);

      // 4. Re-insert Products
      const { error: prodError } = await supabase.from('kiosk_products').upsert(newSettings.products.map(p => ({
        id: p.id,
        name: p.name || 'Untitled Item',
        price: p.price || 0,
        image: p.image || '',
        category_id: p.category,
        description: p.description || '',
        is_bestseller: !!p.isBestseller,
        sizes: p.sizes || [],
        addons: p.addons || []
      })));
      if (prodError) throw new Error(`Product Error: ${prodError.message}`);

      setSettings(newSettings);
      showToast("Settings Synced to Database!");
    } catch (err: any) {
      console.error("Sync failed detailed log:", err);
      showToast(err.message || 'Sync Failed. Check Supabase Policies.');
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [showToast]);

  const currentOrder = useMemo(() => 
    liveOrders.find(o => o.id === currentOrderId), 
  [liveOrders, currentOrderId]);

  if (loading) return <div className="h-full w-full flex items-center justify-center bg-[#0F172A]"><div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div></div>;

  if (isDashboard) {
    return (
      <div className={`max-w-4xl mx-auto h-full relative shadow-2xl overflow-hidden ${settings.themeMode === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}>
        {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest z-[100] animate-scale-up shadow-xl border border-white/10">{toast}</div>}
        <AdminView 
          settings={settings} 
          orders={liveOrders} 
          isLive={true} 
          onBack={() => {
            window.history.pushState({}, '', '/');
            setIsDashboard(false);
          }} 
          onSave={handleSaveSettings} 
        />
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto h-full relative shadow-2xl overflow-hidden ${settings.themeMode === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest z-[100] animate-scale-up shadow-xl border border-white/10">{toast}</div>}
      
      {view === AppView.LANDING && <LandingView settings={settings} onStart={() => setView(AppView.MENU)} />}
      {view === AppView.MENU && <MenuView settings={settings} cartTotal={cartTotal} cartCount={cartCount} onRestart={() => setView(AppView.LANDING)} onSelectProduct={(p) => { setSelectedProduct(p); setView(AppView.PRODUCT_DETAIL); }} onGoToCart={() => setView(AppView.CART)} />}
      {view === AppView.PRODUCT_DETAIL && selectedProduct && <ProductDetailView settings={settings} product={selectedProduct} onBack={() => setView(AppView.MENU)} onAddToCart={addToCart} />}
      {view === AppView.CART && <CartView settings={settings} items={cart} total={cartTotal} onBack={() => setView(AppView.MENU)} onUpdateQuantity={updateQuantity} onCheckout={() => setView(AppView.CHECKOUT)} />}
      {view === AppView.CHECKOUT && <CheckoutView settings={settings} onBack={() => setView(AppView.CART)} onSelectMode={(m) => { setUserDetails({...userDetails, diningMode: m}); setView(AppView.USER_DETAILS); }} />}
      {view === AppView.USER_DETAILS && <UserDetailsView settings={settings} mode={userDetails.diningMode} onBack={() => setView(AppView.CHECKOUT)} onNext={(d) => { setUserDetails(d); setView(AppView.FINAL_SUMMARY); }} initialDetails={userDetails} />}
      {view === AppView.FINAL_SUMMARY && <FinalSummaryView settings={settings} cart={cart} details={userDetails} total={cartTotal} onBack={() => setView(AppView.USER_DETAILS)} onConfirm={handleOrderConfirmed} isSubmitting={isSubmittingOrder} />}
      {view === AppView.ORDER_CONFIRMED && <OrderTrackerView settings={settings} currentOrder={currentOrder} onRestart={() => { setCart([]); setView(AppView.LANDING); }} />}
    </div>
  );
}
