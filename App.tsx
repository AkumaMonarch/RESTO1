
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AppView, CartItem, CategoryType, Product, UserDetails } from './types';
import { CATEGORIES, PRODUCTS } from './constants';

/**
 * Custom hook to enable grab-to-scroll (click and drag) on an element.
 */
function useGrabToScroll(direction: 'horizontal' | 'vertical' = 'horizontal') {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollLeft(scrollRef.current.scrollLeft);
    setScrollTop(scrollRef.current.scrollTop);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    setHasMoved(true);
    
    if (direction === 'horizontal') {
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed
      scrollRef.current.scrollLeft = scrollLeft - walk;
    } else {
      const y = e.pageY - scrollRef.current.offsetTop;
      const walk = (y - startY) * 1.5;
      scrollRef.current.scrollTop = scrollTop - walk;
    }
  };

  const preventClick = (e: React.MouseEvent) => {
    if (hasMoved) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return {
    ref: scrollRef,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onMouseMove,
    onClickCapture: preventClick,
    isDragging
  };
}

// --- Views ---

const LandingView: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div 
    className="h-screen w-full flex flex-col items-center justify-center bg-[#E4002B] text-white p-8 space-y-12 animate-scale-up"
    onClick={onStart}
  >
    <div className="bg-white p-6 rounded-2xl shadow-2xl">
      <h1 className="text-6xl font-black text-[#E4002B] tracking-tighter italic">KFC</h1>
    </div>
    
    <div className="text-center space-y-4">
      <h2 className="text-4xl font-black font-oswald tracking-tight uppercase">Touch to start</h2>
      <p className="text-xl opacity-90 font-medium">Order your favorites now</p>
    </div>

    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
      {CATEGORIES.slice(0, 4).map(cat => (
        <div key={cat.id} className="bg-white/10 p-6 rounded-2xl flex flex-col items-center space-y-2 border border-white/30 backdrop-blur-sm">
          <span className="text-4xl">{cat.icon}</span>
          <span className="text-sm font-bold tracking-wide">{cat.label}</span>
        </div>
      ))}
    </div>

    <div className="flex flex-col items-center animate-bounce mt-8">
      <div className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center">
         <span className="text-2xl font-bold">↓</span>
      </div>
    </div>
  </div>
);

