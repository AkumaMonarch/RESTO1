
import React from 'react';
import { AppSettings } from './types';

export const OrderConfirmedView: React.FC<{ settings: AppSettings; orderNumber: number; onRestart: () => void }> = ({ settings, orderNumber, onRestart }) => {
  const isDark = settings.themeMode === 'dark';
  return (
    <div className={`h-full flex flex-col items-center justify-center p-8 text-center space-y-8 animate-scale-up ${isDark ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-900'}`}>
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-5xl animate-bounce shadow-xl">✅</div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black font-oswald uppercase tracking-tight">Order Placed!</h2>
        <p className="text-sm opacity-60 font-medium">Thank you for choosing {settings.brandName}</p>
      </div>
      <div className={`p-6 rounded-[2.5rem] border-2 w-full max-w-[240px] shadow-lg ${isDark ? 'bg-slate-800 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Your Order Number</p>
        <p className="text-5xl font-black font-oswald" style={{ color: settings.primaryColor }}>#{orderNumber}</p>
      </div>
      <button onClick={onRestart} className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all ${isDark ? 'bg-white text-[#0F172A]' : 'bg-slate-900 text-white'}`}>Back to Home</button>
    </div>
  );
};
