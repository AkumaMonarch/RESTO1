
import React, { useState, useRef } from 'react';
import { AppSettings, Category, Product } from './types';
import { BackIcon, TrashIcon, SearchIcon, CameraIcon, UploadIcon, ChevronDownIcon, CheckIcon } from './Icons';
import { THEME_PRESETS } from './constants';

export const AdminView: React.FC<{ settings: AppSettings; onSave: (s: AppSettings) => void; onBack: () => void }> = ({ settings, onSave, onBack }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'General' | 'Categories' | 'Products'>('General');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const isDark = true;

  const camInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentEditingProdId, setCurrentEditingProdId] = useState<string | null>(null);

  const inputStyles = `w-full border-2 p-3 rounded-xl font-bold transition-all outline-none shadow-sm text-sm ${isDark ? 'bg-[#0F172A] border-white/5 text-white focus:border-blue-500' : 'bg-white border-slate-100 text-slate-900 focus:border-slate-300'}`;
  const cardStyles = `p-4 rounded-2xl border transition-all shadow-sm ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`;
  const labelStyles = "text-[9px] font-black uppercase tracking-widest opacity-40 px-1 mb-1.5 block";
  const actionButtonStyles = `flex items-center justify-center rounded-xl transition-all border p-3 shadow-sm active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-blue-400' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-blue-600'}`;

  const toggleDay = (day: string) => {
    setLocalSettings(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh => wh.day === day ? { ...wh, isOpen: !wh.isOpen } : wh)
    }));
  };

  const updateTime = (day: string, field: 'openTime' | 'closeTime', val: string) => {
    setLocalSettings(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh => wh.day === day ? { ...wh, [field]: val } : wh)
    }));
  };

  const addHoliday = (date: string) => {
    if (!date) return;
    setLocalSettings(prev => ({ ...prev, forceHolidays: Array.from(new Set([...prev.forceHolidays, date])) }));
  };

  const removeHoliday = (date: string) => {
    setLocalSettings(prev => ({ ...prev, forceHolidays: prev.forceHolidays.filter(d => d !== date) }));
  };

  const updateProduct = (id: string, field: keyof Product, val: any) => {
    setLocalSettings(prev => ({ ...prev, products: prev.products.map(p => p.id === id ? { ...p, [field]: val } : p) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentEditingProdId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProduct(currentEditingProdId, 'image', reader.result as string);
        setCurrentEditingProdId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`h-full flex flex-col animate-scale-up overflow-hidden ${isDark ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={camInputRef} onChange={handleFileChange} />
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      <header className={`flex-shrink-0 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b flex items-center justify-between ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className={`p-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}><BackIcon /></button>
          <h2 className="font-black text-lg font-oswald uppercase tracking-tight">Admin Dashboard</h2>
        </div>
        <button onClick={() => onSave(localSettings)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">Save Changes</button>
      </header>

      <div className={`flex-shrink-0 flex border-b ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white'}`}>
        {(['General', 'Categories', 'Products'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === t ? 'text-blue-500' : 'opacity-40'}`}>
            {t}
            {activeTab === t && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-blue-500 rounded-t-full"></div>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
        {activeTab === 'General' && (
          <div className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 px-1">Brand Identity</h3>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div><label className={labelStyles}>Brand Name</label><input className={inputStyles} value={localSettings.brandName} onChange={e => setLocalSettings({...localSettings, brandName: e.target.value})} /></div>
                  <div><label className={labelStyles}>Currency Symbol</label><input className={inputStyles} value={localSettings.currency} onChange={e => setLocalSettings({...localSettings, currency: e.target.value})} /></div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 px-1">Weekly Schedule</h3>
              <div className="space-y-3">
                {localSettings.workingHours.map(wh => (
                  <div key={wh.day} className={cardStyles}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-black text-[11px] uppercase">{wh.day}</span>
                      <button onClick={() => toggleDay(wh.day)} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${wh.isOpen ? 'bg-green-600 text-white' : 'bg-slate-700 text-white/30'}`}>{wh.isOpen ? 'Open' : 'Closed'}</button>
                    </div>
                    {wh.isOpen && (
                      <div className="grid grid-cols-2 gap-3">
                        <input type="time" value={wh.openTime} onChange={e => updateTime(wh.day, 'openTime', e.target.value)} className={inputStyles} />
                        <input type="time" value={wh.closeTime} onChange={e => updateTime(wh.day, 'closeTime', e.target.value)} className={inputStyles} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 px-1">Holiday Calendar</h3>
              <div className={cardStyles}>
                <div className="flex gap-2 mb-4">
                  <input type="date" className={inputStyles} id="new-holiday-input" />
                  <button onClick={() => {
                    const el = document.getElementById('new-holiday-input') as HTMLInputElement;
                    addHoliday(el.value);
                    el.value = '';
                  }} className="bg-slate-900 text-white px-5 rounded-xl text-xl font-bold active:scale-95 transition-all shadow-lg">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localSettings.forceHolidays.map(d => (
                    <div key={d} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 border ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                      {d} <button onClick={() => removeHoliday(d)} className="hover:opacity-70">✕</button>
                    </div>
                  ))}
                  {localSettings.forceHolidays.length === 0 && <p className="text-[10px] opacity-40 italic py-2">No holidays scheduled.</p>}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'Categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30">Menu Folders</h3>
              <button onClick={() => {
                const id = `CAT_${Date.now()}`;
                setLocalSettings(prev => ({ ...prev, categories: [...prev.categories, { id, label: 'New Category', icon: '📦' }] }));
              }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all">Add New</button>
            </div>
            <div className="space-y-3">
              {localSettings.categories.map((cat, idx) => (
                <div key={cat.id} className={cardStyles}>
                  <div className="flex items-center gap-2">
                    <input className={`${inputStyles} w-14 text-center text-lg p-2`} value={cat.icon} onChange={e => {
                      const n = [...localSettings.categories]; n[idx].icon = e.target.value; setLocalSettings({...localSettings, categories: n});
                    }} />
                    <input className={`${inputStyles} flex-1 p-2`} value={cat.label} onChange={e => {
                      const n = [...localSettings.categories]; n[idx].label = e.target.value; setLocalSettings({...localSettings, categories: n});
                    }} />
                    <button onClick={() => setLocalSettings({...localSettings, categories: localSettings.categories.filter(c => c.id !== cat.id)})} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Products' && (
          <div className="space-y-6">
            <div className="px-1 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30">Catalog</h3>
                <button onClick={() => {
                  const id = `PROD_${Date.now()}`;
                  const n = [{ id, name: 'New Item', price: 0, category: localSettings.categories[0]?.id, description: '', sizes: [], addons: [], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' }, ...localSettings.products];
                  setLocalSettings({...localSettings, products: n});
                  setExpandedProducts(prev => ({...prev, [id]: true}));
                }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all">Add Product</button>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"><SearchIcon /></div>
                <input className={`${inputStyles} pl-10 py-2`} placeholder="Filter items..." value={productSearchQuery} onChange={e => setProductSearchQuery(e.target.value)} />
              </div>
            </div>
            
            <div className="space-y-4">
              {localSettings.products.filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase())).map((prod, idx) => (
                <div key={prod.id} className={cardStyles}>
                  <div className="flex gap-4 items-center">
                    <img src={prod.image} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <input className={`${inputStyles} border-transparent bg-transparent p-0 mb-1 hover:border-white/10`} value={prod.name} onChange={e => updateProduct(prod.id, 'name', e.target.value)} />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-blue-500">{localSettings.currency}{prod.price.toFixed(2)}</span>
                        <span className="text-[8px] opacity-30">•</span>
                        <span className="text-[10px] font-black opacity-30 uppercase">{localSettings.categories.find(c => c.id === prod.category)?.label}</span>
                      </div>
                    </div>
                    <button onClick={() => setExpandedProducts(prev => ({...prev, [prod.id]: !prev[prod.id]}))} className="p-2 opacity-40 hover:opacity-100 transition-opacity">
                      <ChevronDownIcon className={`transition-transform duration-300 ${expandedProducts[prod.id] ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {expandedProducts[prod.id] && (
                    <div className="mt-4 space-y-4 animate-scale-up pt-4 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelStyles}>Base Price</label><input type="number" step="0.01" className={inputStyles} value={prod.price} onChange={e => updateProduct(prod.id, 'price', parseFloat(e.target.value))} /></div>
                        <div><label className={labelStyles}>Category</label><select className={inputStyles} value={prod.category} onChange={e => updateProduct(prod.id, 'category', e.target.value)}>{localSettings.categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
                      </div>
                      <div>
                        <label className={labelStyles}>Asset Source</label>
                        <div className="flex gap-2">
                          <input className={inputStyles} value={prod.image} onChange={e => updateProduct(prod.id, 'image', e.target.value)} />
                          <button onClick={() => { setCurrentEditingProdId(prod.id); camInputRef.current?.click(); }} className={actionButtonStyles}><CameraIcon /></button>
                          <button onClick={() => { setCurrentEditingProdId(prod.id); fileInputRef.current?.click(); }} className={actionButtonStyles}><UploadIcon /></button>
                        </div>
                      </div>
                      <div><label className={labelStyles}>Detailed Description</label><textarea rows={2} className={`${inputStyles} resize-none`} value={prod.description} onChange={e => updateProduct(prod.id, 'description', e.target.value)} /></div>
                      
                      {/* Portion Sizes Manager */}
                      <div className="space-y-3 pt-3 border-t border-white/5">
                        <div className="flex justify-between items-center px-1">
                          <label className={labelStyles}>Portion Sizes</label>
                          <button onClick={() => {
                            const n = [...(prod.sizes || []), { label: 'New Size', price: 0 }];
                            updateProduct(prod.id, 'sizes', n);
                          }} className="text-[9px] font-black uppercase text-blue-500 hover:opacity-70">+ Add Size</button>
                        </div>
                        <div className="space-y-2">
                          {(prod.sizes || []).map((sz, szIdx) => (
                            <div key={szIdx} className="flex gap-2 animate-scale-up">
                              <input className={`${inputStyles} flex-1`} value={sz.label} placeholder="Size (e.g. Large)" onChange={e => {
                                const n = [...prod.sizes]; n[szIdx].label = e.target.value; updateProduct(prod.id, 'sizes', n);
                              }} />
                              <input className={`${inputStyles} w-24`} type="number" step="0.01" value={sz.price} placeholder="Add. Price" onChange={e => {
                                const n = [...prod.sizes]; n[szIdx].price = parseFloat(e.target.value) || 0; updateProduct(prod.id, 'sizes', n);
                              }} />
                              <button onClick={() => {
                                const n = prod.sizes.filter((_, i) => i !== szIdx); updateProduct(prod.id, 'sizes', n);
                              }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><TrashIcon /></button>
                            </div>
                          ))}
                          {(!prod.sizes || prod.sizes.length === 0) && <p className="text-[9px] opacity-30 italic px-1">No custom sizes defined.</p>}
                        </div>
                      </div>

                      {/* Add-ons Manager */}
                      <div className="space-y-3 pt-3 border-t border-white/5">
                        <div className="flex justify-between items-center px-1">
                          <label className={labelStyles}>Extra Add-ons</label>
                          <button onClick={() => {
                            const n = [...(prod.addons || []), { label: 'New Extra', price: 0 }];
                            updateProduct(prod.id, 'addons', n);
                          }} className="text-[9px] font-black uppercase text-blue-500 hover:opacity-70">+ Add Extra</button>
                        </div>
                        <div className="space-y-2">
                          {(prod.addons || []).map((ad, adIdx) => (
                            <div key={adIdx} className="flex gap-2 animate-scale-up">
                              <input className={`${inputStyles} flex-1`} value={ad.label} placeholder="Extra (e.g. Cheese)" onChange={e => {
                                const n = [...prod.addons]; n[adIdx].label = e.target.value; updateProduct(prod.id, 'addons', n);
                              }} />
                              <input className={`${inputStyles} w-24`} type="number" step="0.01" value={ad.price} placeholder="Price" onChange={e => {
                                const n = [...prod.addons]; n[adIdx].price = parseFloat(e.target.value) || 0; updateProduct(prod.id, 'addons', n);
                              }} />
                              <button onClick={() => {
                                const n = prod.addons.filter((_, i) => i !== adIdx); updateProduct(prod.id, 'addons', n);
                              }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><TrashIcon /></button>
                            </div>
                          ))}
                          {(!prod.addons || prod.addons.length === 0) && <p className="text-[9px] opacity-30 italic px-1">No extras defined.</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 py-2 pt-4 border-t border-white/5">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase cursor-pointer opacity-70">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${prod.isBestseller ? 'bg-blue-600 border-blue-600' : 'border-white/20'}`}>
                            {prod.isBestseller && <CheckIcon className="w-3 h-3 text-white" />}
                          </div>
                          <input type="checkbox" className="hidden" checked={prod.isBestseller} onChange={e => updateProduct(prod.id, 'isBestseller', e.target.checked)} />
                          Hot Pick / Best Seller
                        </label>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button onClick={() => setLocalSettings({...localSettings, products: localSettings.products.filter(p => p.id !== prod.id)})} className="text-red-500 text-[10px] font-black uppercase border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-colors">Delete Item</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
