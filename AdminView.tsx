
import React, { useState, useRef, useMemo } from 'react';
import { AppSettings, Category, Product, Order, OrderStatus } from './types';
import { BackIcon, TrashIcon, SearchIcon, CameraIcon, UploadIcon, ChevronDownIcon, CheckIcon } from './Icons';
import { THEME_PRESETS } from './constants';
import { supabase } from './supabase';

interface AdminViewProps {
  settings: AppSettings;
  orders: Order[];
  isLive: boolean;
  onSave: (s: AppSettings) => Promise<void>;
  onBack: () => void;
}

const compressImageToBlob = (base64: string, maxWidth = 1000, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => { if (blob) resolve(blob); }, 'image/jpeg', quality);
    };
  });
};

export const AdminView: React.FC<AdminViewProps> = ({ settings, orders, isLive, onSave, onBack }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'Orders' | 'Products' | 'Categories' | 'General' | 'Stats'>('Orders');
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  
  const isDark = localSettings.themeMode === 'dark';
  const camInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentEditingProdId, setCurrentEditingProdId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
    const totalRev = orders.reduce((s, o) => s + (o.status === 'completed' ? o.total_price : 0), 0);
    const todayRev = todayOrders.reduce((s, o) => s + (o.status === 'completed' ? o.total_price : 0), 0);
    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue: totalRev,
      todayRevenue: todayRev
    };
  }, [orders]);

  const inputStyles = `w-full border-2 p-3 rounded-xl font-bold transition-all outline-none shadow-sm text-sm ${isDark ? 'bg-[#0F172A] border-white/5 text-white focus:border-blue-500' : 'bg-white border-slate-100 text-slate-900 focus:border-blue-600'}`;
  const cardStyles = `p-4 rounded-2xl border transition-all shadow-sm ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`;
  const labelStyles = "text-[9px] font-black uppercase tracking-widest opacity-40 px-1 mb-1.5 block";
  const actionButtonStyles = `flex items-center justify-center rounded-xl transition-all border p-3 shadow-sm active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-blue-400' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-blue-600'}`;

  const updateProduct = (id: string, field: keyof Product, val: any) => {
    setLocalSettings(prev => ({ ...prev, products: prev.products.map(p => p.id === id ? { ...p, [field]: val } : p) }));
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingStatusId(orderId);
    try {
      const { error } = await supabase.from('kiosk_orders').update({ status }).eq('id', orderId);
      if (error) throw error;
    } catch (err: any) {
      console.error("Status update failed.", err);
      alert(`Error updating status: ${err.message}`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const sendTestWebhook = async () => {
    if (!localSettings.notificationWebhookUrl) {
      alert("Please enter a Webhook URL first!");
      return;
    }
    setIsTestingWebhook(true);
    try {
      const payload = {
        test: true,
        order_number: 999,
        message_text: "📦 <b>New Order #999</b>\n\n👤 <b>Customer:</b> Test\n💰 <b>Total:</b> Rs 0.00",
        order_id: "test-id",
        customer_details: { name: "Test User", phone: "1234567890", address: "Test St", diningMode: "EAT_IN" }
      };
      const res = await fetch(localSettings.notificationWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Test Sent! n8n received the data successfully.");
      } else {
        const errorText = await res.text();
        alert(`n8n Error (${res.status}): ${errorText || 'Check if the node is set to POST and active.'}`);
      }
    } catch (e: any) {
      alert(`Connection failed: ${e.message}. This is usually a CORS issue or the URL is unreachable.`);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const productId = currentEditingProdId;
    if (file && productId) {
      setUploadingImage(productId);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
          const blob = await compressImageToBlob(rawBase64);
          const fileName = `${productId}-${Date.now()}.jpg`;
          const filePath = `products/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from('kiosk-assets')
            .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('kiosk-assets').getPublicUrl(filePath);
          updateProduct(productId, 'image', publicUrl);
        } catch (err: any) {
          console.error("Upload error:", err);
          updateProduct(productId, 'image', rawBase64);
        } finally {
          setUploadingImage(null);
          setCurrentEditingProdId(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localSettings);
    } finally {
      setIsSaving(false);
    }
  };

  const safeSupabaseSql = `
-- SAFE SQL: Can be run even if tables already exist
-- 1. Create Config Table
CREATE TABLE IF NOT EXISTS kiosk_config (
  id bigint PRIMARY KEY,
  brand_name text,
  primary_color text,
  theme_mode text,
  currency text,
  working_hours jsonb,
  force_holidays text[],
  notification_webhook_url text
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS kiosk_categories (
  id text PRIMARY KEY,
  label text,
  icon text,
  background_image text
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS kiosk_products (
  id text PRIMARY KEY,
  name text,
  price numeric,
  image text,
  category_id text REFERENCES kiosk_categories(id),
  description text,
  is_bestseller boolean DEFAULT false,
  is_available boolean DEFAULT true,
  sizes jsonb DEFAULT '[]',
  addons jsonb DEFAULT '[]'
);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS kiosk_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number int,
  customer_details jsonb,
  cart_items jsonb,
  total_price numeric,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Insert or Update initial config
INSERT INTO kiosk_config (id, brand_name, primary_color, theme_mode, currency)
VALUES (1, 'LittleIndia', '#E4002B', 'light', 'Rs')
ON CONFLICT (id) DO NOTHING;
  `.trim();

  return (
    <div className={`h-full flex flex-col animate-scale-up overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={camInputRef} onChange={handleFileChange} />
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      <header className={`flex-shrink-0 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b flex items-center justify-between ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center space-x-2">
          <button onClick={onBack} disabled={isSaving} className={`p-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} disabled:opacity-20`}><BackIcon /></button>
          <div className="flex flex-col">
            <h2 className="font-black text-sm font-oswald uppercase tracking-tight leading-none">Admin</h2>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">Live Sync</span>
            </div>
          </div>
        </div>
        {(activeTab !== 'Orders' && activeTab !== 'Stats') && (
          <button 
            onClick={handleSave} 
            disabled={isSaving || !!uploadingImage}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Saving...</span></> : 'Save Sync'}
          </button>
        )}
      </header>

      <div className={`flex-shrink-0 flex border-b overflow-x-auto no-scrollbar ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white'}`}>
        {(['Orders', 'Products', 'Categories', 'General', 'Stats'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 min-w-[90px] py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === t ? 'text-blue-500' : 'opacity-40'}`}>
            {t}{t === 'Orders' && orders.filter(o => o.status === 'pending' || o.status === 'preparing').length > 0 && (
              <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[7px]">{orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}</span>
            )}
            {activeTab === t && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-blue-500 rounded-t-full"></div>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
        {activeTab === 'Stats' && (
          <div className="space-y-6 animate-scale-up">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 px-1">Performance</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className={cardStyles}>
                  <label className={labelStyles}>Today Revenue</label>
                  <p className="text-2xl font-black font-oswald text-green-500">{localSettings.currency}{stats.todayRevenue.toFixed(2)}</p>
               </div>
               <div className={cardStyles}>
                  <label className={labelStyles}>Today Orders</label>
                  <p className="text-2xl font-black font-oswald text-blue-500">{stats.todayOrders}</p>
               </div>
               <div className={cardStyles}>
                  <label className={labelStyles}>Total Revenue</label>
                  <p className="text-2xl font-black font-oswald text-slate-400">{localSettings.currency}{stats.totalRevenue.toFixed(2)}</p>
               </div>
               <div className={cardStyles}>
                  <label className={labelStyles}>Total Orders</label>
                  <p className="text-2xl font-black font-oswald text-slate-400">{stats.totalOrders}</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'General' && (
          <div className="space-y-6">
            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30">Setup Guides</h3>
                <button onClick={() => setShowGuide(!showGuide)} className="text-[8px] font-black uppercase text-blue-500 border border-blue-500/30 px-3 py-1 rounded-lg">
                   {showGuide ? 'Hide Guides' : 'Show Guides'}
                </button>
              </div>
              
              {showGuide && (
                <div className="space-y-4 animate-scale-up">
                  {/* Supabase Section */}
                  <div className={`${cardStyles} bg-emerald-500/5 border-emerald-500/20 text-[10px] space-y-4`}>
                    <p className="font-black text-emerald-500 uppercase tracking-widest underline">🗄️ Fix "Already Exists" Error</p>
                    <p className="opacity-80">If you get an error saying something "already exists", use this <b>Safe Script</b> below. It checks if the table exists before trying to create it.</p>
                    <textarea 
                      readOnly 
                      className="w-full h-32 bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[8px] border border-white/5"
                      value={safeSupabaseSql}
                      onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    />
                    <p className="text-[7px] font-bold opacity-50 italic">* This script uses "IF NOT EXISTS" for all tables.</p>
                  </div>

                  {/* n8n Section */}
                  <div className={`${cardStyles} bg-blue-500/5 border-blue-500/20 text-[10px] space-y-4`}>
                    <p className="font-black text-blue-500 uppercase tracking-widest underline">🚀 n8n Blueprint: Notify You & Client</p>
                    <div className="space-y-4">
                      <div className="p-3 bg-slate-900 rounded-xl space-y-2">
                        <p className="font-bold text-white uppercase text-[8px]">Node 1: Webhook (The Trigger)</p>
                        <p className="opacity-60">The kiosk sends the order here. It includes the <b>customer_details.phone</b>.</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl space-y-2 border-l-4 border-blue-500">
                        <p className="font-bold text-white uppercase text-[8px]">Node 2: Notify OWNER (Telegram)</p>
                        <p className="opacity-60">Sends a message to YOU with 4 buttons: "Preparing", "Ready", etc.</p>
                        <p className="text-[7px] text-blue-400 font-mono italic">Button Callback: {"{{ $json.body.order_id }}|ready"}</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl space-y-2 border-l-4 border-green-500">
                        <p className="font-bold text-white uppercase text-[8px]">Node 3: Notify CLIENT (WhatsApp/Telegram)</p>
                        <p className="opacity-60">When YOU click a button, n8n sends a message to the CUSTOMER's phone:</p>
                        <code className="bg-slate-800 p-1 px-2 rounded text-green-400 font-mono">{"{{ $json.body.customer_details.phone }}"}</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className={cardStyles}>
                <div className="space-y-4">
                  <div>
                    <label className={labelStyles}>n8n Webhook URL</label>
                    <div className="flex gap-2">
                       <input 
                        type="url"
                        placeholder="https://one.kaizen.indevs.in/..."
                        className={inputStyles} 
                        value={localSettings.notificationWebhookUrl || ''} 
                        onChange={e => setLocalSettings({...localSettings, notificationWebhookUrl: e.target.value})} 
                       />
                       <button onClick={sendTestWebhook} disabled={isTestingWebhook} className="bg-slate-900 text-white px-4 rounded-xl text-[8px] font-black uppercase whitespace-nowrap active:scale-95 transition-all disabled:opacity-30">
                          {isTestingWebhook ? 'Sending...' : 'Test'}
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 px-1">Identity</h3>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div><label className={labelStyles}>Brand Name</label><input className={inputStyles} value={localSettings.brandName} onChange={e => setLocalSettings({...localSettings, brandName: e.target.value})} /></div>
                  <div><label className={labelStyles}>Currency</label><input className={inputStyles} value={localSettings.currency} onChange={e => setLocalSettings({...localSettings, currency: e.target.value})} /></div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'Orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30">Live Kitchen Feed</h3>
              <p className="text-[7px] opacity-40 font-black uppercase tracking-widest">Automatic Refresh</p>
            </div>
            
            {orders.length === 0 ? (
              <div className="py-20 text-center opacity-30 space-y-2">
                <span className="text-4xl">🍳</span>
                <p className="text-[10px] font-black uppercase tracking-widest">Kitchen is quiet...</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className={`${cardStyles} border-l-4 transition-all relative ${order.status === 'pending' ? 'border-amber-500 bg-amber-500/5' : order.status === 'preparing' ? 'border-blue-500' : order.status === 'ready' || order.status === 'out_for_delivery' ? 'border-green-500 bg-green-500/10' : 'border-slate-300 opacity-60'}`}>
                  {updatingStatusId === order.id && <div className="absolute inset-0 bg-white/20 dark:bg-black/20 flex items-center justify-center z-10 rounded-2xl backdrop-blur-[1px]"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-2xl font-black font-oswald text-blue-500">#{order.order_number}</span>
                      <p className="text-[11px] font-black uppercase mt-1">{order.customer_details.name}</p>
                      <p className="text-[9px] font-bold opacity-40">{order.customer_details.phone}</p>
                      <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded mt-1 inline-block ${order.customer_details.diningMode === 'DELIVERY' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                        {order.customer_details.diningMode.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-blue-500">{localSettings.currency}{order.total_price.toFixed(2)}</span>
                      <p className="text-[8px] opacity-40 uppercase tracking-tighter mt-1">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 mb-4 border-t border-dashed border-white/10 pt-3">
                    {order.cart_items.map((item, i) => (
                      <div key={i} className="flex justify-between text-[11px] font-bold">
                        <span className="flex gap-2">
                           <span className="text-blue-500 font-black">{item.quantity}x</span>
                           <span>{item.name}</span>
                        </span>
                        <span className="text-[9px] opacity-40 uppercase">{item.selectedSize.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => updateOrderStatus(order.id, 'preparing')} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all active:scale-95 ${order.status === 'preparing' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-blue-500/30 text-blue-500'}`}>Prepare</button>
                    {order.customer_details.diningMode === 'DELIVERY' ? (
                      <button onClick={() => updateOrderStatus(order.id, 'out_for_delivery')} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all active:scale-95 ${order.status === 'out_for_delivery' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'border-orange-500/30 text-orange-500'}`}>Send Out</button>
                    ) : (
                      <button onClick={() => updateOrderStatus(order.id, 'ready')} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all active:scale-95 ${order.status === 'ready' ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'border-green-500/30 text-green-500'}`}>Ready</button>
                    )}
                    <button onClick={() => updateOrderStatus(order.id, 'completed')} className="col-span-2 py-3 rounded-xl text-[9px] font-black uppercase border border-slate-500/30 text-slate-500 active:scale-95">Complete Order</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Categories' && (
          <div className="space-y-3">
             <div className="flex justify-between items-center px-1 mb-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30">Folders</h3>
              <button onClick={() => { const id = `CAT_${Date.now()}`; setLocalSettings(prev => ({ ...prev, categories: [...prev.categories, { id, label: 'New Folder', icon: '🍟' }] })); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Add New</button>
            </div>
            {localSettings.categories.map((cat, idx) => (
              <div key={cat.id} className={cat.id === 'root' ? 'hidden' : cardStyles}>
                <div className="flex items-center gap-2">
                  <input className={`${inputStyles} w-14 text-center p-2`} value={cat.icon} onChange={e => { const n = [...localSettings.categories]; n[idx].icon = e.target.value; setLocalSettings({...localSettings, categories: n}); }} />
                  <input className={`${inputStyles} flex-1 p-2`} value={cat.label} onChange={e => { const n = [...localSettings.categories]; n[idx].label = e.target.value; setLocalSettings({...localSettings, categories: n}); }} />
                  <button onClick={() => setLocalSettings({...localSettings, categories: localSettings.categories.filter(c => c.id !== cat.id)})} className="p-3 text-red-500 active:scale-90 transition-transform"><TrashIcon /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Products' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center px-1 mb-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30">Menu Items</h3>
              <button onClick={() => { const id = `PROD_${Date.now()}`; setLocalSettings(prev => ({ ...prev, products: [{ id, name: 'New Item', price: 0, category: localSettings.categories[0]?.id || 'BURGERS', description: '', sizes: [], addons: [], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', isAvailable: true }, ...prev.products] })); setExpandedProducts(prev => ({...prev, [id]: true})); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Add Item</button>
            </div>
            {localSettings.products.map(prod => (
              <div key={prod.id} className={`${cardStyles} ${prod.isAvailable === false ? 'opacity-60 grayscale' : ''}`}>
                <div className="flex gap-4 items-center">
                  <div className="relative w-12 h-12 shrink-0">
                    <img src={prod.image} className={`w-full h-full rounded-xl object-cover ${uploadingImage === prod.id ? 'opacity-30' : 'opacity-100'}`} />
                    {uploadingImage === prod.id && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-black text-xs truncate">{prod.name}</p>
                    <p className="text-[10px] font-black text-blue-500">{localSettings.currency}{prod.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <button 
                        onClick={() => updateProduct(prod.id, 'isAvailable', prod.isAvailable === false)}
                        className={`w-10 h-6 rounded-full relative transition-colors ${prod.isAvailable !== false ? 'bg-green-500' : 'bg-slate-400'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prod.isAvailable !== false ? 'right-1' : 'left-1'}`}></div>
                     </button>
                     <button onClick={() => setExpandedProducts(prev => ({...prev, [prod.id]: !prev[prod.id]}))}><ChevronDownIcon className={`transition-transform duration-300 ${expandedProducts[prod.id] ? 'rotate-180' : ''}`} /></button>
                  </div>
                </div>
                {expandedProducts[prod.id] && (
                  <div className="mt-4 space-y-4 border-t border-white/5 pt-4 animate-scale-up">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelStyles}>Price</label><input type="number" step="0.01" className={inputStyles} value={prod.price} onChange={e => updateProduct(prod.id, 'price', parseFloat(e.target.value))} /></div>
                      <div>
                         <label className={labelStyles}>Photo</label>
                         <div className="flex gap-1">
                            <button onClick={() => { setCurrentEditingProdId(prod.id); camInputRef.current?.click(); }} className={`${actionButtonStyles} flex-1`}><CameraIcon /></button>
                            <button onClick={() => { setCurrentEditingProdId(prod.id); fileInputRef.current?.click(); }} className={`${actionButtonStyles} flex-1`}><UploadIcon /></button>
                         </div>
                      </div>
                    </div>
                    <div><label className={labelStyles}>Name</label><input className={inputStyles} value={prod.name} onChange={e => updateProduct(prod.id, 'name', e.target.value)} /></div>
                    <button onClick={() => setLocalSettings({...localSettings, products: localSettings.products.filter(p => p.id !== prod.id)})} className="w-full py-3 text-red-500 text-[10px] font-black uppercase border border-red-500/10 active:bg-red-500/10 transition-colors rounded-xl">Delete Item</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
