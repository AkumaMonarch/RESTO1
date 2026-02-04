
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { AppView, CartItem, Product, UserDetails, AppSettings, SizeOption, AddonOption, Category, Order, DiningMode } from './types';
import { DEFAULT_SETTINGS, DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from './constants';
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
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails>({ 
    name: '', 
    phone: '', 
    address: '', 
    diningMode: 'EAT_IN',
    platform: 'web_browser'
  });
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  
  const lastStatusRef = useRef<string | null>(null);

  // Initialize Telegram WebApp data
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setUserDetails(prev => ({
          ...prev,
          name: prev.name || `${user.first_name} ${user.last_name || ''}`.trim(),
          telegram_id: String(user.id),
          telegram_username: user.username,
          platform: 'telegram'
        }));
      }
    }
  }, []);

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

      let updatedSettings = { ...DEFAULT_SETTINGS };

      if (configRes.data) {
        updatedSettings.brandName = configRes.data.brand_name || updatedSettings.brandName;
        updatedSettings.primaryColor = configRes.data.primary_color || updatedSettings.primaryColor;
        updatedSettings.themeMode = configRes.data.theme_mode as 'light' | 'dark' || updatedSettings.themeMode;
        updatedSettings.currency = configRes.data.currency || updatedSettings.currency;
        updatedSettings.workingHours = configRes.data.working_hours || updatedSettings.workingHours;
        updatedSettings.notificationWebhookUrl = configRes.data.notification_webhook_url || '';
      }

      if (catRes.data && catRes.data.length > 0) {
        updatedSettings.categories = catRes.data.map(c => ({ 
          id: c.id, 
          label: c.label, 
          icon: c.icon, 
          backgroundImage: c.background_image 
        }));
      }

      if (prodRes.data && prodRes.data.length > 0) {
        updatedSettings.products = prodRes.data.map(p => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price) || 0,
          image: p.image,
          category: p.category_id,
          description: p.description,
          isBestseller: p.is_bestseller,
          isAvailable: p.is_available !== false,
          sizes: p.sizes || [],
          addons: p.addons || []
        }));
      }

      setSettings(updatedSettings);

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

  useEffect(() => {
    if (!currentOrderId) return;
    const order = liveOrders.find(o => o.id === currentOrderId);
    if (order && lastStatusRef.current && order.status !== lastStatusRef.current) {
      const statusMap: any = {
        preparing: lang === 'EN' ? "Kitchen is preparing your meal! 👨‍🍳" : "रसोई आपका भोजन तैयार कर रही है! 👨‍🍳",
        ready: lang === 'EN' ? "Your order is READY! ✨" : "आपका ऑर्डर तैयार है! ✨",
        out_for_delivery: lang === 'EN' ? "Order is on the way! 🛵" : "ऑर्डर रास्ते में है! 🛵",
        completed: lang === 'EN' ? "Thank you for visiting! ✨" : "पधारने के लिए धन्यवाद! ✨"
      };
      if (statusMap[order.status]) showToast(statusMap[order.status]);
    }
    if (order) lastStatusRef.current = order.status;
  }, [liveOrders, currentOrderId, lang, showToast]);

  const cartTotal = useMemo(() => Math.round(cart.reduce((acc, item) => acc + (item.price + item.selectedSize.price + (item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0)) * item.quantity, 0) * 100) / 100, [cart]);
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  
  const addToCart = useCallback((product: Product, quantity: number, size: SizeOption, addons: AddonOption[]) => { 
    setCart(prev => { 
      const idx = prev.findIndex(i => i.id === product.id && i.selectedSize.label === size.label && JSON.stringify(i.selectedAddons) === JSON.stringify(addons)); 
      if (idx > -1) { const n = [...prev]; n[idx].quantity += quantity; return n; } 
      return [...prev, { ...product, quantity, selectedSize: size, selectedAddons: addons }]; 
    }); 
    showToast(lang === 'EN' ? 'Added to Basket!' : 'बास्केट में जोड़ा गया!'); 
    setView(AppView.MENU); 
  }, [showToast, lang]);
  
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

  const handleCallStaff = useCallback(() => {
    if (settings.notificationWebhookUrl) {
      fetch(settings.notificationWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: "ASSISTANCE",
          message: "🛎️ STAFF ASSISTANCE REQUESTED AT KIOSK!",
          kiosk_id: "Kiosk 01",
          customer: userDetails
        })
      });
      showToast(lang === 'EN' ? "Staff notified!" : "कर्मचारी को सूचित किया गया!");
    }
  }, [settings.notificationWebhookUrl, lang, showToast, userDetails]);

  const handleOrderConfirmed = async () => {
    setIsSubmittingOrder(true);
    const orderNumber = Math.floor(Math.random() * 900) + 100;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });

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
        lastStatusRef.current = 'pending';
        
        if (settings.notificationWebhookUrl) {
          const itemLines = cart.map(i => {
            const addonText = i.selectedAddons.length > 0 
              ? `\n   └ Extras: ${i.selectedAddons.map(a => a.label).join(', ')}` 
              : '';
            return `• ${i.quantity}x <b>${i.name}</b> (${i.selectedSize.label})${addonText}`;
          });
          
          const telegramMarkup = {
            inline_keyboard: [
              [
                { text: "👨‍🍳 Preparing", callback_data: `${data.id}|preparing` },
                { text: "✅ Ready", callback_data: `${data.id}|ready` }
              ],
              [
                { text: "🚚 Out for Delivery", callback_data: `${data.id}|out_for_delivery` },
                { text: "🏁 Complete", callback_data: `${data.id}|completed` }
              ]
            ]
          };

          const messageText = `📦 <b>NEW ORDER #${orderNumber}</b>\n` +
            `📅 ${formattedDate} | 🕒 ${formattedTime}\n\n` +
            `👤 <b>Customer:</b> ${userDetails.name}\n` +
            `📞 <b>Phone:</b> ${userDetails.phone}\n` +
            `🍱 <b>Mode:</b> ${userDetails.diningMode.replace('_', ' ')}\n` +
            `🖥️ <b>Platform:</b> ${userDetails.platform || 'web'}\n` +
            `${userDetails.address ? `📍 <b>Address:</b> ${userDetails.address}\n` : ''}` +
            `💰 <b>Total:</b> ${settings.currency} ${cartTotal.toFixed(2)}\n\n` +
            `<b>ITEMS:</b>\n${itemLines.join('\n')}`;

          const payload = {
            order_id: data.id,
            order_number: orderNumber,
            message_text: messageText,
            reply_markup: telegramMarkup,
            customer_details: userDetails,
            order_date: formattedDate,
            order_time: formattedTime,
            cart_items: cart,
            total_price: cartTotal
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
      // 1. Save Basic Config
      const configPayload: any = {
        id: 1,
        brand_name: newSettings.brandName,
        primary_color: newSettings.primaryColor,
        theme_mode: newSettings.themeMode,
        currency: newSettings.currency,
        working_hours: newSettings.workingHours,
        force_holidays: newSettings.forceHolidays,
        notification_webhook_url: newSettings.notificationWebhookUrl || ''
      };

      const { error: configError } = await supabase.from('kiosk_config').upsert(configPayload);
      if (configError) {
        if (configError.message.includes('column')) throw new Error("CONFIG ERROR: Run the 'Fix Schema' script in Admin Guides to add the Webhook column.");
        throw new Error(`Config Error: ${configError.message}`);
      }

      // 2. Clean and Save Categories
      await supabase.from('kiosk_categories').delete().neq('id', '_root_');
      const { error: catError } = await supabase.from('kiosk_categories').upsert(newSettings.categories.map(c => ({
        id: c.id,
        label: c.label || 'New Category',
        icon: c.icon || '📦',
        background_image: c.backgroundImage || null
      })));
      if (catError) throw new Error(`Category Error: ${catError.message}`);

      // 3. Clean and Save Products
      await supabase.from('kiosk_products').delete().neq('id', '_root_');
      const { error: prodError } = await supabase.from('kiosk_products').upsert(newSettings.products.map(p => ({
        id: p.id,
        name: p.name || 'Untitled Item',
        price: p.price || 0,
        image: p.image || '',
        category_id: p.category,
        description: p.description || '',
        is_bestseller: !!p.isBestseller,
        is_available: p.isAvailable !== false,
        sizes: p.sizes || [],
        addons: p.addons || []
      })));
      
      if (prodError) {
        if (prodError.message.includes('column')) throw new Error("PRODUCT ERROR: Run the 'Fix Schema' script in Admin Guides to add missing columns like 'is_available'.");
        throw new Error(`Product Error: ${prodError.message}`);
      }

      setSettings(newSettings);
      showToast("Everything Synced!");
    } catch (err: any) {
      console.error("Sync failed:", err);
      showToast(err.message || 'Sync Failed.');
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
        {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest z-[100] animate-scale-up shadow-xl border border-white/10">{toast}</div>}
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
      
      {view === AppView.LANDING && <LandingView settings={settings} lang={lang} onSetLang={setLang} onStart={() => setView(AppView.CHECKOUT)} />}
      {view === AppView.CHECKOUT && <CheckoutView settings={settings} lang={lang} onBack={() => setView(AppView.LANDING)} onSelectMode={(m) => { setUserDetails({...userDetails, diningMode: m}); setView(AppView.MENU); }} />}
      {view === AppView.MENU && <MenuView settings={settings} lang={lang} cartTotal={cartTotal} cartCount={cartCount} onRestart={() => setView(AppView.LANDING)} onCallStaff={handleCallStaff} onSelectProduct={(p) => { setSelectedProduct(p); setView(AppView.PRODUCT_DETAIL); }} onGoToCart={() => setView(AppView.CART)} />}
      {view === AppView.PRODUCT_DETAIL && selectedProduct && <ProductDetailView settings={settings} lang={lang} product={selectedProduct} onBack={() => setView(AppView.MENU)} onAddToCart={addToCart} />}
      {view === AppView.CART && <CartView settings={settings} lang={lang} items={cart} total={cartTotal} onBack={() => setView(AppView.MENU)} onUpdateQuantity={updateQuantity} onCheckout={() => setView(AppView.USER_DETAILS)} />}
      {view === AppView.USER_DETAILS && <UserDetailsView settings={settings} lang={lang} mode={userDetails.diningMode} onBack={() => setView(AppView.CART)} onNext={(d) => { setUserDetails(d); setView(AppView.FINAL_SUMMARY); }} initialDetails={userDetails} />}
      {view === AppView.FINAL_SUMMARY && <FinalSummaryView settings={settings} lang={lang} cart={cart} details={userDetails} total={cartTotal} onBack={() => setView(AppView.USER_DETAILS)} onConfirm={handleOrderConfirmed} isSubmitting={isSubmittingOrder} />}
      {view === AppView.ORDER_CONFIRMED && <OrderTrackerView settings={settings} lang={lang} currentOrder={currentOrder} onRestart={() => { setCart([]); setView(AppView.LANDING); }} />}
    </div>
  );
}
