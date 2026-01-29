
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AppView, CartItem, CategoryType, Product, UserDetails, AppSettings, Category, SizeOption, AddonOption, WorkingDay, DiningMode } from './types';
import { DEFAULT_SETTINGS, THEME_PRESETS } from './constants';

/**
 * --- SVG Icons ---
 */
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const AdminIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const CameraIcon = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

/**
 * --- Utils ---
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

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
  <div className="h-full w-full flex flex-col items-center justify-center p-8 space-y-12 animate-scale-up cursor-pointer" style={{ backgroundColor: settings.primaryColor }} onClick={onStart}>
    <div className="bg-white p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transform transition-transform active:scale-95">
      <h1 className="text-5xl font-black tracking-tighter italic select-none" style={{ color: settings.primaryColor }}>{settings.brandName}</h1>
    </div>
    <div className="text-center space-y-4 text-white">
      <h2 className="text-4xl font-black font-oswald tracking-tight uppercase">Touch to start</h2>
      <p className="text-xl opacity-90 font-medium">Your feast awaits</p>
    </div>
    <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
      {settings.categories.slice(0, 4).map((cat, idx) => (
        <div key={cat.id} className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl transition-transform active:scale-95">
          {cat.backgroundImage ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <img 
                src={cat.backgroundImage} 
                alt={cat.label} 
                className="w-full h-full object-cover animate-breathing-hero fade-edges-mask"
                style={{ animationDelay: `${idx * 1.2}s` }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />
          )}
          {/* Labels and icons removed as requested for a cleaner sensation */}
        </div>
      ))}
    </div>
    <div className="flex flex-col items-center animate-bounce mt-8 text-white">
      <div className="w-14 h-14 rounded-full border-4 border-white/30 flex items-center justify-center backdrop-blur-sm shadow-lg"><span className="text-2xl font-bold">↓</span></div>
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
  const [activeCategory, setActiveCategory] = useState<CategoryType>(settings.categories[0]?.id || 'BURGERS');
  const [searchQuery, setSearchQuery] = useState('');
  const navScrollProps = useGrabToScroll('horizontal');
  const mainScrollProps = useGrabToScroll('vertical');
  const isDark = settings.themeMode === 'dark';

  const isHoliday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return settings.forceHolidays.includes(todayStr);
  }, [settings.forceHolidays]);

  const filteredProducts = useMemo(() => {
    let list = settings.products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return activeCategory === 'RECOMMANDED' ? list.filter(p => p.isBestseller) : list.filter(p => p.category === activeCategory);
  }, [activeCategory, settings.products, searchQuery]);

  return (
    <div className={`h-full flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      <header className={`flex-shrink-0 flex items-center justify-between p-4 border-b shadow-sm z-20 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center space-x-3">
           <div className="px-3 py-1.5 text-white font-black italic rounded-lg text-sm shadow-sm transition-transform" style={{ backgroundColor: settings.primaryColor }}>{settings.brandName}</div>
           <h2 className={`text-xl font-bold font-oswald tracking-tight uppercase overflow-hidden whitespace-nowrap text-ellipsis max-w-[120px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
             {searchQuery.trim() ? 'Search' : activeCategory}
           </h2>
        </div>
        <div className="flex items-center space-x-2">
          {/* Visible Admin/Settings Button */}
          <button onClick={onAdmin} className={`p-2.5 rounded-xl transition-all active:scale-90 border shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white/70' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'}`}>
            <AdminIcon />
          </button>
          <button onClick={onRestart} className="font-black uppercase tracking-wider text-[10px] border-2 px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm" style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}>
            RESTART
          </button>
        </div>
      </header>

      {isHoliday && (
        <div className="bg-amber-100 text-amber-900 px-4 py-3 text-sm font-bold border-b border-amber-200 flex items-center justify-center gap-3 animate-pulse">
          <span className="text-xl">⚠️</span>
          <span className="uppercase tracking-tight">Today is a holiday. Store closed for orders.</span>
        </div>
      )}

      {/* Categories Slider Container */}
      <div className={`relative flex-shrink-0 border-b overflow-hidden ${isDark ? 'bg-[#1E293B]' : 'bg-white'}`}>
        {/* Animated Subtle Background Coloring Effect - Higher Opacity in Dark Mode */}
        <div 
          className={`absolute inset-0 bg-animated-nav pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-[0.12]' : 'opacity-[0.06]'}`}
          style={{ 
            backgroundImage: `linear-gradient(90deg, transparent, ${settings.primaryColor}, transparent, ${settings.primaryColor}, transparent)` 
          }}
        ></div>
        
        {/* Scroll Indicators (Subtle Edge Fades) - Matched to Theme Background */}
        <div className="absolute inset-y-0 left-0 w-12 z-20 pointer-events-none transition-all duration-300" style={{ background: `linear-gradient(to right, ${isDark ? '#1E293B' : '#FFFFFF'}, transparent)` }}></div>
        <div className="absolute inset-y-0 right-0 w-12 z-20 pointer-events-none transition-all duration-300" style={{ background: `linear-gradient(to left, ${isDark ? '#1E293B' : '#FFFFFF'}, transparent)` }}></div>

        {/* Navigation Wrapper with Mask for Nice Fading Look */}
        <div className="mask-edges">
          <nav {...navScrollProps} className={`overflow-x-auto no-scrollbar py-6 px-8 flex flex-nowrap items-center space-x-5 z-10 touch-pan-x select-none`}>
            {settings.categories.map(cat => (
              <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }} 
                className={`flex-shrink-0 flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all whitespace-nowrap border-2 shadow-sm ${activeCategory === cat.id && !searchQuery ? 'text-white shadow-xl scale-105 ring-4 ring-white/10' : isDark ? 'bg-slate-800/80 border-white/5 text-white/40 hover:text-white/60' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600'}`} 
                style={activeCategory === cat.id && !searchQuery ? { backgroundColor: settings.primaryColor, borderColor: settings.primaryColor } : {}}>
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-black uppercase tracking-tighter">{cat.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className={`flex-shrink-0 p-4 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-b'}`}>
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400"><SearchIcon /></div>
          <input type="text" placeholder="I'm craving..." 
            className={`w-full border-2 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all ${isDark ? 'bg-[#0F172A] border-white/10 text-white focus:border-white/30' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-slate-200 shadow-inner'}`}
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <main {...mainScrollProps} className="flex-1 overflow-y-auto p-4 no-scrollbar pb-48">
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map(p => (
            <div key={p.id} onClick={() => onSelectProduct(p)} 
              className={`relative rounded-[32px] border-2 transition-all active:scale-[0.98] flex items-stretch p-3 overflow-hidden min-h-[160px] cursor-pointer shadow-sm ${p.isBestseller ? 'border-amber-400 bg-amber-400/5' : isDark ? 'bg-[#1E293B] border-white/5 hover:border-white/20' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
              {p.isBestseller && <div className="absolute top-0 left-0 bg-amber-400 text-white text-[10px] font-black px-4 py-1.5 rounded-br-2xl z-10 uppercase italic shadow-md">Must Try</div>}
              <div className={`w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center rounded-3xl mr-4 shrink-0 self-center overflow-hidden shadow-inner ${isDark ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform hover:scale-110" loading="lazy" />
              </div>
              <div className="flex-1 flex flex-col py-2">
                <div className="flex-1 mb-2">
                  <h3 className={`text-base font-black leading-tight mb-1 pr-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
                  <p className={`text-[11px] line-clamp-2 leading-relaxed ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{p.description}</p>
                </div>
                <div className="flex justify-between items-center mt-auto pt-2">
                  <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{settings.currency} {p.price.toFixed(2)}</span>
                  <button disabled={isHoliday} className={`text-white w-12 h-12 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl active:scale-90 transition-all flex-shrink-0 leading-none pb-1 ${isHoliday ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:brightness-110'}`} style={{ backgroundColor: settings.primaryColor }}>+</button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-50 space-y-4">
              <span className="text-6xl">🔍</span>
              <p className="font-bold uppercase tracking-widest text-xs text-center">No products found matching your search</p>
            </div>
          )}
        </div>
      </main>
      
      {cartCount > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 backdrop-blur-xl border-t flex items-center gap-4 animate-scale-up shadow-[0_-20px_50px_rgba(0,0,0,0.15)] z-30 ${isDark ? 'bg-[#0F172A]/90 border-white/10' : 'bg-white/90 border-slate-100'}`}>
           <div onClick={onGoToCart} className="flex-1 bg-[#86BC25] hover:bg-[#76a520] active:scale-95 transition-all text-white p-5 rounded-[2.5rem] flex items-center justify-between font-black shadow-sm cursor-pointer">
            <div className="flex items-center space-x-4">
               <div className="bg-white text-[#86BC25] w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg text-lg animate-bounce-short">{cartCount}</div>
               <span className="text-lg uppercase tracking-tight">Basket</span>
            </div>
            <span className="text-2xl font-oswald tracking-wide">{settings.currency} {cartTotal.toFixed(2)}</span>
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
    <div className={`h-full flex flex-col animate-scale-up overflow-hidden ${isDark ? 'bg-[#0F172A]' : 'bg-white'}`}>
      <header className={`flex-shrink-0 p-5 flex items-center space-x-4 border-b sticky top-0 z-10 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <button onClick={onBack} className={`p-2 rounded-2xl active:bg-opacity-80 flex items-center justify-center w-12 h-12 flex-shrink-0 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}><BackIcon /></button>
        <h2 className={`text-xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Customize</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-64">
        <div className="flex flex-col items-center">
           <div className={`w-72 h-72 rounded-[3rem] flex items-center justify-center p-6 mb-8 shadow-inner overflow-hidden border-2 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <img src={product.image} className="w-full h-full object-cover rounded-[2rem] shadow-2xl" loading="eager" />
           </div>
           <h3 className={`text-4xl font-black text-center leading-none mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.name}</h3>
           <p className={`text-center font-medium max-w-xs mx-auto text-sm leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{product.description}</p>
        </div>
        
        {product.sizes.length > 0 && (
          <section className="space-y-4">
             <div className="flex justify-between items-center">
               <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Select Size</h4>
               <span className="text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider" style={{ color: settings.primaryColor, backgroundColor: `${settings.primaryColor}15` }}>Required</span>
             </div>
             <div className="grid grid-cols-3 gap-3">
               {product.sizes.map(s => (
                 <button key={s.label} onClick={() => setSelectedSize(s)} 
                  className={`py-5 rounded-3xl border-2 font-black transition-all flex flex-col items-center shadow-sm ${selectedSize.label === s.label ? 'scale-105 ring-4 ring-opacity-20' : isDark ? 'border-white/5 text-white/30 bg-white/5' : 'border-slate-50 text-slate-400 bg-white'}`} 
                  style={selectedSize.label === s.label ? { borderColor: settings.primaryColor, backgroundColor: `${settings.primaryColor}10`, color: settings.primaryColor, ringColor: settings.primaryColor } : {}}>
                   <span className="text-sm">{s.label}</span>
                   <span className="text-[10px] opacity-70 mt-1">+{settings.currency} {s.price.toFixed(2)}</span>
                 </button>
               ))}
             </div>
          </section>
        )}

        {product.addons.length > 0 && (
          <section className="space-y-4">
             <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Add Extras</h4>
             <div className="grid grid-cols-1 gap-3 pb-12">
               {product.addons.map(addon => (
                 <label key={addon.label} className={`flex items-center justify-between p-6 border-2 rounded-[2rem] active:bg-opacity-50 transition-all cursor-pointer shadow-sm ${selectedAddons.find(a => a.label === addon.label) ? 'border-opacity-100' : isDark ? 'bg-slate-800/30 border-white/5' : 'bg-white border-slate-50 hover:border-slate-100'}`} style={selectedAddons.find(a => a.label === addon.label) ? { borderColor: settings.primaryColor, backgroundColor: `${settings.primaryColor}05` } : {}}>
                   <div className="flex flex-col">
                     <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{addon.label}</span>
                     <span className="text-xs font-black mt-0.5" style={{ color: settings.primaryColor }}>+{settings.currency} {addon.price.toFixed(2)}</span>
                   </div>
                   <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${selectedAddons.find(a => a.label === addon.label) ? 'text-white shadow-lg' : 'border-slate-200 bg-white'}`} style={selectedAddons.find(a => a.label === addon.label) ? { backgroundColor: settings.primaryColor, borderColor: settings.primaryColor } : {}}>
                     {selectedAddons.find(a => a.label === addon.label) && <CheckIcon className="w-5 h-5" />}
                   </div>
                   <input type="checkbox" className="hidden" checked={!!selectedAddons.find(a => a.label === addon.label)}
                    onChange={() => setSelectedAddons(prev => prev.find(a => a.label === addon.label) ? prev.filter(a => a.label !== addon.label) : [...prev, addon])} />
                 </label>
               ))}
             </div>
          </section>
        )}
      </div>
      <div className={`flex-shrink-0 p-8 border-t rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] space-y-6 z-10 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className={`flex items-center justify-between p-2 rounded-[2rem] border-2 ${isDark ? 'bg-[#0F172A]' : 'bg-slate-50 border-slate-100'}`}>
          <button onClick={() => setQuantity(q => Math.max(1, q-1))} className={`w-16 h-16 border-2 rounded-2xl text-4xl font-black flex items-center justify-center active:scale-95 transition-all shadow-md ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>−</button>
          <span className={`text-4xl font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{quantity}</span>
          <button onClick={() => setQuantity(q => q+1)} className={`w-16 h-16 border-2 rounded-2xl text-4xl font-black flex items-center justify-center active:scale-95 transition-all shadow-md ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>+</button>
        </div>
        <button onClick={() => onAddToCart(product, quantity, selectedSize, selectedAddons)} className="w-full text-white py-7 rounded-[2rem] text-2xl font-black uppercase tracking-tight shadow-2xl active:scale-[0.98] transition-all flex items-center justify-between px-10 shadow-sm" style={{ backgroundColor: settings.primaryColor }}>
          <span>Add To Basket</span><span className="font-oswald text-3xl">{settings.currency} {totalPrice.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
};

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
    <div className={`h-full flex flex-col animate-scale-up overflow-hidden ${isDark ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 p-6 flex items-center justify-between border-b sticky top-0 z-10 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center space-x-4">
           <button onClick={onBack} className={`p-2 rounded-2xl flex items-center justify-center w-12 h-12 flex-shrink-0 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}><BackIcon /></button>
           <h2 className={`text-3xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Basket</h2>
        </div>
        <button onClick={() => onUpdateQuantity('ALL', -9999)} className="font-black uppercase text-[10px] tracking-widest text-red-500 bg-white border border-red-500 px-4 py-2.5 rounded-full active:bg-red-50 transition-colors shadow-sm">CLEAR ALL</button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-64">
        {items.map((item, idx) => {
          const itemBasePrice = item.price + item.selectedSize.price + item.selectedAddons.reduce((s, a) => s + a.price, 0);
          return (
            <div key={`${item.id}-${idx}`} className={`p-5 rounded-[2.5rem] border-2 flex items-center space-x-5 shadow-sm animate-scale-up transition-all ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`}>
              <div className={`w-24 h-24 rounded-3xl p-3 shrink-0 shadow-inner border ${isDark ? 'bg-[#0F172A] border-white/5' : 'bg-slate-50 border-slate-50'}`}>
                <img src={item.image} className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                   <div>
                     <h3 className={`font-black text-lg leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{item.selectedSize.label}</p>
                   </div>
                   <button onClick={() => onUpdateQuantity(item.id, -item.quantity)} className={`font-black text-xs w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDark ? 'bg-white/5 text-white/30 hover:bg-white/10' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>✕</button>
                 </div>
                 {item.selectedAddons.length > 0 && (
                   <div className="flex flex-wrap gap-1 mt-2 mb-3">
                     {item.selectedAddons.map(a => <span key={a.label} className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>{a.label}</span>)}
                   </div>
                 )}
                 <div className="flex items-center justify-between mt-auto">
                    <span className={`font-black text-xl font-oswald ${isDark ? 'text-white' : 'text-slate-900'}`}>{settings.currency} {(itemBasePrice * item.quantity).toFixed(2)}</span>
                    <div className={`flex items-center justify-between rounded-2xl px-2 py-1.5 border shadow-sm ${isDark ? 'bg-[#0F172A] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className={`w-10 h-10 font-black text-2xl active:scale-90 transition-all flex items-center justify-center rounded-xl shadow-sm border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>−</button>
                      <span className={`font-black tabular-nums min-w-[32px] text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className={`w-10 h-10 font-black text-2xl active:scale-90 transition-all flex items-center justify-center rounded-xl shadow-sm border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>+</button>
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-6">
            <span className="text-8xl grayscale opacity-30">🍗</span>
            <p className="font-black uppercase tracking-[0.2em] text-sm text-center">Your basket is currently empty</p>
            <button onClick={onBack} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">Start Ordering</button>
          </div>
        )}
      </div>
      {items.length > 0 && (
        <div className={`flex-shrink-0 p-8 border-t rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] space-y-6 z-10 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="space-y-4">
            <div className="flex justify-between text-slate-400 font-black uppercase text-[10px] tracking-widest"><span>Subtotal</span><span>{settings.currency} {total.toFixed(2)}</span></div>
            <div className={`flex justify-between text-4xl font-black pt-6 border-t-2 ${isDark ? 'border-white/5 text-white' : 'border-slate-50 text-slate-900'}`}>
               <span className="font-oswald">TOTAL</span><span className="font-oswald" style={{ color: settings.primaryColor }}>{settings.currency} {total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={onCheckout} className="w-full text-white py-7 rounded-[2rem] text-2xl font-black uppercase shadow-2xl active:scale-[0.98] transition-all bg-[#86BC25] shadow-sm">Check Out</button>
        </div>
      )}
    </div>
  );
};

const CheckoutView: React.FC<{ settings: AppSettings; onBack: () => void; onSelectMode: (method: DiningMode) => void }> = ({ settings, onBack, onSelectMode }) => {
  const isDark = settings.themeMode === 'dark';
  return (
    <div className={`h-full flex flex-col animate-scale-up ${isDark ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 p-6 flex items-center space-x-4 border-b ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
         <button onClick={onBack} className={`p-2 rounded-2xl flex items-center justify-center w-12 h-12 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}><BackIcon /></button>
         <h2 className={`text-3xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Type</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center space-y-6 no-scrollbar">
         <h3 className={`text-center font-black uppercase tracking-widest text-xs mb-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Choose your service</h3>
         <div className="grid grid-cols-1 gap-4 w-full max-sm:max-w-sm">
            <button onClick={() => onSelectMode('EAT_IN')} className={`p-8 rounded-[2.5rem] border-4 flex flex-col items-center gap-3 transition-all active:scale-95 shadow-xl ${isDark ? 'bg-slate-800 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
               <span className="text-6xl">🍽️</span>
               <span className="text-xl font-black uppercase tracking-tight">Eat In</span>
            </button>
            <button onClick={() => onSelectMode('TAKE_AWAY')} className={`p-8 rounded-[2.5rem] border-4 flex flex-col items-center gap-3 transition-all active:scale-95 shadow-xl ${isDark ? 'bg-slate-800 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
               <span className="text-6xl">🥡</span>
               <span className="text-xl font-black uppercase tracking-tight">Take Away</span>
            </button>
            <button onClick={() => onSelectMode('DELIVERY')} className={`p-8 rounded-[2.5rem] border-4 flex flex-col items-center gap-3 transition-all active:scale-95 shadow-xl ${isDark ? 'bg-slate-800 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
               <span className="text-6xl">🚚</span>
               <span className="text-xl font-black uppercase tracking-tight">Delivery</span>
            </button>
         </div>
      </div>
    </div>
  );
};

const UserDetailsView: React.FC<{ 
  settings: AppSettings; 
  mode: DiningMode; 
  onBack: () => void; 
  onNext: (details: UserDetails) => void;
  initialDetails: UserDetails;
}> = ({ settings, mode, onBack, onNext, initialDetails }) => {
  const [details, setDetails] = useState<UserDetails>(initialDetails);
  const isDark = settings.themeMode === 'dark';

  const inputClass = `w-full p-6 rounded-3xl border-2 font-bold transition-all outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-100 text-slate-900 focus:border-blue-600'}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.name || !details.phone || (mode === 'DELIVERY' && !details.address)) return;
    onNext(details);
  };

  return (
    <div className={`h-full flex flex-col animate-scale-up ${isDark ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 p-6 flex items-center space-x-4 border-b ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
         <button onClick={onBack} className={`p-2 rounded-2xl flex items-center justify-center w-12 h-12 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}><BackIcon /></button>
         <h2 className={`text-3xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Details</h2>
      </header>
      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Full Name</label>
          <input required type="text" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} placeholder="Your Name" className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Mobile Number</label>
          <input required type="tel" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} placeholder="+00 000 000 000" className={inputClass} />
        </div>
        {mode === 'DELIVERY' && (
          <div className="space-y-2 animate-scale-up">
            <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Delivery Address</label>
            <textarea required rows={3} value={details.address} onChange={e => setDetails({...details, address: e.target.value})} placeholder="House, Street, Area..." className={`${inputClass} resize-none`} />
          </div>
        )}
      </form>
      <div className={`p-8 border-t rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1) ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white'}`}>
        <button onClick={handleSubmit} className="w-full text-white py-6 rounded-3xl text-xl font-black uppercase shadow-xl transition-all active:scale-[0.98] bg-blue-600 disabled:opacity-50" disabled={!details.name || !details.phone || (mode === 'DELIVERY' && !details.address)}>Continue</button>
      </div>
    </div>
  );
};

const FinalSummaryView: React.FC<{ 
  settings: AppSettings; 
  cart: CartItem[]; 
  details: UserDetails; 
  total: number;
  onBack: () => void; 
  onConfirm: () => void; 
}> = ({ settings, cart, details, total, onBack, onConfirm }) => {
  const isDark = settings.themeMode === 'dark';
  return (
    <div className={`h-full flex flex-col animate-scale-up ${isDark ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 p-6 flex items-center space-x-4 border-b ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
         <button onClick={onBack} className={`p-2 rounded-2xl flex items-center justify-center w-12 h-12 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}><BackIcon /></button>
         <h2 className={`text-3xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Review Order</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-64">
        <section className="space-y-4">
          <h3 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Your Details</h3>
          <div className={`p-6 rounded-[2.5rem] space-y-4 border-2 ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-slate-50 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <span className="text-3xl">👤</span>
              <div><p className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{details.name}</p><p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{details.phone}</p></div>
            </div>
            <div className="flex items-center gap-4 border-t pt-4 mt-4 border-slate-100/10">
              <span className="text-3xl">{details.diningMode === 'DELIVERY' ? '🚚' : details.diningMode === 'TAKE_AWAY' ? '🥡' : '🍽️'}</span>
              <div><p className={`font-black uppercase text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{details.diningMode.replace('_', ' ')}</p>{details.address && <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'} mt-1`}>{details.address}</p>}</div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Items Summary</h3>
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <div key={idx} className={`p-4 rounded-3xl flex justify-between items-center ${isDark ? 'bg-slate-800/30' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'}`}>{item.quantity}x</span>
                  <div>
                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{item.selectedSize.label}</p>
                  </div>
                </div>
                <p className={`font-black font-oswald ${isDark ? 'text-white' : 'text-slate-900'}`}>{settings.currency} {((item.price + item.selectedSize.price + item.selectedAddons.reduce((s,a) => s + a.price, 0)) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className={`flex-shrink-0 p-8 border-t rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] space-y-6 z-10 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="flex justify-between items-end">
          <span className="text-slate-400 font-black uppercase text-xs">Grand Total</span>
          <span className="text-4xl font-black font-oswald" style={{ color: settings.primaryColor }}>{settings.currency} {total.toFixed(2)}</span>
        </div>
        <button onClick={onConfirm} className="w-full text-white py-7 rounded-[2rem] text-2xl font-black uppercase shadow-2xl active:scale-[0.98] transition-all bg-[#86BC25] shadow-sm">Place Order Now</button>
      </div>
    </div>
  );
};

const OrderConfirmedView: React.FC<{ settings: AppSettings; onRestart: () => void }> = ({ settings, onRestart }) => {
  const isDark = settings.themeMode === 'dark';
  return (
    <div className={`h-full flex flex-col items-center justify-center p-12 text-center space-y-8 animate-scale-up ${isDark ? 'bg-[#0F172A]' : 'bg-white'}`}>
      <div className="w-40 h-40 bg-[#86BC25] rounded-full flex items-center justify-center text-white shadow-[0_20px_60px_-10px_rgba(134,188,37,0.6)]">
        <CheckIcon className="w-20 h-20" />
      </div>
      <div className="space-y-3">
        <h2 className={`text-4xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Received!</h2>
        <p className={`text-lg font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Your food is being prepared. Enjoy!</p>
      </div>
      <div className={`p-8 rounded-3xl border-2 w-full max-w-xs space-y-1 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Order Number</p>
        <p className={`text-6xl font-black font-oswald ${isDark ? 'text-white' : 'text-slate-900'}`}>#{Math.floor(Math.random() * 900) + 100}</p>
      </div>
      <button onClick={onRestart} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">Back to Home</button>
    </div>
  );
};

const AdminView: React.FC<{
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onBack: () => void;
  onReset: () => void;
}> = ({ settings, onSave, onBack, onReset }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'General' | 'Categories' | 'Products'>('General');
  const [editingOptionsId, setEditingOptionsId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [activeImageProductId, setActiveImageProductId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isDark = localSettings.themeMode === 'dark';

  const toggleOptionsEdit = (id: string) => {
    setEditingOptionsId(prev => prev === id ? null : id);
  };

  const updateWorkingHour = (idx: number, field: keyof WorkingDay, value: any) => {
    const next = [...localSettings.workingHours];
    next[idx] = { ...next[idx], [field]: value };
    setLocalSettings({ ...localSettings, workingHours: next });
  };

  const addHoliday = (date: string) => {
    if (!date || localSettings.forceHolidays.includes(date)) return;
    setLocalSettings({ ...localSettings, forceHolidays: [...localSettings.forceHolidays, date].sort() });
  };

  const removeHoliday = (date: string) => {
    setLocalSettings({ ...localSettings, forceHolidays: localSettings.forceHolidays.filter(d => d !== date) });
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeImageProductId) {
      try {
        const base64 = await fileToBase64(file);
        const nextProducts = [...localSettings.products];
        const idx = nextProducts.findIndex(p => p.id === activeImageProductId);
        if (idx !== -1) {
          nextProducts[idx].image = base64;
          setLocalSettings({ ...localSettings, products: nextProducts });
        }
      } catch (err) { console.error("Img Fail", err); }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    setActiveImageProductId(null);
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return localSettings.products;
    const q = productSearch.toLowerCase();
    return localSettings.products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [localSettings.products, productSearch]);

  const inputStyles = `w-full border-2 p-4 rounded-2xl font-bold transition-all outline-none shadow-sm ${isDark ? 'bg-[#0F172A] border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-100 text-slate-900 focus:border-slate-300'}`;
  const cardStyles = `p-6 border-2 rounded-3xl space-y-4 shadow-sm transition-all ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`;

  return (
    <div className={`h-full flex flex-col animate-scale-up overflow-hidden ${isDark ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-900'}`}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageFile} />

      <header className={`flex-shrink-0 p-5 border-b flex items-center justify-between ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center space-x-3"><button onClick={onBack} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}><BackIcon /></button><h2 className="font-black text-xl font-oswald uppercase tracking-tight">Admin</h2></div>
        <button onClick={() => onSave(localSettings)} className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all uppercase tracking-widest">Save Changes</button>
      </header>
      <div className={`flex-shrink-0 flex border-b overflow-x-auto no-scrollbar ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white'}`}>
        {(['General', 'Categories', 'Products'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 min-w-[120px] py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === t ? 'border-b-4 border-blue-600 text-blue-600' : isDark ? 'text-white/30' : 'text-slate-400'}`}>{t}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-80">
        {activeTab === 'General' && (
          <div className="space-y-10 animate-scale-up">
            <section className="space-y-4">
              <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Brand Identity</h3>
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 px-1">Brand Name</label><input className={inputStyles} value={localSettings.brandName} onChange={e => setLocalSettings({...localSettings, brandName: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 px-1">Currency</label><input className={inputStyles} value={localSettings.currency} onChange={e => setLocalSettings({...localSettings, currency: e.target.value})} /></div>
              </div>
            </section>
            
            <section className="space-y-4">
              <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Theme & Presets</h3>
              <div className={cardStyles}>
                <div className="flex gap-2">
                  <button onClick={() => setLocalSettings({...localSettings, themeMode: 'light'})} className={`flex-1 py-4 rounded-2xl border-2 font-black flex items-center justify-center gap-3 transition-all ${localSettings.themeMode === 'light' ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-100 grayscale opacity-40'}`}><SunIcon /> LIGHT</button>
                  <button onClick={() => setLocalSettings({...localSettings, themeMode: 'dark'})} className={`flex-1 py-4 rounded-2xl border-2 font-black flex items-center justify-center gap-3 transition-all ${localSettings.themeMode === 'dark' ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-100 grayscale opacity-40'}`}><MoonIcon /> DARK</button>
                </div>
                <div className="flex gap-3 pt-2">
                  {THEME_PRESETS.map(t => (
                    <button key={t.id} onClick={() => setLocalSettings({...localSettings, primaryColor: t.color})} className={`w-12 h-12 rounded-full border-4 transition-all shadow-lg ${localSettings.primaryColor === t.color ? 'border-blue-600 scale-110' : 'border-white opacity-80'}`} style={{ backgroundColor: t.color }} />
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Operations</h3>
              <div className="grid grid-cols-1 gap-3">
                {localSettings.workingHours.map((wh, idx) => (
                  <div key={wh.day} className={cardStyles}>
                    <div className="flex items-center justify-between">
                      <span className="font-black uppercase tracking-widest text-xs">{wh.day}</span>
                      <input type="checkbox" checked={wh.isOpen} onChange={e => updateWorkingHour(idx, 'isOpen', e.target.checked)} className="w-6 h-6 rounded-lg accent-blue-600" />
                    </div>
                    {wh.isOpen && (
                      <div className="flex items-center gap-3 pt-2">
                        <input type="time" value={wh.openTime} onChange={e => updateWorkingHour(idx, 'openTime', e.target.value)} className={`${inputStyles} py-2 text-center text-xs`} />
                        <span className="font-black text-[9px] text-slate-300">TO</span>
                        <input type="time" value={wh.closeTime} onChange={e => updateWorkingHour(idx, 'closeTime', e.target.value)} className={`${inputStyles} py-2 text-center text-xs`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Special Holidays</h3>
              <div className={cardStyles}>
                <input type="date" className={`${inputStyles} py-3 text-sm`} onChange={(e) => { addHoliday(e.target.value); e.target.value = ''; }} />
                <div className="flex flex-wrap gap-2">
                  {localSettings.forceHolidays.map(d => (
                    <span key={d} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black">
                      {d} <button onClick={() => removeHoliday(d)} className="text-white/50 hover:text-white">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="pt-8">
              <button onClick={() => { if(confirm("This will wipe all data. Confirm factory reset?")) onReset(); }} className="w-full border-2 border-red-500 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 active:bg-red-100 transition-all">FACTORY RESET DEVICE</button>
            </section>
          </div>
        )}

        {activeTab === 'Categories' && (
          <div className="space-y-6 animate-scale-up">
            {localSettings.categories.map((cat, idx) => (
              <div key={cat.id} className={cardStyles}>
                <div className="flex gap-4">
                  <input placeholder="Emoji" className={`${inputStyles} w-24 text-center text-2xl`} value={cat.icon} onChange={e => { const next = [...localSettings.categories]; next[idx].icon = e.target.value; setLocalSettings({...localSettings, categories: next}); }} />
                  <input placeholder="Name" className={inputStyles} value={cat.label} onChange={e => { const next = [...localSettings.categories]; next[idx].label = e.target.value; setLocalSettings({...localSettings, categories: next}); }} />
                </div>
                <button onClick={() => { setLocalSettings({...localSettings, categories: localSettings.categories.filter((_, i) => i !== idx)}); }} className="text-red-500 text-[10px] font-black uppercase flex items-center gap-2 px-1"><TrashIcon className="w-3.5 h-3.5" /> Remove Category</button>
              </div>
            ))}
            <button onClick={() => setLocalSettings({...localSettings, categories: [...localSettings.categories, { id: 'CAT'+Date.now(), label: 'New Category', icon: '❓' }]})} className="w-full border-2 border-dashed border-blue-400 p-6 rounded-[2.5rem] font-black text-blue-500 flex items-center justify-center gap-3 hover:bg-blue-50 transition-all"><PlusIcon /> ADD CATEGORY</button>
          </div>
        )}

        {activeTab === 'Products' && (
          <div className="space-y-8 animate-scale-up">
            <div className="relative mb-6">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search products catalog..." className={`${inputStyles} pl-12`} value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredProducts.map((prod) => {
                const globalIdx = localSettings.products.findIndex(p => p.id === prod.id);
                return (
                  <div key={prod.id} className={cardStyles}>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-slate-200 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-sm">
                        {prod.image ? <img src={prod.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">🖼️</div>}
                      </div>
                      <input className={inputStyles} value={prod.name} onChange={e => { const next = [...localSettings.products]; next[globalIdx].name = e.target.value; setLocalSettings({...localSettings, products: next}); }} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">{localSettings.currency}</span>
                        <input type="number" className={`${inputStyles} pl-12`} value={prod.price} onChange={e => { const next = [...localSettings.products]; next[globalIdx].price = parseFloat(e.target.value) || 0; setLocalSettings({...localSettings, products: next}); }} />
                      </div>
                      <select className={inputStyles} value={prod.category} onChange={e => { const next = [...localSettings.products]; next[globalIdx].category = e.target.value; setLocalSettings({...localSettings, products: next}); }}>
                        {localSettings.categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => { setActiveImageProductId(prod.id); fileInputRef.current?.click(); }} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"><UploadIcon /> Upload</button>
                      <button onClick={() => { setActiveImageProductId(prod.id); cameraInputRef.current?.click(); }} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"><CameraIcon /> Camera</button>
                    </div>

                    <button onClick={() => toggleOptionsEdit(prod.id)} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 transition-all ${editingOptionsId === prod.id ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'border-slate-100 text-slate-400'}`}>
                      {editingOptionsId === prod.id ? 'HIDE EDITOR' : 'EDIT SIZES & ADDONS'}
                    </button>

                    {editingOptionsId === prod.id && (
                      <div className="mt-4 p-6 bg-white rounded-3xl border-2 border-slate-100 space-y-8 animate-scale-up shadow-inner">
                        <div className="space-y-4">
                           <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sizes</h4><button onClick={() => { const next = [...localSettings.products]; next[globalIdx].sizes.push({ label: 'New', price: 0 }); setLocalSettings({...localSettings, products: next}); }} className="bg-blue-600 text-white p-1.5 rounded-lg shadow-md"><PlusIcon className="w-3.5 h-3.5" /></button></div>
                           <div className="space-y-2">
                             {prod.sizes.map((s, si) => (
                               <div key={si} className="flex gap-2 animate-scale-up">
                                 <input className={`${inputStyles} py-2 text-xs flex-1`} value={s.label} onChange={e => { const next = [...localSettings.products]; next[globalIdx].sizes[si].label = e.target.value; setLocalSettings({...localSettings, products: next}); }} />
                                 <input type="number" className={`${inputStyles} py-2 text-xs w-24`} value={s.price} onChange={e => { const next = [...localSettings.products]; next[globalIdx].sizes[si].price = parseFloat(e.target.value) || 0; setLocalSettings({...localSettings, products: next}); }} />
                                 <button onClick={() => { const next = [...localSettings.products]; next[globalIdx].sizes = next[globalIdx].sizes.filter((_, i) => i !== si); setLocalSettings({...localSettings, products: next}); }} className="text-red-500 px-2">✕</button>
                               </div>
                             ))}
                           </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                           <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Addons</h4><button onClick={() => { const next = [...localSettings.products]; next[globalIdx].addons.push({ label: 'New', price: 0 }); setLocalSettings({...localSettings, products: next}); }} className="bg-green-600 text-white p-1.5 rounded-lg shadow-md"><PlusIcon className="w-3.5 h-3.5" /></button></div>
                           <div className="space-y-2">
                             {prod.addons.map((a, ai) => (
                               <div key={ai} className="flex gap-2 animate-scale-up">
                                 <input className={`${inputStyles} py-2 text-xs flex-1`} value={a.label} onChange={e => { const next = [...localSettings.products]; next[globalIdx].addons[ai].label = e.target.value; setLocalSettings({...localSettings, products: next}); }} />
                                 <input type="number" className={`${inputStyles} py-2 text-xs w-24`} value={a.price} onChange={e => { const next = [...localSettings.products]; next[globalIdx].addons[ai].price = parseFloat(e.target.value) || 0; setLocalSettings({...localSettings, products: next}); }} />
                                 <button onClick={() => { const next = [...localSettings.products]; next[globalIdx].addons = next[globalIdx].addons.filter((_, i) => i !== ai); setLocalSettings({...localSettings, products: next}); }} className="text-red-500 px-2">✕</button>
                               </div>
                             ))}
                           </div>
                        </div>
                      </div>
                    )}
                    <button onClick={() => { if(confirm("Permanently delete?")) setLocalSettings({...localSettings, products: localSettings.products.filter(p => p.id !== prod.id)}); }} className="w-full text-red-500 text-[10px] font-black uppercase pt-2 opacity-50 hover:opacity-100 transition-opacity">Remove Product From System</button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setLocalSettings({...localSettings, products: [...localSettings.products, { id: 'P'+Date.now(), name: 'New Menu Item', price: 0, image: '', category: localSettings.categories[0]?.id || '', description: 'Fresh and delicious.', sizes: [{label: 'Regular', price: 0}], addons: [] }]})} className="w-full border-2 border-dashed border-slate-300 p-8 rounded-[3rem] font-black text-slate-400 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all uppercase tracking-[0.2em] text-xs"><PlusIcon /> ADD NEW PRODUCT</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('kiosk_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    phone: '',
    address: '',
    diningMode: 'EAT_IN'
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('kiosk_settings', JSON.stringify(settings));
  }, [settings]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const cartTotal = useMemo(() => {
    return Math.round(cart.reduce((acc, item) => acc + (item.price + item.selectedSize.price + item.selectedAddons.reduce((s, a) => s + a.price, 0)) * item.quantity, 0) * 100) / 100;
  }, [cart]);
  
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const addToCart = useCallback((product: Product, quantity: number, size: SizeOption, addons: AddonOption[]) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === product.id && i.selectedSize.label === size.label && i.selectedAddons.length === addons.length && i.selectedAddons.every((a, i) => a.label === addons[i]?.label));
      if (idx > -1) { 
        const n = [...prev]; n[idx].quantity += quantity; return n; 
      }
      return [...prev, { ...product, quantity, selectedSize: size, selectedAddons: addons }];
    });
    showToast(`${quantity}x ${product.name} added`);
    setView(AppView.MENU);
  }, [showToast]);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart(prev => {
      if (id === 'ALL') return [];
      return prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0);
    });
  }, []);

  const handleModeSelect = (mode: DiningMode) => {
    setUserDetails(prev => ({ ...prev, diningMode: mode }));
    setView(AppView.USER_DETAILS);
  };

  const handleUserDetailsSubmit = (details: UserDetails) => {
    setUserDetails(details);
    setView(AppView.FINAL_SUMMARY);
  };

  const handleFinalConfirm = () => {
    // In a real app, this would send data to POS server
    setView(AppView.ORDER_CONFIRMED);
    showToast(`Order confirmed for ${userDetails.name}!`);
  };

  const restartApp = useCallback(() => {
    setCart([]);
    setUserDetails({ name: '', phone: '', address: '', diningMode: 'EAT_IN' });
    setView(AppView.LANDING);
  }, []);

  return (
    <div className={`max-w-md mx-auto h-full relative shadow-2xl overflow-hidden transition-colors duration-300 ${settings.themeMode === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}>
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] z-[100] animate-scale-up shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-md border border-white/10">
          {toast}
        </div>
      )}

      {view === AppView.LANDING && <LandingView settings={settings} onStart={() => setView(AppView.MENU)} />}
      
      {view === AppView.MENU && (
        <MenuView settings={settings} cartTotal={cartTotal} cartCount={cartCount} onRestart={restartApp} onAdmin={() => setView(AppView.ADMIN)} onSelectProduct={(p) => { setSelectedProduct(p); setView(AppView.PRODUCT_DETAIL); }} onGoToCart={() => setView(AppView.CART)} />
      )}
      
      {view === AppView.PRODUCT_DETAIL && selectedProduct && (
        <ProductDetailView settings={settings} product={selectedProduct} onBack={() => setView(AppView.MENU)} onAddToCart={addToCart} />
      )}
      
      {view === AppView.CART && (
        <CartView settings={settings} items={cart} total={cartTotal} onBack={() => setView(AppView.MENU)} onUpdateQuantity={updateQuantity} onCheckout={() => setView(AppView.CHECKOUT)} />
      )}

      {view === AppView.CHECKOUT && (
        <CheckoutView settings={settings} onBack={() => setView(AppView.CART)} onSelectMode={handleModeSelect} />
      )}

      {view === AppView.USER_DETAILS && (
        <UserDetailsView settings={settings} mode={userDetails.diningMode} onBack={() => setView(AppView.CHECKOUT)} onNext={handleUserDetailsSubmit} initialDetails={userDetails} />
      )}

      {view === AppView.FINAL_SUMMARY && (
        <FinalSummaryView settings={settings} cart={cart} details={userDetails} total={cartTotal} onBack={() => setView(AppView.USER_DETAILS)} onConfirm={handleFinalConfirm} />
      )}

      {view === AppView.ORDER_CONFIRMED && (
        <OrderConfirmedView settings={settings} onRestart={restartApp} />
      )}
      
      {view === AppView.ADMIN && (
        <AdminView settings={settings} onBack={() => setView(AppView.MENU)} onSave={(s) => { setSettings(s); showToast("Success: Database synced"); setView(AppView.MENU); }} onReset={() => { setSettings(DEFAULT_SETTINGS); localStorage.removeItem('kiosk_settings'); showToast("System reset performed"); setView(AppView.LANDING); }} />
      )}
    </div>
  );
}