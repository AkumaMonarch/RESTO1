
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AppView, CartItem, CategoryType, Product, UserDetails, AppSettings, Category, SizeOption, AddonOption, WorkingDay, DiningMode } from './types';
import { DEFAULT_SETTINGS, THEME_PRESETS } from './constants';
import { supabase } from './supabase';
import { GoogleGenAI } from "@google/genai";

/**
 * --- SVG Icons ---
 */
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const AdminIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const MagicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

/**
 * --- Utils ---
 */
function useGrabToScroll(direction: 'horizontal' | 'vertical' = 'horizontal') {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollLeft(scrollRef.current.scrollLeft);
    setScrollTop(scrollRef.current.scrollTop);
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    setHasMoved(true);
    if (direction === 'horizontal') {
      const x = e.pageX - scrollRef.current.offsetLeft;
      scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
    } else {
      const y = e.pageY - scrollRef.current.offsetTop;
      scrollRef.current.scrollTop = scrollTop - (y - startY) * 1.5;
    }
  };

  return { ref: scrollRef, onMouseDown, onMouseUp, onMouseLeave, onMouseMove, onClickCapture: (e: React.MouseEvent) => { if (hasMoved) e.stopPropagation(); }, isDragging };
}

// --- Views ---

const LandingView: React.FC<{ settings: AppSettings; onStart: () => void }> = ({ settings, onStart }) => (
  <div className="h-full w-full flex flex-col items-center justify-center p-6 space-y-8 animate-scale-up cursor-pointer relative overflow-hidden" style={{ backgroundColor: settings.primaryColor }} onClick={onStart}>
    <div className="absolute inset-0 opacity-10">
      <div className="grid grid-cols-4 gap-3 rotate-12 scale-150">
        {settings.products.slice(0, 12).map((p, i) => (
          <img key={i} src={p.image} className="w-full aspect-square object-cover rounded-2xl" alt="" />
        ))}
      </div>
    </div>
    
    <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.5)] transform transition-all active:scale-95 z-10">
      <h1 className="text-4xl font-black tracking-tighter italic select-none leading-none text-center" style={{ color: settings.primaryColor }}>
        {settings.brandName}
      </h1>
      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-center mt-3 opacity-30">Authentic Flavors</p>
    </div>
    
    <div className="text-center space-y-2 text-white z-10">
      <h2 className="text-3xl font-black font-oswald tracking-tight uppercase leading-none">Tap to order</h2>
      <p className="text-base opacity-80 font-medium">Fresh. Fast. Delicious.</p>
    </div>

    <div className="flex flex-col items-center animate-bounce mt-6 text-white z-10">
      <div className="w-12 h-12 rounded-full border-4 border-white/40 flex items-center justify-center backdrop-blur-md shadow-2xl">
        <span className="text-xl font-bold">↓</span>
      </div>
    </div>
  </div>
);