const MenuView: React.FC<{
  onSelectProduct: (p: Product) => void;
  onGoToCart: () => void;
  onRestart: () => void;
  cartTotal: number;
  cartCount: number;
}> = ({ onSelectProduct, onGoToCart, onRestart, cartTotal, cartCount }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('BURGERS');
  
  const navScrollProps = useGrabToScroll('horizontal');
  const mainScrollProps = useGrabToScroll('vertical');
  
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = useCallback(() => {
    const el = navScrollProps.ref.current;
    if (el) {
      setShowLeftArrow(el.scrollLeft > 20);
      setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
    }
  }, [navScrollProps.ref]);

  useEffect(() => {
    checkScroll();
    const el = navScrollProps.ref.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll, navScrollProps.ref]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'RECOMMANDED') return PRODUCTS.filter(p => p.isBestseller);
    return PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="h-screen flex flex-col bg-[#F9F9F9] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-4 bg-white border-b shadow-sm z-20">
        <div className="flex items-center space-x-3">
           <div className="bg-[#E4002B] px-3 py-1 text-white font-black italic rounded text-xl shadow-sm">KFC</div>
           <h2 className="text-xl font-bold font-oswald text-gray-900 tracking-tight uppercase">{activeCategory}</h2>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRestart();
          }}
          className="text-[#E4002B] font-black uppercase tracking-wider text-xs border-2 border-[#E4002B] px-3 py-1 rounded-full active:bg-red-50 transition-colors"
        >
          Restart
        </button>
      </header>

      {/* Horizontal Category Nav with Scroll Hints */}
      <div className="relative flex-shrink-0">
        {/* Left Scroll Indicator */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-20 flex items-center justify-start pl-2 pointer-events-none transition-opacity duration-300">
            <div className="bg-[#E4002B] w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md animate-pulse">
              ❮
            </div>
          </div>
        )}

        {/* Right Scroll Indicator */}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-20 flex items-center justify-end pr-2 pointer-events-none transition-opacity duration-300">
            <div className="bg-[#E4002B] w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md animate-pulse">
              ❯
            </div>
          </div>
        )}

        <nav 
          {...navScrollProps}
          className={`bg-white border-b overflow-x-auto no-scrollbar py-3 px-4 flex flex-nowrap items-center space-x-3 shadow-sm z-10 touch-pan-x select-none cursor-grab active:cursor-grabbing`}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
              }}
              className={`flex-shrink-0 flex items-center space-x-2 px-5 py-2.5 rounded-2xl transition-all whitespace-nowrap border-2 ${
                activeCategory === cat.id 
                  ? 'bg-[#E4002B] border-[#E4002B] text-white shadow-md scale-105' 
                  : 'bg-gray-50 border-gray-100 text-gray-400 grayscale'
              }`}
            >
              <span className="text-2xl pointer-events-none">{cat.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-tighter pointer-events-none">{cat.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Product List Area with Grab Scroll */}
      <main 
        {...mainScrollProps}
        className="flex-1 overflow-y-auto p-4 no-scrollbar bg-white select-none cursor-grab active:cursor-grabbing"
      >
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              onClick={() => onSelectProduct(p)}
              className={`relative bg-white rounded-3xl border-2 transition-all active:scale-[0.98] flex items-stretch p-3 overflow-hidden min-h-[160px] cursor-pointer ${
                p.isBestseller ? 'border-amber-400 bg-amber-50/10' : 'border-gray-100'
              }`}
            >
              {p.isBestseller && (
                <div className="absolute top-0 left-0 bg-amber-400 text-white text-[9px] font-black px-3 py-1 rounded-br-2xl z-10 uppercase italic shadow-sm">
                  Hot Seller
                </div>
              )}
              <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center bg-gray-50 rounded-2xl mr-4 shrink-0 self-center overflow-hidden pointer-events-none">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col py-1 pointer-events-none">
                <div className="flex-1 mb-2">
                  <h3 className="text-base font-black text-gray-900 leading-tight mb-1 pr-1">{p.name}</h3>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-snug">{p.description}</p>
                </div>
                <div className="flex justify-between items-center mt-auto pt-2">
                  <span className="text-xl font-black text-gray-900">Rs {p.price.toFixed(2)}</span>
                  <button className="bg-[#E4002B] text-white w-12 h-12 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg active:scale-90 transition-transform flex-shrink-0 leading-none pb-1 pointer-events-auto">
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Non-Fixed Cart Bar at the Bottom */}
      {cartCount > 0 && (
        <div className="flex-shrink-0 p-4 bg-white border-t-2 border-gray-100 flex items-center gap-4 animate-scale-up shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
           <div 
            onClick={onGoToCart}
            className="flex-1 bg-[#86BC25] hover:bg-[#76a520] active:scale-95 transition-all text-white p-5 rounded-3xl flex items-center justify-between font-black shadow-lg cursor-pointer"
          >
            <div className="flex items-center space-x-4">
               <div className="bg-white text-[#86BC25] w-9 h-9 rounded-xl flex items-center justify-center shadow-inner text-lg">
                 {cartCount}
               </div>
               <span className="text-lg uppercase tracking-tight">View Basket</span>
            </div>
            <span className="text-xl font-oswald tracking-wide">Rs {cartTotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductDetailView: React.FC<{
  product: Product;
  onAddToCart: (p: Product, quantity: number) => void;
  onBack: () => void;
}> = ({ product, onAddToCart, onBack }) => {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('Medium');

  return (
    <div className="h-screen bg-white flex flex-col animate-scale-up overflow-hidden">
      <header className="flex-shrink-0 p-4 flex items-center space-x-4 border-b bg-white sticky top-0 z-10">
        <button onClick={onBack} className="text-3xl p-2 bg-gray-100 text-gray-900 rounded-xl active:bg-gray-200 transition-colors flex items-center justify-center w-12 h-12 flex-shrink-0">
          ←
        </button>
        <h2 className="text-xl font-black font-oswald uppercase text-gray-800">Customize</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        <div className="flex flex-col items-center">
           <div className="w-64 h-64 bg-gray-50 rounded-[40px] flex items-center justify-center p-4 mb-6 shadow-inner overflow-hidden">
              <img src={product.image} className="w-full h-full object-cover" />
           </div>
           <h3 className="text-3xl font-black text-center text-gray-900 leading-none mb-3">{product.name}</h3>
           <p className="text-gray-500 text-center font-medium max-w-xs mx-auto">{product.description}</p>
        </div>
        <section className="space-y-4">
           <div className="flex justify-between items-center">
             <h4 className="text-sm font-black uppercase text-gray-400 tracking-widest">Select Size</h4>
             <span className="text-xs font-bold text-[#E4002B] bg-red-50 px-2 py-1 rounded">Required</span>
           </div>
           <div className="grid grid-cols-3 gap-3">
             {['Small', 'Medium', 'Large'].map(s => (
               <button 
                key={s}
                onClick={() => setSize(s)}
                className={`py-4 rounded-2xl border-2 font-black transition-all ${
                  size === s ? 'border-[#E4002B] bg-red-50 text-[#E4002B] shadow-sm' : 'border-gray-100 text-gray-400 bg-white'
                }`}
               >
                 {s}
               </button>
             ))}
           </div>
        </section>
        <section className="space-y-4">
           <h4 className="text-sm font-black uppercase text-gray-400 tracking-widest">Add Extras (+Rs 1.50 ea)</h4>
           <div className="space-y-3 pb-8">
              {['Double Cheese', 'Extra Bacon', 'Spicy Jalapeños'].map(extra => (
                <label key={extra} className="flex items-center justify-between p-5 bg-white border-2 border-gray-100 rounded-2xl active:bg-gray-50 transition-colors cursor-pointer">
                  <span className="font-bold text-gray-800">{extra}</span>
                  <input type="checkbox" className="w-7 h-7 rounded-lg border-2 border-gray-200 accent-[#E4002B] transition-all" />
                </label>
              ))}
           </div>
        </section>
      </div>
      <div className="flex-shrink-0 p-6 bg-white border-t rounded-t-[40px] shadow-[0_-15px_30px_rgba(0,0,0,0.05)] space-y-6">
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-3xl">
          <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-16 h-16 bg-white border-2 border-gray-200 rounded-2xl text-3xl font-black flex items-center justify-center active:scale-95 transition-all text-gray-900 shadow-sm leading-none">−</button>
          <span className="text-4xl font-black text-gray-900 tabular-nums">{quantity}</span>
          <button onClick={() => setQuantity(q => q+1)} className="w-16 h-16 bg-white border-2 border-gray-200 rounded-2xl text-3xl font-black flex items-center justify-center active:scale-95 transition-all text-gray-900 shadow-sm leading-none">+</button>
        </div>
        <button 
          onClick={() => onAddToCart(product, quantity)}
          className="w-full bg-[#E4002B] text-white py-6 rounded-3xl text-2xl font-black uppercase tracking-tight shadow-[0_8px_20px_rgba(228,0,43,0.3)] active:scale-[0.98] transition-all flex items-center justify-between px-8"
        >
          <span>Add To Basket</span>
          <span className="font-oswald">Rs {(product.price * quantity).toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
};

const CartView: React.FC<{
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
  onBack: () => void;
  total: number;
}> = ({ items, onUpdateQuantity, onCheckout, onBack, total }) => {
  return (
    <div className="h-screen bg-[#F9F9F9] flex flex-col animate-scale-up overflow-hidden">
      <header className="flex-shrink-0 bg-white p-5 flex items-center justify-between border-b sticky top-0 z-10">
        <div className="flex items-center space-x-4">
           <button onClick={onBack} className="text-3xl bg-gray-100 text-gray-900 p-2 rounded-xl flex items-center justify-center w-12 h-12 flex-shrink-0">←</button>
           <h2 className="text-2xl font-black font-oswald uppercase text-gray-900 tracking-tight">Basket</h2>
        </div>
        <button onClick={onBack} className="text-[#E4002B] font-black uppercase text-xs border-2 border-[#E4002B] px-3 py-1 rounded-full">Add Items</button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-8">
        {items.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-[32px] border-2 border-gray-100 flex items-center space-x-4 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 shrink-0">
               <img src={item.image} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-start mb-1">
                 <h3 className="font-black text-gray-900 leading-tight">{item.name}</h3>
                 <button onClick={() => onUpdateQuantity(item.id, -item.quantity)} className="text-gray-400 hover:text-red-500 font-black text-xl bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
               </div>
               <p className="text-[10px] text-gray-400 font-bold uppercase mb-3">Regular Size</p>
               <div className="flex items-center justify-between">
                  <span className="font-black text-lg text-gray-900">Rs {(item.price * item.quantity).toFixed(2)}</span>
                  <div className="flex items-center space-x-4 bg-gray-100 rounded-2xl px-2 py-1.5 border border-gray-200">
                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-10 h-10 font-black text-xl text-gray-900 active:scale-90 transition-transform flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 leading-none">−</button>
                    <span className="font-black text-gray-900 text-lg tabular-nums">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-10 h-10 font-black text-xl text-gray-900 active:scale-90 transition-transform flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 leading-none">+</button>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex-shrink-0 p-8 bg-white border-t rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.08)] space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-500 font-bold uppercase text-xs tracking-widest">
             <span>Subtotal</span>
             <span>Rs {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-3xl font-black pt-4 border-t-2 border-gray-50 text-gray-900">
             <span>TOTAL</span>
             <span className="text-[#E4002B] font-oswald">Rs {(total).toFixed(2)}</span>
          </div>
        </div>
        <button onClick={onCheckout} className="w-full bg-[#86BC25] text-white py-6 rounded-3xl text-2xl font-black uppercase shadow-[0_10px_20px_rgba(134,188,37,0.3)] active:scale-[0.98] transition-all">
          Next Step
        </button>
      </div>
    </div>
  );
};

const CheckoutView: React.FC<{
  onNext: (method: 'DINE_IN' | 'PICK_UP' | 'DELIVERY', payment: 'COUNTER' | 'CASH_ON_DELIVERY') => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const [method, setMethod] = useState<'DINE_IN' | 'PICK_UP' | 'DELIVERY'>('DINE_IN');
  const [payment, setPayment] = useState<'COUNTER' | 'CASH_ON_DELIVERY'>('COUNTER');

  useMemo(() => {
    if (method === 'PICK_UP' || method === 'DINE_IN') {
      setPayment('COUNTER');
    } else {
      setPayment('CASH_ON_DELIVERY');
    }
  }, [method]);

  return (
    <div className="h-screen bg-[#F9F9F9] flex flex-col animate-scale-up overflow-hidden">
      <header className="flex-shrink-0 p-5 flex items-center space-x-4 border-b bg-white sticky top-0 z-20">
        <button onClick={onBack} className="text-3xl bg-gray-100 text-gray-900 p-2 rounded-xl flex items-center justify-center w-12 h-12 flex-shrink-0">←</button>
        <h2 className="text-xl font-black font-oswald uppercase text-gray-800">Order Method</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar">
        <section className="space-y-6">
           <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] px-1">Where will you eat?</h3>
           <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setMethod('DINE_IN')} className={`flex flex-col items-center justify-center p-4 rounded-[32px] border-4 transition-all shadow-sm ${method === 'DINE_IN' ? 'border-[#E4002B] bg-red-50' : 'border-gray-100 bg-white'}`}>
                <span className="text-4xl mb-3">🍽️</span>
                <span className={`font-black uppercase text-[10px] tracking-tight ${method === 'DINE_IN' ? 'text-[#E4002B]' : 'text-gray-900'}`}>Dine In</span>
              </button>
              <button onClick={() => setMethod('PICK_UP')} className={`flex flex-col items-center justify-center p-4 rounded-[32px] border-4 transition-all shadow-sm ${method === 'PICK_UP' ? 'border-[#E4002B] bg-red-50' : 'border-gray-100 bg-white'}`}>
                <span className="text-4xl mb-3">🏪</span>
                <span className={`font-black uppercase text-[10px] tracking-tight ${method === 'PICK_UP' ? 'text-[#E4002B]' : 'text-gray-900'}`}>Pick Up</span>
              </button>
              <button onClick={() => setMethod('DELIVERY')} className={`flex flex-col items-center justify-center p-4 rounded-[32px] border-4 transition-all shadow-sm ${method === 'DELIVERY' ? 'border-[#E4002B] bg-red-50' : 'border-gray-100 bg-white'}`}>
                <span className="text-4xl mb-3">🛵</span>
                <span className={`font-black uppercase text-[10px] tracking-tight ${method === 'DELIVERY' ? 'text-[#E4002B]' : 'text-gray-900'}`}>Delivery</span>
              </button>
           </div>
        </section>
        <section className="space-y-4">
           <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] px-1">How will you pay?</h3>
           <div className="space-y-4 pb-12">
              {method !== 'DELIVERY' ? (
                <div className="w-full flex items-center p-6 rounded-2xl border-4 border-[#E4002B] bg-red-50 text-[#E4002B]">
                  <span className="text-3xl mr-5">💵</span>
                  <span className="flex-1 font-black uppercase text-sm tracking-tight text-left">Pay at Counter</span>
                  <div className="w-8 h-8 rounded-full border-4 border-[#E4002B] bg-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#E4002B] rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center p-6 rounded-2xl border-4 border-[#E4002B] bg-red-50 text-[#E4002B]">
                  <span className="text-3xl mr-5">💸</span>
                  <span className="flex-1 font-black uppercase text-sm tracking-tight text-left">Cash on Delivery</span>
                  <div className="w-8 h-8 rounded-full border-4 border-[#E4002B] bg-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#E4002B] rounded-full" />
                  </div>
                </div>
              )}
           </div>
        </section>
      </div>
      <div className="flex-shrink-0 p-8 border-t bg-white rounded-t-[40px] z-30">
        <button onClick={() => onNext(method, payment)} className="w-full bg-[#E4002B] text-white py-7 rounded-3xl text-2xl font-black uppercase shadow-[0_15px_30px_rgba(228,0,43,0.3)] active:scale-[0.98] transition-all">
          Continue
        </button>
      </div>
    </div>
  );
};

const UserDetailsView: React.FC<{
  isDelivery: boolean;
  total: number;
  onNext: (details: UserDetails) => void;
  onBack: () => void;
  initialValues: UserDetails;
}> = ({ isDelivery, total, onNext, onBack, initialValues }) => {
  const [name, setName] = useState(initialValues.name);
  const [phone, setPhone] = useState(initialValues.phone);
  const [address, setAddress] = useState(initialValues.address);
  // Do not auto-populate with total as per user request. Use number or empty string.
  const [cashTendered, setCashTendered] = useState<number | ''>(initialValues.cashTendered || '');

  const numericTendered = cashTendered === '' ? 0 : Number(cashTendered);
  const change = Math.max(0, numericTendered - total);
  
  const isFormValid = name.trim().length > 0 && 
                     phone.trim().length >= 8 && 
                     (!isDelivery || (address.trim().length > 0 && (cashTendered === '' || numericTendered >= total)));

  return (
    <div className="h-screen bg-[#F9F9F9] flex flex-col animate-scale-up overflow-hidden">
      <header className="flex-shrink-0 p-5 flex items-center space-x-4 border-b bg-white sticky top-0 z-20">
        <button onClick={onBack} className="text-3xl bg-gray-100 text-gray-900 p-2 rounded-xl flex items-center justify-center w-12 h-12 flex-shrink-0">←</button>
        <h2 className="text-xl font-black font-oswald uppercase text-gray-800">Order Details</h2>
      </header>
      
      <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
        <div className="p-6 space-y-8 pb-40">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Full Name</label>
              <input 
                type="text" 
                placeholder="Your Name" 
                className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 text-xl font-bold text-gray-900 focus:border-[#E4002B] outline-none transition-all shadow-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Mobile Number</label>
              <input 
                type="tel" 
                placeholder="e.g. 57483399" 
                className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 text-xl font-bold text-gray-900 focus:border-[#E4002B] outline-none transition-all shadow-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {isDelivery && (
              <>
                <div className="space-y-2 animate-scale-up">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Delivery Address</label>
                  <textarea 
                    rows={2}
                    placeholder="Where should we send the food?" 
                    className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 text-lg font-bold text-gray-900 focus:border-[#E4002B] outline-none transition-all shadow-sm resize-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                
                <div className="bg-white border-4 border-amber-400 rounded-[32px] p-6 space-y-4 shadow-xl animate-scale-up">
                   <h3 className="text-sm font-black uppercase text-amber-500 tracking-widest text-center">Cash on Delivery Tender</h3>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 block text-center">Amount you will give driver (Rs)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="Optional"
                        className="w-full text-center bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-3xl font-black text-gray-900 focus:border-[#E4002B] outline-none transition-all"
                        value={cashTendered}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCashTendered(val === '' ? '' : parseFloat(val));
                        }}
                      />
                   </div>
                   <div className="flex items-center justify-between px-2 pt-2">
                      <div className="text-center">
                         <span className="block text-[8px] font-black text-gray-400 uppercase">Bill Amount</span>
                         <span className="font-bold text-gray-900">Rs {total.toFixed(2)}</span>
                      </div>
                      <div className="text-center bg-[#86BC25] text-white px-4 py-2 rounded-2xl shadow-lg transform scale-110">
                         <span className="block text-[8px] font-black uppercase opacity-80">Driver gives change</span>
                         <span className="text-xl font-black font-oswald tracking-wide">Rs {change.toFixed(2)}</span>
                      </div>
                   </div>
                   {cashTendered !== '' && numericTendered < total && numericTendered > 0 && (
                     <p className="text-[10px] text-red-500 font-black text-center uppercase tracking-tight">Amount must cover the bill total!</p>
                   )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 p-8 border-t bg-white rounded-t-[40px] z-30 shadow-[0_-15px_30px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => onNext({ name, phone, address, cashTendered: numericTendered })}
          disabled={!isFormValid}
          className={`w-full py-7 rounded-3xl text-2xl font-black uppercase shadow-lg transition-all ${
            isFormValid ? 'bg-[#E4002B] text-white shadow-[0_15px_30px_rgba(228,0,43,0.3)] active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Review Order
        </button>
      </div>
    </div>
  );
};

const FinalSummaryView: React.FC<{
  items: CartItem[];
  total: number;
  orderMethod: 'DINE_IN' | 'PICK_UP' | 'DELIVERY';
  userDetails: UserDetails;
  onConfirm: () => void;
  onBack: () => void;
}> = ({ items, total, orderMethod, userDetails, onConfirm, onBack }) => {
  const methodLabel = orderMethod === 'DINE_IN' ? 'Dine In' : orderMethod === 'PICK_UP' ? 'Pick Up' : 'Delivery';
  const methodIcon = orderMethod === 'DINE_IN' ? '🍽️' : orderMethod === 'PICK_UP' ? '🏪' : '🛵';
  const change = Math.max(0, userDetails.cashTendered - total);

  return (
    <div className="h-screen bg-[#F9F9F9] flex flex-col animate-scale-up overflow-hidden">
      <header className="flex-shrink-0 p-5 flex items-center space-x-4 border-b bg-white sticky top-0 z-20">
        <button onClick={onBack} className="text-3xl bg-gray-100 text-gray-900 p-2 rounded-xl flex items-center justify-center w-12 h-12 flex-shrink-0">←</button>
        <h2 className="text-xl font-black font-oswald uppercase text-gray-800">Confirm Order</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-10">
        <div className="bg-white p-6 rounded-[32px] border-2 border-gray-100 space-y-4 shadow-sm">
           <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Order Details</span>
              <span className="bg-[#E4002B] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase italic">{methodIcon} {methodLabel}</span>
           </div>
           <div className="space-y-2">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase text-gray-300">Customer</span>
                 <span className="font-black text-gray-900">{userDetails.name}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase text-gray-300">Mobile</span>
                 <span className="font-black text-gray-900">{userDetails.phone}</span>
              </div>
              {orderMethod === 'DELIVERY' && (
                <>
                  <div className="flex flex-col pt-2 border-t border-gray-50">
                     <span className="text-[10px] font-black uppercase text-gray-300">Delivery Address</span>
                     <span className="font-bold text-gray-700 leading-tight">{userDetails.address}</span>
                  </div>
                  {userDetails.cashTendered > 0 && (
                    <div className="grid grid-cols-2 gap-3 pt-3">
                       <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                          <span className="block text-[8px] font-black uppercase text-gray-400">Cash to Give</span>
                          <span className="font-black text-gray-900">Rs {userDetails.cashTendered.toFixed(2)}</span>
                       </div>
                       <div className="bg-[#86BC25]/10 p-3 rounded-2xl border border-[#86BC25]/20">
                          <span className="block text-[8px] font-black uppercase text-[#86BC25]">Expected Change</span>
                          <span className="font-black text-[#86BC25]">Rs {change.toFixed(2)}</span>
                       </div>
                    </div>
                  )}
                </>
              )}
           </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border-2 border-gray-100 space-y-4 shadow-sm">
           <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Items ({items.length})</span>
           </div>
           <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                   <div className="flex items-center space-x-3">
                      <div className="bg-gray-50 w-8 h-8 rounded-lg flex items-center justify-center font-black text-[#E4002B] text-xs">x{item.quantity}</div>
                      <span className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{item.name}</span>
                   </div>
                   <span className="font-black text-gray-900 text-sm">Rs {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
           </div>
           <div className="pt-4 border-t-2 border-gray-50 flex justify-between items-center">
              <span className="font-black uppercase text-gray-900">Total Bill</span>
              <span className="text-2xl font-black text-[#E4002B] font-oswald">Rs {total.toFixed(2)}</span>
           </div>
        </div>
      </div>
      <div className="flex-shrink-0 p-8 border-t bg-white rounded-t-[40px] z-30 shadow-[0_-15px_30px_rgba(0,0,0,0.05)]">
        <button onClick={onConfirm} className="w-full bg-[#86BC25] text-white py-7 rounded-3xl text-3xl font-black uppercase shadow-[0_15px_30px_rgba(134,188,37,0.3)] active:scale-[0.98] transition-all">
          Place Order
        </button>
      </div>
    </div>
  );
};

const SuccessView: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className="h-screen bg-[#E4002B] flex flex-col items-center justify-center p-10 space-y-10 animate-scale-up text-white overflow-hidden">
    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-[#E4002B] text-7xl shadow-2xl animate-[bounce_1.5s_infinite]">✓</div>
    <div className="text-center space-y-3">
       <h1 className="text-5xl font-black font-oswald uppercase tracking-tighter leading-none">Order Sent!</h1>
       <p className="text-xl font-medium opacity-90">Thank you for choosing KFC</p>
    </div>
    <div className="bg-white p-10 rounded-[40px] w-full text-center space-y-2 shadow-2xl">
       <div className="text-8xl font-black text-gray-900 font-oswald">729</div>
       <p className="text-xs font-black uppercase text-gray-400 tracking-[0.3em]">Order Number</p>
    </div>
    <button onClick={onReset} className="w-full bg-white text-[#E4002B] py-6 rounded-3xl text-2xl font-black uppercase shadow-xl active:scale-95 transition-all">New Order</button>
  </div>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [orderMethod, setOrderMethod] = useState<'DINE_IN' | 'PICK_UP' | 'DELIVERY'>('DINE_IN');
  const [paymentMethod, setPaymentMethod] = useState<'COUNTER' | 'CASH_ON_DELIVERY'>('COUNTER');
  const [userDetails, setUserDetails] = useState<UserDetails>({ name: '', phone: '', address: '', cashTendered: 0 });

  const cartTotal = useMemo(() => {
    const rawTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Fix floating point precision for currency
    return Math.round(rawTotal * 100) / 100;
  }, [cart]);
  
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
    setView(AppView.MENU);
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    }).filter(item => item.quantity > 0));
  }, []);

  const reset = useCallback(() => {
    setCart([]);
    setUserDetails({ name: '', phone: '', address: '', cashTendered: 0 });
    setView(AppView.LANDING);
  }, []);

  return (
    <div className="max-w-md mx-auto h-screen bg-white overflow-hidden relative shadow-2xl">
      {view === AppView.LANDING && <LandingView onStart={() => setView(AppView.MENU)} />}
      
      {view === AppView.MENU && (
        <MenuView 
          cartTotal={cartTotal}
          cartCount={cartCount}
          onRestart={reset}
          onSelectProduct={(p) => { setSelectedProduct(p); setView(AppView.PRODUCT_DETAIL); }}
          onGoToCart={() => setView(AppView.CART)}
        />
      )}

      {view === AppView.PRODUCT_DETAIL && selectedProduct && (
        <ProductDetailView 
          product={selectedProduct}
          onBack={() => setView(AppView.MENU)}
          onAddToCart={addToCart}
        />
      )}

      {view === AppView.CART && (
        <CartView 
          items={cart}
          total={cartTotal}
          onBack={() => setView(AppView.MENU)}
          onUpdateQuantity={updateQuantity}
          onCheckout={() => setView(AppView.CHECKOUT)}
        />
      )}

      {view === AppView.CHECKOUT && (
        <CheckoutView 
          onBack={() => setView(AppView.CART)}
          onNext={(method, payment) => {
            setOrderMethod(method);
            setPaymentMethod(payment);
            setView(AppView.USER_DETAILS);
          }}
        />
      )}

      {view === AppView.USER_DETAILS && (
        <UserDetailsView 
          isDelivery={orderMethod === 'DELIVERY'}
          total={cartTotal}
          initialValues={userDetails}
          onBack={() => setView(AppView.CHECKOUT)}
          onNext={(details) => {
            setUserDetails(details);
            setView(AppView.FINAL_SUMMARY);
          }}
        />
      )}

      {view === AppView.FINAL_SUMMARY && (
        <FinalSummaryView 
          items={cart}
          total={cartTotal}
          orderMethod={orderMethod}
          userDetails={userDetails}
          onBack={() => setView(AppView.USER_DETAILS)}
          onConfirm={() => setView(AppView.ORDER_CONFIRMED)}
        />
      )}

      {view === AppView.ORDER_CONFIRMED && <SuccessView onReset={reset} />}
    </div>
  );
}
