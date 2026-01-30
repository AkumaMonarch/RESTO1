
import React, { useState } from 'react';
import { AppSettings, UserDetails, DiningMode } from './types';
import { BackIcon } from './Icons';

// Added lang to props to fix TypeScript error in App.tsx
export const UserDetailsView: React.FC<{ settings: AppSettings; lang: 'EN' | 'HI'; mode: DiningMode; onBack: () => void; onNext: (details: UserDetails) => void; initialDetails: UserDetails; }> = ({ settings, lang, mode, onBack, onNext, initialDetails }) => {
  const [details, setDetails] = useState<UserDetails>(initialDetails);
  const isDark = settings.themeMode === 'dark';
  const inputClass = `w-full p-5 rounded-2xl border-2 font-bold transition-all outline-none text-sm ${isDark ? 'bg-slate-800 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-100 text-slate-900 focus:border-blue-600'}`;
  const isValid = details.name.trim().length > 0 && details.phone.trim().length > 0;

  return (
    <div className={`h-full flex flex-col animate-scale-up ${isDark ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'}`}>
      <header className={`flex-shrink-0 px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center space-x-3 border-b ${isDark ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'}`}>
        <button onClick={onBack} className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shadow-sm border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
          <BackIcon />
        </button>
        <h2 className={`text-2xl font-black font-oswald uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{lang === 'EN' ? 'Details' : 'विवरण'}</h2>
      </header>
      <form className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] px-1 opacity-50">{lang === 'EN' ? 'Full Name' : 'पूरा नाम'}</label>
          <input required type="text" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} placeholder={lang === 'EN' ? 'How should we address you?' : 'हमें आपको क्या कहकर संबोधित करना चाहिए?'} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] px-1 opacity-50">{lang === 'EN' ? 'Mobile Number' : 'मोबाइल नंबर'}</label>
          <input required type="tel" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} placeholder="+00 000 000 000" className={inputClass} />
        </div>
        {mode === 'DELIVERY' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] px-1 opacity-50">{lang === 'EN' ? 'Delivery Address' : 'डिलीवरी का पता'}</label>
            <textarea required rows={4} value={details.address} onChange={e => setDetails({...details, address: e.target.value})} placeholder={lang === 'EN' ? 'Door #, Street Name, Zip...' : 'दरवाजा नंबर, गली का नाम, ज़िप...'} className={`${inputClass} resize-none`} />
          </div>
        )}
      </form>
      <div className={`px-6 pb-10 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <button onClick={() => onNext(details)} className="w-full text-white py-5 rounded-3xl text-xl font-black uppercase shadow-2xl active:scale-[0.98] transition-all bg-blue-600 disabled:opacity-30" disabled={!isValid}>
          {lang === 'EN' ? 'Check Out' : 'चेकआउट'}
        </button>
      </div>
    </div>
  );
};