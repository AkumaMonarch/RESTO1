
import React from 'react';
import { AppSettings, CartItem, UserDetails } from './types';
import { BackIcon } from './Icons';

export const FinalSummaryView: React.FC<{ settings: AppSettings; cart: CartItem[]; details: UserDetails; total: number; onBack: () => void; onConfirm: () => void; isSubmitting: boolean; }> = ({ settings, cart, details, total, onBack, onConfirm, isSubmitting }) => {
  const isDark = settings.themeMode === 'dark';
  return (
    <div className={`h-full flex flex-col animate-scale-up ${isDark ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center space-x-3 border-b ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <button onClick={onBack} className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
          <BackIcon />
        </button>
        <h2 className={`text-2xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Review</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-64">
        <section className="space-y-3">
          <h3 className="text-[9px] font-black uppercase tracking-widest opacity-40">Contact Info</h3>
          <div className={`p-6 rounded-[2rem] border-2 space-y-4 shadow-xl ${isDark ? 'bg-slate-800/50 border-white/5 text-white' : 'bg-white border-slate-50 text-slate-900'}`}>
            <div className="flex items-center gap-4">
              <span className="text-3xl">👤</span>
              <div className="overflow-hidden">
                <p className="font-black text-base truncate">{details.name}</p>
                <p className="text-[11px] opacity-60 truncate font-bold tracking-wide">{details.phone}</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t pt-4 border-white/5">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{details.diningMode === 'DELIVERY' ? '🚚' : '🍽️'}</span>
                <div className="flex flex-col">
                    <p className="font-black uppercase text-[10px] tracking-[0.1em]">{details.diningMode.replace('_', ' ')}</p>
                    {details.diningMode === 'DELIVERY' && <p className="text-[10px] opacity-40 truncate max-w-[180px]">{details.address}</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="space-y-3 pb-20">
          <h3 className="text-[9px] font-black uppercase tracking-widest opacity-40 px-1">Selected Items</h3>
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <div key={idx} className={`p-4 rounded-2xl flex justify-between items-center shadow-md ${isDark ? 'bg-slate-800/30 text-white' : 'bg-white text-slate-900'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-[11px] flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                    {item.quantity}
                  </span>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    <p className="text-[9px] uppercase font-black tracking-widest opacity-40">{item.selectedSize.label}</p>
                  </div>
                </div>
                <p className="font-black font-oswald text-sm ml-4 whitespace-nowrap">
                  {settings.currency}{((item.price + item.selectedSize.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className={`flex-shrink-0 px-6 pb-10 pt-6 border-t rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.4)] ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white'}`}>
        <div className="flex justify-between items-end mb-5">
          <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Grand Total</span>
          <span className="text-4xl font-black font-oswald" style={{ color: settings.primaryColor }}>
            {settings.currency}{total.toFixed(2)}
          </span>
        </div>
        <button onClick={onConfirm} disabled={isSubmitting} className="w-full text-white py-5 rounded-3xl text-xl font-black uppercase shadow-2xl transition-all active:scale-[0.98] bg-[#86BC25]">
          {isSubmitting ? 'Confirming...' : 'Place Order Now'}
        </button>
      </div>
    </div>
  );
};
