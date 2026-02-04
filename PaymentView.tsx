
import React, { useEffect, useState } from 'react';
import { AppSettings } from './types';

export const PaymentView: React.FC<{ 
  settings: AppSettings; 
  total: number; 
  onComplete: () => void;
}> = ({ settings, total, onComplete }) => {
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  
  useEffect(() => {
    // Auto-start simulation
    const timer1 = setTimeout(() => setStatus('PROCESSING'), 1500);
    const timer2 = setTimeout(() => setStatus('SUCCESS'), 4500);
    const timer3 = setTimeout(() => onComplete(), 6000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="h-full w-full bg-[#0F172A] flex flex-col items-center justify-center p-8 text-center text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="z-10 space-y-2 mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Payment Terminal</p>
        <h2 className="text-4xl font-black font-oswald italic">{settings.currency}{total.toFixed(2)}</h2>
      </div>

      <div className="relative z-10 w-64 h-64 flex flex-col items-center justify-center">
        {/* NFC Icon Simulation */}
        <div className={`relative w-48 h-48 rounded-[3rem] border-4 flex items-center justify-center transition-all duration-700 ${
          status === 'SUCCESS' ? 'bg-green-500 border-green-400 scale-110' : 
          status === 'PROCESSING' ? 'border-blue-500 scale-105' : 'border-white/10'
        }`}>
          {status === 'SUCCESS' ? (
            <span className="text-7xl animate-scale-up">✅</span>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <span className={`text-6xl ${status === 'PROCESSING' ? 'animate-bounce' : 'opacity-40'}`}>💳</span>
              {status === 'PROCESSING' && (
                 <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                 </div>
              )}
            </div>
          )}
          
          {/* Waves for NFC */}
          {status === 'IDLE' && (
            <div className="absolute inset-0 border-4 border-white/20 rounded-[3rem] animate-ping opacity-20"></div>
          )}
        </div>
      </div>

      <div className="mt-12 z-10 max-w-[200px]">
        <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-2 transition-all duration-500">
          {status === 'IDLE' ? 'Please Tap Card' : 
           status === 'PROCESSING' ? 'Processing...' : 'Payment Verified'}
        </h3>
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">
          {status === 'IDLE' ? 'Contactless or Mobile Pay supported' : 
           status === 'PROCESSING' ? 'Do not remove card' : 'Thank you for your order'}
        </p>
      </div>

      {/* Simulated Card Area at Bottom */}
      <div className="absolute bottom-10 left-8 right-8 h-2 w-full max-w-[280px] bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full bg-blue-500 transition-all duration-[3000ms] ease-linear ${status === 'PROCESSING' ? 'w-full' : status === 'SUCCESS' ? 'w-full' : 'w-0'}`}></div>
      </div>
    </div>
  );
};
