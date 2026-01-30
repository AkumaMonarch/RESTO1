
import React, { useMemo } from 'react';
import { AppSettings, Order } from './types';
import { CheckIcon } from './Icons';

interface OrderTrackerViewProps {
  settings: AppSettings;
  currentOrder: Order | undefined;
  onRestart: () => void;
}

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({ settings, currentOrder, onRestart }) => {
  const isDark = settings.themeMode === 'dark';
  const status = currentOrder?.status || 'pending';
  const isDelivery = currentOrder?.customer_details.diningMode === 'DELIVERY';

  const steps = useMemo(() => {
    const baseSteps = [
      { key: 'pending', label: 'Ordered', icon: '📝' },
      { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    ];

    if (isDelivery) {
      return [
        ...baseSteps,
        { key: 'out_for_delivery', label: 'On Way', icon: '🚴' },
        { key: 'completed', label: 'Delivered', icon: '🏠' }
      ];
    }

    return [
      ...baseSteps,
      { key: 'ready', label: 'Ready', icon: '✨' }
    ];
  }, [isDelivery]);

  const getStepIndex = (s: string) => {
    if (s === 'pending') return 0;
    if (s === 'preparing') return 1;
    if (isDelivery) {
      if (s === 'out_for_delivery') return 2;
      if (s === 'completed') return 3;
    } else {
      if (s === 'ready' || s === 'completed') return 2;
    }
    return 0;
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className={`h-full flex flex-col items-center p-8 transition-colors duration-700 ${status === 'ready' || (isDelivery && status === 'completed') ? 'bg-green-600 text-white' : isDark ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-900'}`}>
      <div className="flex-1 w-full flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-3">
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ${status === 'ready' || (isDelivery && status === 'completed') ? 'text-white' : ''}`}>Your Order Number</p>
          <h2 className={`text-7xl font-black font-oswald italic tracking-tighter ${status === 'ready' || (isDelivery && status === 'completed') ? 'text-white' : 'text-blue-500'}`}>
            #{currentOrder?.order_number || '---'}
          </h2>
        </div>

        <div className="w-full max-w-[280px] space-y-8">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex || status === 'completed';
            const isActive = idx === currentIndex && (status !== 'completed' || (isDelivery && step.key === 'completed'));
            const isPending = idx > currentIndex && status !== 'completed';

            return (
              <div key={step.key} className={`flex items-center gap-6 transition-all duration-500 ${isPending ? 'opacity-20 scale-95' : 'opacity-100'}`}>
                <div className="relative">
                  {idx < steps.length - 1 && (
                    <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-10 transition-colors duration-500 ${isCompleted ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                  )}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 shadow-xl border-4 ${
                    isCompleted ? 'bg-blue-500 border-blue-500 text-white' : 
                    isActive ? 'bg-white border-blue-500 text-blue-500 animate-pulse' : 
                    'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    {isCompleted && !isActive ? <CheckIcon className="w-6 h-6" /> : step.icon}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-500' : ''}`}>
                    {idx + 1}. {step.label}
                  </span>
                  <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">
                    {isActive ? 'Current Stage' : isCompleted ? 'Completed' : 'Waiting'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {(status === 'ready' || (isDelivery && status === 'completed')) && (
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] text-center animate-bounce border border-white/20 shadow-2xl">
            <h3 className="text-xl font-black uppercase tracking-tight">Enjoy Your Meal!</h3>
            <p className="text-[10px] font-bold opacity-80 uppercase mt-1">{isDelivery ? 'Delivered successfully' : 'Pick it up at the counter'}</p>
          </div>
        )}
      </div>

      <div className="w-full pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button 
          onClick={onRestart} 
          className={`w-full py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all ${
            status === 'ready' || (isDelivery && status === 'completed') ? 'bg-white text-green-600' : isDark ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          Finished / New Order
        </button>
      </div>
    </div>
  );
};
