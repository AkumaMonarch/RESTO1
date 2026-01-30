
import React from 'react';
import { AppSettings, DiningMode } from './types';
import { BackIcon } from './Icons';

export const CheckoutView: React.FC<{ settings: AppSettings; onBack: () => void; onSelectMode: (method: DiningMode) => void }> = ({ settings, onBack, onSelectMode }) => {
  const isDark = settings.themeMode === 'dark';
  return (
    <div className={`h-full flex flex-col animate-scale-up ${isDark ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center space-x-3 border-b ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <button onClick={onBack} className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
          <BackIcon />
        </button>
        <h2 className={`text-2xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Type</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center space-y-4">
        <h3 className={`text-center font-black uppercase tracking-widest text-[10px] mb-2 opacity-40 ${isDark ? 'text-white' : 'text-slate-400'}`}>Choose your service</h3>
        <div className="grid grid-cols-1 gap-3 w-full max-w-[280px]">
          <button onClick={() => onSelectMode('EAT_IN')} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all active:scale-95 shadow-lg ${isDark ? 'bg-slate-800 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
            <span className="text-4xl">🍽️</span>
            <span className="text-base font-black uppercase tracking-tight">Eat In</span>
          </button>
          <button onClick={() => onSelectMode('TAKE_AWAY')} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all active:scale-95 shadow-lg ${isDark ? 'bg-slate-800 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
            <span className="text-4xl">🥡</span>
            <span className="text-base font-black uppercase tracking-tight">Take Away</span>
          </button>
          <button onClick={() => onSelectMode('DELIVERY')} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all active:scale-95 shadow-lg ${isDark ? 'bg-slate-800 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
            <span className="text-4xl">🚚</span>
            <span className="text-base font-black uppercase tracking-tight">Delivery</span>
          </button>
        </div>
      </div>
    </div>
  );
};
