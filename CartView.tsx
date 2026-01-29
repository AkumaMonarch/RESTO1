
import React from 'react';
import { AppSettings, CartItem } from './types';
import { BackIcon } from './Icons';

export const CartView: React.FC<{
  settings: AppSettings;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
  onBack: () => void;
  total: number;
}> = ({ settings, items, onUpdateQuantity, onCheckout, onBack, total }) => {
  const isDark = true;
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
        {items.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className={`p-4 rounded-[1.75rem] border-2 flex items-center space-x-4 shadow-sm animate-scale-up transition-all ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`}>
            <div className={`w-20 h-20 rounded-2xl p-2 shrink-0 shadow-inner border ${isDark ? 'bg-[#0F172A] border-white/5' : 'bg-slate-50 border-slate-50'}`}><img src={item.image} className="w-full h-full object-cover rounded-xl" /></div>
            <div className="flex-1 overflow-hidden">
               <div className="flex justify-between items-start mb-0.5"><div className="overflow-hidden"><h3 className={`font-black text-sm leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3><p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">{item.selectedSize.label}</p></div></div>
               <div className="flex items-center justify-between mt-2"><span className={`font-black text-lg font-oswald whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>{settings.currency}{((item.price + item.selectedSize.price) * item.quantity).toFixed(2)}</span><div className={`flex items-center justify-between rounded-xl px-1.5 py-1 border shadow-sm flex-shrink-0 ${isDark ? 'bg-[#0F172A] border-white/5' : 'bg-slate-50 border-slate-200'}`}><button onClick={() => onUpdateQuantity(item.id, -1)} className={`w-8 h-8 font-black text-xl active:scale-90 transition-all flex items-center justify-center rounded-lg shadow-sm border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>−</button><span className={`font-black text-sm tabular-nums min-w-[24px] text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.quantity}</span><button onClick={() => onUpdateQuantity(item.id, 1)} className={`w-8 h-8 font-black text-xl active:scale-90 transition-all flex items-center justify-center rounded-lg shadow-sm border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>+</button></div></div>
            </div>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div className={`flex-shrink-0 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 border-t rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.15)] space-y-4 z-10 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="space-y-3"><div className={`flex justify-between text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}><span className="font-oswald text-xl">TOTAL</span><span className="font-oswald" style={{ color: settings.primaryColor }}>{settings.currency}{total.toFixed(2)}</span></div></div>
          <button onClick={onCheckout} className="w-full text-white py-5 rounded-[1.75rem] text-xl font-black uppercase shadow-lg active:scale-[0.98] transition-all bg-[#86BC25]">Check Out</button>
        </div>
      )}
    </div>
  );
};
