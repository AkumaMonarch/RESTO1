
import React, { useState, useMemo } from 'react';
import { AppSettings, Product, CategoryType } from './types';
import { useGrabToScroll } from './useGrabToScroll';

export const MenuView: React.FC<{
  settings: AppSettings;
  onSelectProduct: (p: Product) => void;
  onGoToCart: () => void;
  onRestart: () => void;
  cartTotal: number;
  cartCount: number;
}> = ({ settings, onSelectProduct, onGoToCart, onRestart, cartTotal, cartCount }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>(settings.categories[0]?.id || 'RECOMMENDED');
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
    if (activeCategory === 'RECOMMENDED') return list.filter(p => p.isBestseller);
    return list.filter(p => p.category === activeCategory);
  }, [activeCategory, settings.products, searchQuery]);

  return (
    <div className={`h-full flex flex-col overflow-hidden transition-colors duration-300 bg-animated-vertical ${isDark ? 'bg-[#0F172A] from-[#0F172A] via-[#1E293B] to-[#0F172A]' : 'bg-[#F8FAFC] from-[#F8FAFC] via-[#F1F5F9] to-[#F8FAFC]'}`}>
      <header className={`flex-shrink-0 flex items-center justify-between px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] border-b shadow-sm z-20 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center space-x-2">
           <div className="px-2 py-1 text-white font-black italic rounded-md text-[10px] shadow-sm transition-transform" style={{ backgroundColor: settings.primaryColor }}>{settings.brandName}</div>
           <h2 className={`text-base font-bold font-oswald tracking-tight uppercase overflow-hidden whitespace-nowrap text-ellipsis max-w-[120px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
             {searchQuery.trim() ? 'Search' : settings.categories.find(c => c.id === activeCategory)?.label || activeCategory}
           </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onRestart} className="font-black uppercase tracking-wider text-[8px] border-2 px-3 py-2 rounded-lg transition-all active:scale-95 shadow-sm" style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}>
            RESTART
          </button>
        </div>
      </header>

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
        
        {/* Promotion Banner */}
        {activeCategory === 'RECOMMENDED' && !searchQuery && (
          <div className="mb-6 relative rounded-[2.5rem] overflow-hidden aspect-[16/9] shadow-2xl group animate-scale-up">
            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Promo" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
               <span className="text-white text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Chef's Special</span>
               <h4 className="text-white text-3xl font-black font-oswald leading-none tracking-tight">THE ULTIMATE BOX</h4>
               <p className="text-white/60 text-[10px] font-bold mt-2">Limited time only. Starting from {settings.currency}45.00</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map(p => (
            <div key={p.id} onClick={() => onSelectProduct(p)} 
              className={`relative rounded-[2rem] border-2 transition-all active:scale-[0.98] flex items-stretch p-2.5 overflow-hidden min-h-[140px] cursor-pointer shadow-lg ${p.isBestseller ? 'border-amber-400 bg-amber-400/10' : isDark ? 'bg-[#1E293B] border-white/5 hover:border-white/20' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
              {p.isBestseller && <div className="absolute top-0 left-0 bg-amber-400 text-white text-[9px] font-black px-4 py-1.5 rounded-br-2xl z-10 uppercase italic tracking-tighter shadow-md">Best Seller</div>}
              <div className={`w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center rounded-2xl mr-4 shrink-0 self-center overflow-hidden shadow-2xl ${isDark ? 'bg-[#0F172A]/80' : 'bg-slate-50'}`}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="flex-1 flex flex-col py-2 overflow-hidden">
                <div className="flex-1 mb-1">
                  <h3 className={`text-lg font-black leading-tight mb-1 pr-1 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
                  <p className={`text-[11px] line-clamp-2 leading-relaxed opacity-60 ${isDark ? 'text-white/80' : 'text-slate-500'}`}>{p.description}</p>
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className={`text-xl font-black font-oswald tracking-tight whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>{settings.currency} {p.price.toFixed(2)}</span>
                  <button disabled={isHoliday} className={`text-white w-11 h-11 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl active:scale-90 transition-all flex-shrink-0 leading-none pb-1 ${isHoliday ? 'opacity-30' : ''}`} style={{ backgroundColor: settings.primaryColor }}>+</button>
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
