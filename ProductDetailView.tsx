
import React, { useState, useMemo } from 'react';
import { AppSettings, Product, SizeOption, AddonOption } from './types';
import { BackIcon, CheckIcon } from './Icons';

export const ProductDetailView: React.FC<{
  settings: AppSettings;
  product: Product;
  onAddToCart: (p: Product, quantity: number, size: SizeOption, addons: AddonOption[]) => void;
  onBack: () => void;
}> = ({ settings, product, onAddToCart, onBack }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<SizeOption>(product.sizes[0] || { label: 'Regular', price: 0 });
  const [selectedAddons, setSelectedAddons] = useState<AddonOption[]>([]);
  const isDark = true;

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
        <div className="h-full overflow-y-auto p-4 space-y-8 no-scrollbar pb-64 smooth-scroll relative z-10 mask-edges-vertical">
          <div className="flex flex-col items-center pt-2">
             <div className={`w-full aspect-square max-w-[200px] rounded-[2.5rem] flex items-center justify-center p-4 mb-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden border-2 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <img src={product.image} className="w-full h-full object-cover rounded-[1.75rem]" loading="eager" />
             </div>
             <div className="px-4 text-center space-y-1">
                <h3 className={`text-3xl font-black leading-none tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.name}</h3>
                <p className={`text-center font-medium max-w-[280px] mx-auto text-[10px] leading-relaxed opacity-60 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{product.description}</p>
             </div>
          </div>
          
          {product.sizes.length > 0 && (
            <section className="space-y-3 px-1">
               <div className="flex justify-between items-center px-1"><h4 className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Choose Portion</h4><span className="text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ color: settings.primaryColor, backgroundColor: `${settings.primaryColor}15` }}>Mandatory</span></div>
               <div className="grid grid-cols-3 gap-3">
                 {product.sizes.map(s => (
                   <button key={s.label} onClick={() => setSelectedSize(s)} 
                    className={`py-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center shadow-sm ${selectedSize.label === s.label ? 'scale-105' : isDark ? 'border-white/5 text-white/20 bg-white/5' : 'border-slate-50 text-slate-400 bg-white'}`} 
                    style={selectedSize.label === s.label ? { borderColor: settings.primaryColor, backgroundColor: `${settings.primaryColor}15`, color: settings.primaryColor } : {}}>
                     <span className="text-[11px]">{s.label}</span>
                     <span className="text-[8px] opacity-70 mt-1">+{settings.currency}{s.price.toFixed(2)}</span>
                   </button>
                 ))}
               </div>
            </section>
          )}
          
          {product.addons.length > 0 && (
            <section className="space-y-3 px-1 pb-10">
               <h4 className={`text-[9px] font-black uppercase tracking-widest px-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Upgrade Your Meal</h4>
               <div className="grid grid-cols-1 gap-2">
                 {product.addons.map(addon => (
                   <label key={addon.label} className={`flex items-center justify-between p-4 border-2 rounded-2xl transition-all cursor-pointer shadow-sm ${selectedAddons.find(a => a.label === addon.label) ? 'border-opacity-100' : isDark ? 'bg-slate-800/30 border-white/5' : 'bg-white border-slate-50'}`} style={selectedAddons.find(a => a.label === addon.label) ? { borderColor: settings.primaryColor, backgroundColor: `${settings.primaryColor}05` } : {}}>
                     <div className="flex flex-col"><span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{addon.label}</span><span className="text-[9px] font-black mt-1" style={{ color: settings.primaryColor }}>+{settings.currency}{addon.price.toFixed(2)}</span></div>
                     <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${selectedAddons.find(a => a.label === addon.label) ? 'text-white shadow-lg' : 'border-slate-200 bg-white'}`} style={selectedAddons.find(a => a.label === addon.label) ? { backgroundColor: settings.primaryColor, borderColor: settings.primaryColor } : {}}>{selectedAddons.find(a => a.label === addon.label) && <CheckIcon className="w-4 h-4" />}</div>
                     <input type="checkbox" className="hidden" checked={!!selectedAddons.find(a => a.label === addon.label)} onChange={() => setSelectedAddons(prev => prev.find(a => a.label === addon.label) ? prev.filter(a => a.label !== addon.label) : [...prev, addon])} />
                   </label>
                 ))}
               </div>
            </section>
          )}
        </div>
      </div>

      <div className={`flex-shrink-0 px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 border-t rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.3)] space-y-4 z-20 ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className={`flex items-center justify-between p-1 rounded-2xl border-2 ${isDark ? 'bg-[#0F172A]' : 'bg-slate-50 border-slate-100'}`}>
          <button onClick={() => setQuantity(q => Math.max(1, q-1))} className={`w-10 h-10 border-2 rounded-xl text-xl font-black flex items-center justify-center active:scale-90 transition-all shadow-sm ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>−</button>
          <span className={`text-xl font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{quantity}</span>
          <button onClick={() => setQuantity(q => q+1)} className={`w-10 h-10 border-2 rounded-xl text-xl font-black flex items-center justify-center active:scale-90 transition-all shadow-sm ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>+</button>
        </div>
        <button onClick={() => onAddToCart(product, quantity, selectedSize, selectedAddons)} className="w-full text-white py-4 rounded-[1.5rem] shadow-xl active:scale-[0.98] transition-all flex items-center justify-between px-6 overflow-hidden" style={{ backgroundColor: settings.primaryColor }}>
          <span className="text-xs font-black uppercase tracking-widest">Add To Basket</span>
          <span className="font-oswald text-xl ml-3">{settings.currency}{totalPrice.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
};
