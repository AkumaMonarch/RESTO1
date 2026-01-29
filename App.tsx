
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AppView, CartItem, Product, UserDetails, AppSettings, SizeOption, AddonOption } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { supabase } from './supabase';

import { LandingView } from './LandingView';
import { MenuView } from './MenuView';
import { ProductDetailView } from './ProductDetailView';
import { CartView } from './CartView';
import { CheckoutView } from './CheckoutView';
import { UserDetailsView } from './UserDetailsView';
import { FinalSummaryView } from './FinalSummaryView';
import { OrderConfirmedView } from './OrderConfirmedView';
import { AdminView } from './AdminView';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails>({ name: '', phone: '', address: '', diningMode: 'EAT_IN' });
  const [lastOrderNumber, setLastOrderNumber] = useState<number>(0);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('kiosk_settings').select('config').eq('id', 1).single();
      if (data?.config) setSettings(data.config);
    } catch (err) { console.error("Load failed", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

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
  
  const updateQuantity = useCallback((id: string, delta: number) => { 
    setCart(prev => id === 'ALL' ? [] : prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0)); 
  }, []);

  const handleOrderConfirmed = async () => {
    setIsSubmittingOrder(true);
    const orderNumber = Math.floor(Math.random() * 900) + 100;
    try {
      await supabase.from('kiosk_orders').insert([{ order_number: orderNumber, customer_details: userDetails, cart_items: cart, total_price: cartTotal }]);
      setLastOrderNumber(orderNumber);
      setView(AppView.ORDER_CONFIRMED);
    } catch (err) { console.error(err); setLastOrderNumber(orderNumber); setView(AppView.ORDER_CONFIRMED); }
    finally { setIsSubmittingOrder(false); }
  };

  if (loading) return <div className="h-full w-full flex items-center justify-center bg-[#0F172A]"><div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div></div>;

  return (
    <div className={`max-w-md mx-auto h-full relative shadow-2xl overflow-hidden ${settings.themeMode === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest z-[100] animate-scale-up shadow-xl">{toast}</div>}
      
      {view === AppView.LANDING && <LandingView settings={settings} onStart={() => setView(AppView.MENU)} />}
      {view === AppView.MENU && <MenuView settings={settings} cartTotal={cartTotal} cartCount={cartCount} onRestart={() => setView(AppView.LANDING)} onAdmin={() => setView(AppView.ADMIN)} onSelectProduct={(p) => { setSelectedProduct(p); setView(AppView.PRODUCT_DETAIL); }} onGoToCart={() => setView(AppView.CART)} />}
      {view === AppView.PRODUCT_DETAIL && selectedProduct && <ProductDetailView settings={settings} product={selectedProduct} onBack={() => setView(AppView.MENU)} onAddToCart={addToCart} />}
      {view === AppView.CART && <CartView settings={settings} items={cart} total={cartTotal} onBack={() => setView(AppView.MENU)} onUpdateQuantity={updateQuantity} onCheckout={() => setView(AppView.CHECKOUT)} />}
      {view === AppView.CHECKOUT && <CheckoutView settings={settings} onBack={() => setView(AppView.CART)} onSelectMode={(m) => { setUserDetails({...userDetails, diningMode: m}); setView(AppView.USER_DETAILS); }} />}
      {view === AppView.USER_DETAILS && <UserDetailsView settings={settings} mode={userDetails.diningMode} onBack={() => setView(AppView.CHECKOUT)} onNext={(d) => { setUserDetails(d); setView(AppView.FINAL_SUMMARY); }} initialDetails={userDetails} />}
      {view === AppView.FINAL_SUMMARY && <FinalSummaryView settings={settings} cart={cart} details={userDetails} total={cartTotal} onBack={() => setView(AppView.USER_DETAILS)} onConfirm={handleOrderConfirmed} isSubmitting={isSubmittingOrder} />}
      {view === AppView.ORDER_CONFIRMED && <OrderConfirmedView settings={settings} onRestart={() => { setCart([]); setView(AppView.LANDING); }} orderNumber={lastOrderNumber} />}
      {view === AppView.ADMIN && <AdminView settings={settings} onBack={() => setView(AppView.MENU)} onSave={(s) => { setSettings(s); supabase.from('kiosk_settings').upsert({ id: 1, config: s }); showToast("Synced"); setView(AppView.MENU); }} />}
    </div>
  );
}
