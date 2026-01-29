
import React from 'react';
import { AppSettings } from './types';

export const LandingView: React.FC<{ settings: AppSettings; onStart: () => void }> = ({ settings, onStart }) => (
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