const MenuView: React.FC<{
  settings: AppSettings;
  onSelectProduct: (p: Product) => void;
  onGoToCart: () => void;
  onRestart: () => void;
  onAdmin: () => void;
  cartTotal: number;
  cartCount: number;
}> = ({ settings, onSelectProduct, onGoToCart, onRestart, onAdmin, cartTotal, cartCount }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>(settings.categories[0]?.id || 'RECOMMENDED');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const navScrollProps = useGrabToScroll('horizontal');
  const mainScrollProps = useGrabToScroll('vertical');
  const isDark = settings.themeMode === 'dark';

  const isHoliday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return settings.forceHolidays.includes(todayStr);
  }, [settings.forceHolidays]);

  const handleAiAssistant = async () => {
    const prompt = window.prompt("What are you craving? (e.g., 'Something spicy with chicken')");
    if (!prompt) return;

    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an expert food recommendation assistant for '${settings.brandName}'. 
        Here is the menu: ${JSON.stringify(settings.products.map(p => ({id: p.id, name: p.name, description: p.description})))}. 
        The user wants: "${prompt}". 
        Recommend exactly ONE item from the menu that matches best. 
        Return ONLY the product ID.`,
      });
      
      const recommendedId = response.text?.trim();
      const product = settings.products.find(p => p.id === recommendedId);
      if (product) {
        onSelectProduct(product);
      } else {
        alert("I couldn't find a perfect match for that, but feel free to browse our categories!");
      }
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let list = settings.products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (activeCategory === 'RECOMMENDED') {
      return list.filter(p => p.isBestseller);
    }
    return list.filter(p => p.category === activeCategory);
  }, [activeCategory, settings.products, searchQuery]);

  const activeCategoryLabel = useMemo(() => {
    const found = settings.categories.find(c => c.id === activeCategory);
    return found ? found.label : activeCategory;
  }, [activeCategory, settings.categories]);

  return (
    <div className={`h-full flex flex-col overflow-hidden transition-colors duration-300 bg-animated-vertical ${isDark ? 'bg-[#0F172A] from-[#0F172A] via-[#1E293B] to-[#0F172A]' : 'bg-[#F8FAFC] from-[#F8FAFC] via-[#F1F5F9] to-[#F8FAFC]'}`}>
      <header className={`flex-shrink-0 flex items-center justify-between px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] border-b shadow-sm z-20 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center space-x-2">
           <div className="px-2 py-1 text-white font-black italic rounded-md text-[10px] shadow-sm transition-transform" style={{ backgroundColor: settings.primaryColor }}>{settings.brandName}</div>
           <h2 className={`text-base font-bold font-oswald tracking-tight uppercase overflow-hidden whitespace-nowrap text-ellipsis max-w-[120px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
             {searchQuery.trim() ? 'Search' : activeCategoryLabel}
           </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleAiAssistant} disabled={isAiLoading} className={`p-2 rounded-lg transition-all active:scale-90 border shadow-sm ${isDark ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
            {isAiLoading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <MagicIcon />}
          </button>
          <button onClick={onAdmin} className={`p-2 rounded-lg transition-all active:scale-90 border shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <AdminIcon />
          </button>
          <button onClick={onRestart} className="font-black uppercase tracking-wider text-[8px] border-2 px-3 py-2 rounded-lg transition-all active:scale-95 shadow-sm" style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}>
            RESTART
          </button>
        </div>
      </header>

      {isHoliday && (
        <div className="bg-amber-100 text-amber-900 px-4 py-2 text-[10px] font-bold border-b border-amber-200 flex items-center justify-center gap-2 animate-pulse">
          <span className="text-sm">⚠️</span>
          <span className="uppercase tracking-tight text-center">Store Closed Today.</span>
        </div>
      )}

      {/* Horizontal Category Nav - Compact */}
      <div className={`relative flex-shrink-0 border-b overflow-hidden ${isDark ? 'bg-[#1E293B]' : 'bg-white'}`}>
        <div className="scroll-shimmer-h"></div>
        <div className="mask-edges">
          <nav {...navScrollProps} className="overflow-x-auto no-scrollbar py-4 px-4 flex flex-nowrap items-center space-x-3 z-10 touch-pan-x select-none">
            {settings.categories.map(cat => (
              <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }} 
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap border-2 shadow-sm ${activeCategory === cat.id && !searchQuery ? 'text-white shadow-md scale-105' : isDark ? 'bg-slate-800/80 border-white/5 text-white/40' : 'bg-slate-50 border-slate-100 text-slate-400'}`} 
                style={activeCategory === cat.id && !searchQuery ? { backgroundColor: settings.primaryColor, borderColor: settings.primaryColor } : {}}>
                <span className="text-lg">{cat.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-tight">{cat.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main {...mainScrollProps} className="flex-1 overflow-y-auto p-3 no-scrollbar pb-32 smooth-scroll relative">
        <div className="scroll-shimmer-v"></div>
        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.map(p => (
            <div key={p.id} onClick={() => onSelectProduct(p)} 
              className={`relative rounded-[2rem] border-2 transition-all active:scale-[0.98] flex items-stretch p-2 overflow-hidden min-h-[130px] cursor-pointer shadow-sm ${p.isBestseller ? 'border-amber-400 bg-amber-400/5' : isDark ? 'bg-[#1E293B] border-white/5 hover:border-white/20' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
              {p.isBestseller && <div className="absolute top-0 left-0 bg-amber-400 text-white text-[8px] font-black px-3 py-1 rounded-br-xl z-10 uppercase italic shadow-md">Best Seller</div>}
              <div className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-2xl mr-3 shrink-0 self-center overflow-hidden shadow-inner ${isDark ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 flex flex-col py-1 overflow-hidden">
                <div className="flex-1 mb-1">
                  <h3 className={`text-sm font-black leading-tight mb-0.5 pr-1 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
                  <p className={`text-[10px] line-clamp-2 leading-relaxed opacity-70 ${isDark ? 'text-white' : 'text-slate-500'}`}>{p.description}</p>
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className={`text-base font-black whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>{settings.currency} {p.price.toFixed(2)}</span>
                  <button disabled={isHoliday} className={`text-white w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg active:scale-90 transition-all flex-shrink-0 leading-none pb-0.5 ${isHoliday ? 'opacity-30' : ''}`} style={{ backgroundColor: settings.primaryColor }}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {cartCount > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl border-t flex items-center gap-3 animate-scale-up shadow-[0_-15px_40px_rgba(0,0,0,0.15)] z-30 ${isDark ? 'bg-[#0F172A]/90 border-white/10' : 'bg-white/90 border-slate-100'}`}>
           <div onClick={onGoToCart} className="flex-1 bg-[#86BC25] active:scale-95 transition-all text-white p-4 rounded-[2rem] flex items-center justify-between font-black shadow-sm cursor-pointer overflow-hidden">
            <div className="flex items-center space-x-3">
               <div className="bg-white text-[#86BC25] w-8 h-8 rounded-xl flex items-center justify-center shadow-md text-sm flex-shrink-0">{cartCount}</div>
               <span className="text-sm uppercase tracking-tight whitespace-nowrap">View Basket</span>
            </div>
            <span className="text-xl font-oswald tracking-wide whitespace-nowrap ml-3">{settings.currency} {cartTotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductDetailView: React.FC<{
  settings: AppSettings;
  product: Product;
  onAddToCart: (p: Product, quantity: number, size: SizeOption, addons: AddonOption[]) => void;
  onBack: () => void;
}> = ({ settings, product, onAddToCart, onBack }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<SizeOption>(product.sizes[0] || { label: 'Regular', price: 0 });
  const [selectedAddons, setSelectedAddons] = useState<AddonOption[]>([]);
  const isDark = settings.themeMode === 'dark';

  const totalPrice = useMemo(() => {
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    return (product.price + selectedSize.price + addonsTotal) * quantity;
  }, [product, selectedSize, selectedAddons, quantity]);

  return (
    <div className={`h-full flex flex-col animate-scale-up overflow-hidden bg-animated-vertical transition-colors duration-500 ${isDark ? 'bg-[#0F172A] from-[#0F172A] via-[#1E293B] to-[#0F172A]' : 'bg-white from-white via-slate-50 to-white'}`}>
      <header className={`flex-shrink-0 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center space-x-3 border-b sticky top-0 z-20 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <button onClick={onBack} className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 flex-shrink-0 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}><BackIcon /></button>
        <h2 className={`text-base font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Customize</h2>
      </header>
      
      <div className="flex-1 relative overflow-hidden bg-breathing-cue">
        <div className="scroll-shimmer-v"></div>
        <div className="h-full overflow-y-auto p-4 space-y-5 no-scrollbar pb-64 smooth-scroll relative z-10 mask-edges-vertical">
          <div className="flex flex-col items-center pt-2">
             <div className={`w-full aspect-square max-w-[190px] rounded-[2rem] flex items-center justify-center p-4 mb-4 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.4)] overflow-hidden border-2 transition-transform duration-700 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <img src={product.image} className="w-full h-full object-cover rounded-[1.5rem] shadow-xl" loading="eager" />
             </div>
             <div className="px-4 text-center space-y-1">
                <h3 className={`text-2xl font-black leading-[1.1] tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.name}</h3>
                <p className={`text-center font-medium max-w-[240px] mx-auto text-[9px] leading-snug opacity-70 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{product.description}</p>
             </div>
          </div>
          
          {product.sizes.length > 0 && (
            <section className="space-y-2 px-1">
               <div className="flex justify-between items-center px-1"><h4 className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Select Size</h4><span className="text-[7px] font-black px-1 py-0.5 rounded-md uppercase tracking-wider" style={{ color: settings.primaryColor, backgroundColor: `${settings.primaryColor}15` }}>Required</span></div>
               <div className="grid grid-cols-3 gap-2">
                 {product.sizes.map(s => (
                   <button key={s.label} onClick={() => setSelectedSize(s)} 
                    className={`py-3.5 rounded-xl border-2 font-black transition-all flex flex-col items-center shadow-sm ${selectedSize.label === s.label ? 'scale-105' : isDark ? 'border-white/5 text-white/30 bg-white/5' : 'border-slate-50 text-slate-400 bg-white'}`} 
                    style={selectedSize.label === s.label ? { borderColor: settings.primaryColor, backgroundColor: `${settings.primaryColor}15`, color: settings.primaryColor } : {}}>
                     <span className="text-[10px]">{s.label}</span>
                     <span className="text-[7px] opacity-70 mt-0.5">+{settings.currency}{s.price.toFixed(2)}</span>
                   </button>
                 ))}
               </div>
            </section>
          )}
          
          {product.addons.length > 0 && (
            <section className="space-y-2 px-1">
               <h4 className={`text-[8px] font-black uppercase tracking-widest px-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Add Extras</h4>
               <div className="grid grid-cols-1 gap-1.5 pb-4">
                 {product.addons.map(addon => (
                   <label key={addon.label} className={`flex items-center justify-between p-3.5 border-2 rounded-xl transition-all cursor-pointer shadow-sm ${selectedAddons.find(a => a.label === addon.label) ? 'border-opacity-100' : isDark ? 'bg-slate-800/30 border-white/5' : 'bg-white border-slate-50'}`} style={selectedAddons.find(a => a.label === addon.label) ? { borderColor: settings.primaryColor, backgroundColor: `${settings.primaryColor}05` } : {}}>
                     <div className="flex flex-col"><span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-800'}`}>{addon.label}</span><span className="text-[8px] font-black mt-0.5" style={{ color: settings.primaryColor }}>+{settings.currency}{addon.price.toFixed(2)}</span></div>
                     <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedAddons.find(a => a.label === addon.label) ? 'text-white' : 'border-slate-200 bg-white'}`} style={selectedAddons.find(a => a.label === addon.label) ? { backgroundColor: settings.primaryColor, borderColor: settings.primaryColor } : {}}>{selectedAddons.find(a => a.label === addon.label) && <CheckIcon className="w-3.5 h-3.5" />}</div>
                     <input type="checkbox" className="hidden" checked={!!selectedAddons.find(a => a.label === addon.label)} onChange={() => setSelectedAddons(prev => prev.find(a => a.label === addon.label) ? prev.filter(a => a.label !== addon.label) : [...prev, addon])} />
                   </label>
                 ))}
               </div>
            </section>
          )}
        </div>
      </div>

      <div className={`flex-shrink-0 px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 border-t rounded-t-[2.25rem] shadow-[0_-15px_40px_rgba(0,0,0,0.2)] space-y-2.5 z-20 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className={`flex items-center justify-between p-1 rounded-2xl border-2 ${isDark ? 'bg-[#0F172A]' : 'bg-slate-50 border-slate-100'}`}>
          <button onClick={() => setQuantity(q => Math.max(1, q-1))} className={`w-9 h-9 border-2 rounded-xl text-lg font-black flex items-center justify-center active:scale-90 transition-all shadow-sm ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>−</button>
          <span className={`text-lg font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{quantity}</span>
          <button onClick={() => setQuantity(q => q+1)} className={`w-9 h-9 border-2 rounded-xl text-lg font-black flex items-center justify-center active:scale-90 transition-all shadow-sm ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>+</button>
        </div>
        <button onClick={() => onAddToCart(product, quantity, selectedSize, selectedAddons)} className="w-full text-white py-3.5 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-between px-5 shadow-sm overflow-hidden" style={{ backgroundColor: settings.primaryColor }}>
          <span className="text-[11px] font-black uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">Add To Basket</span>
          <span className="font-oswald text-lg whitespace-nowrap flex-shrink-0 ml-3">{settings.currency}{totalPrice.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
};

const OrderConfirmedView: React.FC<{ settings: AppSettings; orderNumber: number; onRestart: () => void }> = ({ settings, orderNumber, onRestart }) => {
  const isDark = settings.themeMode === 'dark';
  return (
    <div className={`h-full flex flex-col items-center justify-center p-8 text-center space-y-8 animate-scale-up ${isDark ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-900'}`}>
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-5xl animate-bounce shadow-xl">
        ✅
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black font-oswald uppercase tracking-tight">Order Placed!</h2>
        <p className="text-sm opacity-60 font-medium">Thank you for choosing {settings.brandName}</p>
      </div>
      <div className={`p-6 rounded-[2.5rem] border-2 w-full max-w-[240px] shadow-lg ${isDark ? 'bg-slate-800 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Your Order Number</p>
        <p className="text-5xl font-black font-oswald" style={{ color: settings.primaryColor }}>#{orderNumber}</p>
      </div>
      <button onClick={onRestart} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all">Back to Home</button>
    </div>
  );
};

const AdminView: React.FC<{ settings: AppSettings; onSave: (s: AppSettings) => void; onBack: () => void; onReset: () => void; }> = ({ settings, onSave, onBack, onReset }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'General' | 'Categories' | 'Products'>('General');
  const isDark = localSettings.themeMode === 'dark';
  const camInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentEditingProdId, setCurrentEditingProdId] = useState<string | null>(null);
  
  const inputStyles = `w-full border-2 p-3 rounded-xl font-bold transition-all outline-none shadow-sm text-sm ${isDark ? 'bg-[#0F172A] border-white/5 text-white focus:border-blue-500' : 'bg-white border-slate-100 text-slate-900 focus:border-slate-300'}`;
  const cardStyles = `p-4 rounded-2xl border transition-all shadow-sm ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`;
  const labelStyles = "text-[9px] font-black uppercase tracking-widest opacity-40 px-1 mb-1.5 block";
  const dangerButtonStyles = `flex items-center justify-center rounded-xl transition-all border ${isDark ? 'bg-red-950/20 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white'}`;
  const actionButtonStyles = `flex items-center justify-center rounded-xl transition-all border p-3 shadow-sm active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-blue-400' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-blue-600'}`;

  const toggleDay = (day: string) => {
    setLocalSettings(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh => wh.day === day ? { ...wh, isOpen: !wh.isOpen } : wh)
    }));
  };

  const updateTime = (day: string, field: 'openTime' | 'closeTime', val: string) => {
    setLocalSettings(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh => wh.day === day ? { ...wh, [field]: val } : wh)
    }));
  };

  const addHoliday = (date: string) => {
    if (!date) return;
    setLocalSettings(prev => ({ ...prev, forceHolidays: Array.from(new Set([...prev.forceHolidays, date])) }));
  };

  const removeHoliday = (date: string) => {
    setLocalSettings(prev => ({ ...prev, forceHolidays: prev.forceHolidays.filter(d => d !== date) }));
  };

  const addCategory = () => {
    const id = `CAT_${Date.now()}`;
    setLocalSettings(prev => ({ ...prev, categories: [...prev.categories, { id, label: 'New Category', icon: '📦' }] }));
  };

  const removeCategory = (id: string) => {
    setLocalSettings(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id), products: prev.products.filter(p => p.category !== id) }));
  };

  const updateCategory = (id: string, field: keyof Category, val: string) => {
    setLocalSettings(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, [field]: val } : c) }));
  };

  const addProduct = () => {
    const id = `PROD_${Date.now()}`;
    const newProd: Product = {
      id, name: 'New Item', price: 0, category: localSettings.categories[0]?.id || 'BURGERS', 
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      description: 'Product description goes here.', sizes: [], addons: []
    };
    setLocalSettings(prev => ({ ...prev, products: [newProd, ...prev.products] }));
  };

  const removeProduct = (id: string) => {
    setLocalSettings(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
  };

  const updateProduct = (id: string, field: keyof Product, val: any) => {
    setLocalSettings(prev => ({ ...prev, products: prev.products.map(p => p.id === id ? { ...p, [field]: val } : p) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentEditingProdId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProduct(currentEditingProdId, 'image', reader.result as string);
        setCurrentEditingProdId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`h-full flex flex-col animate-scale-up overflow-hidden ${isDark ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Hidden Inputs for Media Capture */}
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={camInputRef} onChange={handleFileChange} />
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      <header className={`flex-shrink-0 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b flex items-center justify-between ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className={`p-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}><BackIcon /></button>
          <h2 className="font-black text-lg font-oswald uppercase tracking-tight">Admin Panel</h2>
        </div>
        <button onClick={() => onSave(localSettings)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">Sync Changes</button>
      </header>

      <div className={`flex-shrink-0 flex border-b ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white'}`}>
        {(['General', 'Categories', 'Products'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === t ? 'text-blue-500' : 'opacity-40'}`}>
            {t}
            {activeTab === t && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-blue-500 rounded-t-full"></div>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
        {activeTab === 'General' && (
          <div className="space-y-8 animate-scale-up">
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 px-1">Store Profile</h3>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div><label className={labelStyles}>Brand Name</label><input className={inputStyles} value={localSettings.brandName} onChange={e => setLocalSettings({...localSettings, brandName: e.target.value})} /></div>
                  <div><label className={labelStyles}>Currency Symbol</label><input className={inputStyles} value={localSettings.currency} onChange={e => setLocalSettings({...localSettings, currency: e.target.value})} /></div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 px-1">Operating Hours</h3>
              <div className="space-y-3">
                {localSettings.workingHours.map(wh => (
                  <div key={wh.day} className={cardStyles}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-black text-[11px] uppercase tracking-wide">{wh.day}</span>
                      <button onClick={() => toggleDay(wh.day)} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${wh.isOpen ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : isDark ? 'bg-white/5 text-white/30' : 'bg-slate-100 text-slate-400'}`}>
                        {wh.isOpen ? 'Open' : 'Closed'}
                      </button>
                    </div>
                    {wh.isOpen && (
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelStyles}>Open</label><input type="time" value={wh.openTime} onChange={e => updateTime(wh.day, 'openTime', e.target.value)} className={inputStyles} /></div>
                        <div><label className={labelStyles}>Close</label><input type="time" value={wh.closeTime} onChange={e => updateTime(wh.day, 'closeTime', e.target.value)} className={inputStyles} /></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 px-1">Public Holidays</h3>
              <div className={cardStyles}>
                <div className="flex gap-2 mb-4">
                  <input type="date" className={inputStyles} id="new-holiday" />
                  <button onClick={() => {
                    const el = document.getElementById('new-holiday') as HTMLInputElement;
                    addHoliday(el.value);
                    el.value = '';
                  }} className="bg-slate-900 text-white px-5 rounded-xl text-xl font-bold active:scale-95 transition-all shadow-lg">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localSettings.forceHolidays.map(d => (
                    <div key={d} className={`px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-3 border ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                      {d} <button onClick={() => removeHoliday(d)} className="font-black text-sm hover:opacity-70">✕</button>
                    </div>
                  ))}
                  {localSettings.forceHolidays.length === 0 && <p className="text-[10px] opacity-40 px-1 py-2 italic">No holidays scheduled.</p>}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'Categories' && (
          <div className="space-y-6 animate-scale-up">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30">Manage Categories</h3>
              <button onClick={addCategory} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Add New</button>
            </div>
            <div className="space-y-3">
              {localSettings.categories.map(cat => (
                <div key={cat.id} className={cardStyles}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 shrink-0">
                      <label className={labelStyles}>Icon</label>
                      <input className={`${inputStyles} text-center text-lg`} value={cat.icon} onChange={e => updateCategory(cat.id, 'icon', e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <label className={labelStyles}>Category Label</label>
                      <input className={inputStyles} value={cat.label} onChange={e => updateCategory(cat.id, 'label', e.target.value)} />
                    </div>
                    <button onClick={() => removeCategory(cat.id)} className={`${dangerButtonStyles} w-12 h-11 self-end`}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Products' && (
          <div className="space-y-6 animate-scale-up">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30">Menu Items</h3>
              <button onClick={addProduct} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Add New</button>
            </div>
            <div className="space-y-5">
              {localSettings.products.map(prod => (
                <div key={prod.id} className={cardStyles}>
                  <div className="flex gap-4 mb-5">
                    <div className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 ${isDark ? 'border-white/5 bg-slate-900' : 'border-slate-100 bg-slate-100'}`}>
                      <img src={prod.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div><label className={labelStyles}>Name</label><input className={inputStyles} value={prod.name} onChange={e => updateProduct(prod.id, 'name', e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelStyles}>Base Price</label><input className={inputStyles} type="number" value={prod.price} onChange={e => updateProduct(prod.id, 'price', parseFloat(e.target.value))} /></div>
                        <div><label className={labelStyles}>Category</label><select className={inputStyles} value={prod.category} onChange={e => updateProduct(prod.id, 'category', e.target.value)}>{localSettings.categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={labelStyles}>Product Image</label>
                      <div className="flex gap-2">
                        <input className={inputStyles} value={prod.image} onChange={e => updateProduct(prod.id, 'image', e.target.value)} placeholder="https://..." />
                        <button 
                          onClick={() => { setCurrentEditingProdId(prod.id); camInputRef.current?.click(); }}
                          className={actionButtonStyles} title="Take Photo">
                          <CameraIcon />
                        </button>
                        <button 
                          onClick={() => { setCurrentEditingProdId(prod.id); fileInputRef.current?.click(); }}
                          className={actionButtonStyles} title="Upload Gallery">
                          <UploadIcon />
                        </button>
                      </div>
                    </div>
                    <div><label className={labelStyles}>Short Description</label><textarea rows={2} className={`${inputStyles} resize-none leading-relaxed`} value={prod.description} onChange={e => updateProduct(prod.id, 'description', e.target.value)} /></div>
                    <div className="flex justify-between items-center pt-3 mt-1 border-t border-white/5">
                      <label className="flex items-center gap-3 text-[10px] font-black uppercase cursor-pointer opacity-70 group">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${prod.isBestseller ? 'bg-blue-600 border-blue-600 text-white' : isDark ? 'border-white/20' : 'border-slate-300'}`}>
                          {prod.isBestseller && <CheckIcon className="w-3.5 h-3.5" />}
                        </div>
                        <input type="checkbox" checked={prod.isBestseller} onChange={e => updateProduct(prod.id, 'isBestseller', e.target.checked)} className="hidden" /> 
                        Recommend (Best Seller)?
                      </label>
                      <button onClick={() => removeProduct(prod.id)} className={`${dangerButtonStyles} px-5 py-2.5 text-[10px] font-black uppercase tracking-wider`}>
                        Delete Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails>({ name: '', phone: '', address: '', diningMode: 'EAT_IN', collectionTime: 'ASAP' });
  const [lastOrderNumber, setLastOrderNumber] = useState<number>(0);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('kiosk_settings').select('config').eq('id', 1).single();
      if (data?.config) setSettings(data.config);
      else if (!data) await supabase.from('kiosk_settings').insert([{ id: 1, config: DEFAULT_SETTINGS }]);
    } catch (err) { console.error("Load failed", err); }
    finally { setLoading(false); }
  }, []);

  const saveToSupabase = async (newSettings: AppSettings) => {
    try {
      const { error } = await supabase.from('kiosk_settings').upsert({ id: 1, config: newSettings });
      if (error) throw error;
      setSettings(newSettings);
      const rgb = hexToRgb(newSettings.primaryColor);
      if (rgb) document.documentElement.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      showToast("Menu Synced Successfully");
    } catch (err) { console.error("Save Error", err); showToast("Sync failed"); }
  };

  const handleOrderConfirmed = async () => {
    if (isSubmittingOrder) return;
    setIsSubmittingOrder(true);
    const orderNumber = Math.floor(Math.random() * 900) + 100;
    try {
      await supabase.from('kiosk_orders').insert([{ order_number: orderNumber, customer_details: userDetails, cart_items: cart, total_price: cartTotal }]);
      setLastOrderNumber(orderNumber);
      setView(AppView.ORDER_CONFIRMED);
    } catch (err) { console.error("Order fail", err); setLastOrderNumber(orderNumber); setView(AppView.ORDER_CONFIRMED); }
    finally { setIsSubmittingOrder(false); }
  };

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  }
  
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
  
  const restartApp = useCallback(() => { 
    setCart([]); 
    setUserDetails({ name: '', phone: '', address: '', diningMode: 'EAT_IN', collectionTime: 'ASAP' }); 
    setView(AppView.LANDING); 
  }, []);

  if (loading) return <div className="h-full w-full flex flex-col items-center justify-center bg-[#0F172A] space-y-4"><div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div><p className="font-black uppercase tracking-widest text-[8px] text-white opacity-40">Loading Kiosk...</p></div>;
  
  return (
    <div className={`max-w-md mx-auto h-full relative shadow-2xl overflow-hidden transition-colors duration-300 ${settings.themeMode === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest z-[100] animate-scale-up shadow-xl border border-white/10">{toast}</div>}
      
      {view === AppView.LANDING && <LandingView settings={settings} onStart={() => setView(AppView.MENU)} />}
      {view === AppView.MENU && <MenuView settings={settings} cartTotal={cartTotal} cartCount={cartCount} onRestart={restartApp} onAdmin={() => setView(AppView.ADMIN)} onSelectProduct={(p) => { setSelectedProduct(p); setView(AppView.PRODUCT_DETAIL); }} onGoToCart={() => setView(AppView.CART)} />}
      {view === AppView.PRODUCT_DETAIL && selectedProduct && <ProductDetailView settings={settings} product={selectedProduct} onBack={() => setView(AppView.MENU)} onAddToCart={addToCart} />}
      {view === AppView.CART && <CartView settings={settings} items={cart} total={cartTotal} onBack={() => setView(AppView.MENU)} onUpdateQuantity={updateQuantity} onCheckout={() => setView(AppView.CHECKOUT)} />}
      {view === AppView.CHECKOUT && <CheckoutView settings={settings} onBack={() => setView(AppView.CART)} onSelectMode={(m) => { setUserDetails({...userDetails, diningMode: m}); setView(AppView.USER_DETAILS); }} />}
      {view === AppView.USER_DETAILS && <UserDetailsView settings={settings} mode={userDetails.diningMode} onBack={() => setView(AppView.CHECKOUT)} onNext={(d) => { setUserDetails(d); setView(AppView.FINAL_SUMMARY); }} initialDetails={userDetails} />}
      {view === AppView.FINAL_SUMMARY && <FinalSummaryView settings={settings} cart={cart} details={userDetails} total={cartTotal} onBack={() => setView(AppView.USER_DETAILS)} onConfirm={handleOrderConfirmed} isSubmitting={isSubmittingOrder} />}
      {view === AppView.ORDER_CONFIRMED && <OrderConfirmedView settings={settings} onRestart={restartApp} orderNumber={lastOrderNumber} />}
      {view === AppView.ADMIN && <AdminView settings={settings} onBack={() => setView(AppView.MENU)} onSave={(s) => { saveToSupabase(s); setView(AppView.MENU); }} onReset={restartApp} />}
    </div>
  );
}

const CartView: React.FC<{
  settings: AppSettings;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
  onBack: () => void;
  total: number;
}> = ({ settings, items, onUpdateQuantity, onCheckout, onBack, total }) => {
  const isDark = settings.themeMode === 'dark';

  return (
    <div className={`h-full flex flex-col animate-scale-up overflow-hidden bg-animated-vertical ${isDark ? 'bg-[#0F172A] from-[#0F172A] via-[#1E293B] to-[#0F172A]' : 'bg-[#F9FAFB] from-[#F9FAFB] via-[#F1F5F9] to-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center justify-between border-b sticky top-0 z-10 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center space-x-3"><button onClick={onBack} className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 flex-shrink-0 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}><BackIcon /></button><h2 className={`text-2xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Basket</h2></div>
        <button onClick={() => onUpdateQuantity('ALL', -9999)} className="font-black uppercase text-[8px] tracking-widest text-red-500 bg-white border border-red-500 px-3 py-2 rounded-full active:bg-red-50 transition-colors shadow-sm whitespace-nowrap">CLEAR ALL</button>
      </header>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar pb-64 smooth-scroll">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <span className="text-5xl">🛒</span>
            <p className={`font-black uppercase tracking-widest text-[10px] opacity-40 ${isDark ? 'text-white' : 'text-slate-400'}`}>Your basket is empty</p>
            <button onClick={onBack} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">Go to Menu</button>
          </div>
        )}

        {items.map((item, idx) => {
          const itemBasePrice = item.price + item.selectedSize.price + item.selectedAddons.reduce((s, a) => s + a.price, 0);
          return (
            <div key={`${item.id}-${idx}`} className={`p-4 rounded-[1.75rem] border-2 flex items-center space-x-4 shadow-sm animate-scale-up transition-all ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`}>
              <div className={`w-20 h-20 rounded-2xl p-2 shrink-0 shadow-inner border ${isDark ? 'bg-[#0F172A] border-white/5' : 'bg-slate-50 border-slate-50'}`}><img src={item.image} className="w-full h-full object-cover rounded-xl" /></div>
              <div className="flex-1 overflow-hidden">
                 <div className="flex justify-between items-start mb-0.5"><div className="overflow-hidden"><h3 className={`font-black text-sm leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3><p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">{item.selectedSize.label}</p></div><button onClick={() => onUpdateQuantity(item.id, -item.quantity)} className={`font-black text-[10px] w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-2 ${isDark ? 'bg-white/5 text-white/30' : 'bg-slate-50 text-slate-400'}`}>✕</button></div>
                 <div className="flex items-center justify-between mt-2"><span className={`font-black text-lg font-oswald whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>{settings.currency}{(itemBasePrice * item.quantity).toFixed(2)}</span><div className={`flex items-center justify-between rounded-xl px-1.5 py-1 border shadow-sm flex-shrink-0 ${isDark ? 'bg-[#0F172A] border-white/5' : 'bg-slate-50 border-slate-200'}`}><button onClick={() => onUpdateQuantity(item.id, -1)} className={`w-8 h-8 font-black text-xl active:scale-90 transition-all flex items-center justify-center rounded-lg shadow-sm border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>−</button><span className={`font-black text-sm tabular-nums min-w-[24px] text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.quantity}</span><button onClick={() => onUpdateQuantity(item.id, 1)} className={`w-8 h-8 font-black text-xl active:scale-90 transition-all flex items-center justify-center rounded-lg shadow-sm border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>+</button></div></div>
              </div>
            </div>
          );
        })}
      </div>
      {items.length > 0 && (
        <div className={`flex-shrink-0 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 border-t rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.15)] space-y-4 z-10 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="space-y-3"><div className="flex justify-between text-slate-400 font-black uppercase text-[8px] tracking-widest"><span>Subtotal</span><span>{settings.currency}{total.toFixed(2)}</span></div><div className={`flex justify-between text-3xl font-black pt-4 border-t-2 ${isDark ? 'border-white/5 text-white' : 'border-slate-50 text-slate-900'}`}><span className="font-oswald text-xl">TOTAL</span><span className="font-oswald" style={{ color: settings.primaryColor }}>{settings.currency}{total.toFixed(2)}</span></div></div>
          <button onClick={onCheckout} className="w-full text-white py-5 rounded-[1.75rem] text-xl font-black uppercase shadow-lg active:scale-[0.98] transition-all bg-[#86BC25] shadow-sm whitespace-nowrap overflow-hidden">Check Out</button>
        </div>
      )}
    </div>
  );
};

const CheckoutView: React.FC<{ settings: AppSettings; onBack: () => void; onSelectMode: (method: DiningMode) => void }> = ({ settings, onBack, onSelectMode }) => {
  const isDark = settings.themeMode === 'dark';
  return (
    <div className={`h-full flex flex-col animate-scale-up ${isDark ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center space-x-3 border-b ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}><button onClick={onBack} className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}><BackIcon /></button><h2 className={`text-2xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Type</h2></header>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center space-y-4 no-scrollbar smooth-scroll"><h3 className={`text-center font-black uppercase tracking-widest text-[10px] mb-2 opacity-40 ${isDark ? 'text-white' : 'text-slate-400'}`}>Choose your service</h3><div className="grid grid-cols-1 gap-3 w-full max-w-[280px]"><button onClick={() => onSelectMode('EAT_IN')} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all active:scale-95 shadow-lg ${isDark ? 'bg-slate-800 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`}><span className="text-4xl">🍽️</span><span className="text-base font-black uppercase tracking-tight">Eat In</span></button><button onClick={() => onSelectMode('TAKE_AWAY')} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all active:scale-95 shadow-lg ${isDark ? 'bg-slate-800 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`}><span className="text-4xl">🥡</span><span className="text-base font-black uppercase tracking-tight">Take Away</span></button><button onClick={() => onSelectMode('DELIVERY')} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all active:scale-95 shadow-lg ${isDark ? 'bg-slate-800 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`}><span className="text-4xl">🚚</span><span className="text-base font-black uppercase tracking-tight">Delivery</span></button></div></div>
    </div>
  );
};

const UserDetailsView: React.FC<{ settings: AppSettings; mode: DiningMode; onBack: () => void; onNext: (details: UserDetails) => void; initialDetails: UserDetails; }> = ({ settings, mode, onBack, onNext, initialDetails }) => {
  const [details, setDetails] = useState<UserDetails>(initialDetails);
  const isDark = settings.themeMode === 'dark';
  const inputClass = `w-full p-5 rounded-2xl border-2 font-bold transition-all outline-none text-sm ${isDark ? 'bg-slate-800 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-100 text-slate-900 focus:border-blue-600'}`;
  const isValid = details.name.trim().length > 0 && details.phone.trim().length > 0;

  return (
    <div className={`h-full flex flex-col animate-scale-up ${isDark ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center space-x-3 border-b ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}><button onClick={onBack} className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}><BackIcon /></button><h2 className={`text-2xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Details</h2></header>
      <form className="flex-1 p-4 space-y-5 overflow-y-auto no-scrollbar"><div className="space-y-1.5"><label className="text-[8px] font-black uppercase tracking-widest px-1 opacity-50">Full Name</label><input required type="text" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} placeholder="Your Name" className={inputClass} /></div><div className="space-y-1.5"><label className="text-[8px] font-black uppercase tracking-widest px-1 opacity-50">Mobile Number</label><input required type="tel" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} placeholder="+00 000 000 000" className={inputClass} /></div>{mode === 'DELIVERY' && <div className="space-y-1.5"><label className="text-[8px] font-black uppercase tracking-widest px-1 opacity-50">Delivery Address</label><textarea required rows={3} value={details.address} onChange={e => setDetails({...details, address: e.target.value})} placeholder="House, Street, Area..." className={`${inputClass} resize-none`} /></div>}</form>
      <div className="px-6 pb-8 pt-4 border-t"><button onClick={() => onNext(details)} className="w-full text-white py-5 rounded-2xl text-lg font-black uppercase shadow-lg active:scale-[0.98] transition-all bg-blue-600 disabled:opacity-50" disabled={!isValid}>Continue</button></div>
    </div>
  );
};

const FinalSummaryView: React.FC<{ settings: AppSettings; cart: CartItem[]; details: UserDetails; total: number; onBack: () => void; onConfirm: () => void; isSubmitting: boolean; }> = ({ settings, cart, details, total, onBack, onConfirm, isSubmitting }) => {
  const isDark = settings.themeMode === 'dark';
  return (
    <div className={`h-full flex flex-col animate-scale-up ${isDark ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center space-x-3 border-b ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}><button onClick={onBack} className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}><BackIcon /></button><h2 className={`text-2xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Review</h2></header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-64">
        <section className="space-y-3"><h3 className="text-[8px] font-black uppercase tracking-widest opacity-40">Your Details</h3><div className={`p-5 rounded-3xl border-2 space-y-3 ${isDark ? 'bg-slate-800/50 border-white/5 text-white' : 'bg-white border-slate-50 text-slate-900'}`}><div className="flex items-center gap-3"><span className="text-2xl">👤</span><div className="overflow-hidden"><p className="font-black text-sm truncate">{details.name}</p><p className="text-[10px] opacity-50 truncate">{details.phone}</p></div></div><div className="flex items-center gap-3 border-t pt-3 border-slate-100/10"><span className="text-2xl">{details.diningMode === 'DELIVERY' ? '🚚' : '🥡'}</span><p className="font-black uppercase text-[10px]">{details.diningMode.replace('_', ' ')}</p></div></div></section>
        <section className="space-y-3"><h3 className="text-[8px] font-black uppercase tracking-widest opacity-40">Items</h3><div className="space-y-2">{cart.map((item, idx) => (<div key={idx} className={`p-3 rounded-2xl flex justify-between items-center ${isDark ? 'bg-slate-800/30 text-white' : 'bg-white shadow-sm text-slate-900'}`}><div className="flex items-center gap-2 overflow-hidden"><span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>{item.quantity}</span><p className="font-bold text-xs truncate">{item.name}</p></div><p className="font-black font-oswald text-xs ml-2">{settings.currency}{((item.price + item.selectedSize.price) * item.quantity).toFixed(2)}</p></div>))}</div></section>
      </div>
      <div className={`flex-shrink-0 px-6 pb-8 pt-6 border-t rounded-t-[2.5rem] shadow-2xl ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white'}`}><div className="flex justify-between items-end mb-4"><span className="text-slate-400 font-black uppercase text-[10px]">Grand Total</span><span className="text-3xl font-black font-oswald" style={{ color: settings.primaryColor }}>{settings.currency}{total.toFixed(2)}</span></div><button onClick={onConfirm} disabled={isSubmitting} className="w-full text-white py-5 rounded-2xl text-xl font-black uppercase shadow-lg bg-[#86BC25]">{isSubmitting ? 'Processing...' : 'Place Order'}</button></div>
    </div>
  );
};
