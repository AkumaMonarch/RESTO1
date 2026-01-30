
import React from 'react';
import { AppSettings, CartItem } from './types';
import { BackIcon } from './Icons';

// Added lang to props to fix TypeScript error in App.tsx
export const CartView: React.FC<{
  settings: AppSettings;
  lang: 'EN' | 'HI';
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number, index?: number) => void;
  onCheckout: () => void;
  onBack: () => void;
  total: number;
}> = ({ settings, lang, items, onUpdateQuantity, onCheckout, onBack, total }) => {
  const isDark = settings.themeMode === 'dark';
  return (
    <div className={`h-full flex flex-col animate-scale-up overflow-hidden bg-animated-vertical ${isDark ? 'bg-[#0F172A] from-[#0F172A] via-[#1E293B] to-[#0F172A]' : 'bg-[#F9FAFB] from-[#F9FAFB] via-[#F1F5F9] to-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center justify-between border-b sticky top-0 z-20 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 flex-shrink-0 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
            <BackIcon />
          </button>
          <h2 className={`text-2xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{lang === 'EN' ? 'Basket' : 'बास्केट'}</h2>
        </div>
        <button 
          onClick={() => onUpdateQuantity('ALL', -9999)} 
          className="bg-red-500 text-white font-black uppercase text-[8px] tracking-widest px-4 py-1.5 rounded-lg active:scale-95 transition-all shadow-md shadow-red-500/20"
        >
          {lang === 'EN' ? 'CLEAR ALL' : 'सभी हटाएं'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-64 smooth-scroll">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <span className="text-5xl">🛒</span>
            <p className={`font-black uppercase tracking-widest text-[10px] opacity-40 ${isDark ? 'text-white' : 'text-slate-400'}`}>
              {lang === 'EN' ? 'Your basket is empty' : 'आपकी बास्केट खाली है'}
            </p>
            <button onClick={onBack} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">
              {lang === 'EN' ? 'Go to Menu' : 'मेन्यू पर जाएं'}
            </button>
          </div>
        )}

        {items.map((item, idx) => {
          const itemBasePrice = item.price + item.selectedSize.price + (item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0);
          return (
            <div key={`${item.id}-${idx}`} className={`p-4 rounded-[2rem] border flex items-center space-x-4 shadow-xl relative animate-scale-up transition-all ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`}>
              <button 
                onClick={() => onUpdateQuantity(item.id, -9999, idx)} 
                className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${isDark ? 'bg-white/5 text-white/20 hover:text-red-400 hover:bg-red-400/10' : 'bg-slate-100 text-slate-400'}`}
              >
                ✕
              </button>
              
              <div className={`w-20 h-20 rounded-2xl p-1 shrink-0 overflow-hidden shadow-inner border ${isDark ? 'bg-[#0F172A] border-white/5' : 'bg-slate-50 border-slate-50'}`}>
                <img src={item.image} className="w-full h-full object-cover rounded-xl" alt={item.name} />
              </div>
              
              <div className="flex-1 pr-6">
                <h3 className={`font-black text-sm leading-tight truncate pr-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{item.selectedSize.label}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className={`font-black text-lg font-oswald ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {settings.currency}{(itemBasePrice * item.quantity).toFixed(2)}
                  </span>
                  
                  <div className={`flex items-center rounded-xl p-1 border ${isDark ? 'bg-[#0F172A] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, -1, idx)} 
                      className={`w-7 h-7 font-black text-lg flex items-center justify-center rounded-lg shadow-sm border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    >
                      −
                    </button>
                    <span className={`font-black text-xs tabular-nums min-w-[28px] text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, 1, idx)} 
                      className={`w-7 h-7 font-black text-lg flex items-center justify-center rounded-lg shadow-sm border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className={`flex-shrink-0 px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-6 border-t rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] space-y-6 z-30 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-center">
            <span className={`font-black uppercase text-xl tracking-tighter opacity-80 ${isDark ? 'text-white' : 'text-slate-900'}`}>{lang === 'EN' ? 'TOTAL' : 'कुल योग'}</span>
            <span className="text-4xl font-black font-oswald text-[#E4002B]">
              {settings.currency}{total.toFixed(2)}
            </span>
          </div>
          
          <button 
            onClick={onCheckout} 
            className="w-full bg-[#86BC25] text-white py-5 rounded-3xl text-xl font-black uppercase shadow-2xl shadow-green-600/20 active:scale-[0.98] transition-all relative overflow-hidden group"
          >
            <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-white/20 rounded-full -translate-y-1/2 opacity-30"></div>
            <span className="relative z-10">{lang === 'EN' ? 'Check Out' : 'चेकआउट'}</span>
          </button>
        </div>
      )}
    </div>
  );
};