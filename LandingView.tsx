
import React from 'react';
import { AppSettings } from './types';

export const LandingView: React.FC<{ 
  settings: AppSettings; 
  lang: 'EN' | 'HI';
  onSetLang: (l: 'EN' | 'HI') => void;
  onStart: () => void;
}> = ({ settings, lang, onSetLang, onStart }) => (
  <div className="h-full w-full flex flex-col items-center justify-center p-6 space-y-8 animate-scale-up cursor-pointer relative overflow-hidden" style={{ backgroundColor: settings.primaryColor }} onClick={onStart}>
    <div className="absolute inset-0 opacity-10">
      <div className="grid grid-cols-4 gap-3 rotate-12 scale-150">
        {settings.products.slice(0, 12).map((p, i) => (
          <img key={i} src={p.image} className="w-full aspect-square object-cover rounded-2xl" alt="" />
        ))}
      </div>
    </div>

    {/* Language Toggle */}
    <div className="absolute top-12 flex bg-black/20 backdrop-blur-xl p-1 rounded-2xl z-20 border border-white/10" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => onSetLang('EN')} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${lang === 'EN' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/40'}`}>EN 🇬🇧</button>
      <button onClick={() => onSetLang('HI')} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${lang === 'HI' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/40'}`}>HI 🇮🇳</button>
    </div>

    <div className="bg-white p-8 rounded-[3rem] shadow-[0_40px_80px_-10px_rgba(0,0,0,0.6)] transform transition-all active:scale-95 z-10 border-4 border-white">
      <h1 className="text-5xl font-black tracking-tighter italic select-none leading-none text-center" style={{ color: settings.primaryColor }}>
        {settings.brandName}
      </h1>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-center mt-4 opacity-30">
        {lang === 'EN' ? 'AUTHENTIC FLAVORS' : 'प्रामाणिक स्वाद'}
      </p>
    </div>

    <div className="text-center space-y-3 text-white z-10">
      <h2 className="text-4xl font-black font-oswald tracking-tight uppercase leading-none">
        {lang === 'EN' ? 'Tap to order' : 'आदेश देने के लिए टैप करें'}
      </h2>
      <p className="text-lg opacity-80 font-medium">{lang === 'EN' ? 'Fresh. Fast. Delicious.' : 'ताज़ा। तेज़। स्वादिष्ट।'}</p>
    </div>

    <div className="flex flex-col items-center animate-bounce mt-8 text-white z-10">
      <div className="w-14 h-14 rounded-full border-4 border-white/40 flex items-center justify-center backdrop-blur-md shadow-2xl">
        <span className="text-2xl font-bold">↓</span>
      </div>
    </div>
  </div>
);
