import React, { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { storeConfig } from '../config/storeConfig';
import { useCart } from '../context/CartContext';

export const Header: React.FC = () => {
  const { totalQuantity, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-[#D6DCE1]/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Mobile menu trigger */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#456176] hover:text-[#14334D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3898D5]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Brand Text Logo - Matches clean Anything.com / WAYFOLD minimal typography */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-[0.2em] text-[#14334D] hover:text-[#3898D5] transition-colors uppercase"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#3898D5] inline-block shadow-sm"></span>
            <span>{storeConfig.brand.name}</span>
          </a>
        </div>

        {/* Desktop Navigation - Clean kree8.studio styled pills */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-[#456176]" aria-label="Main Navigation">
          <button
            onClick={() => scrollTo('shop')}
            className="hover:text-[#14334D] transition-colors focus:outline-none"
          >
            Shop
          </button>
          <button
            onClick={() => scrollTo('benefits-section')}
            className="hover:text-[#14334D] transition-colors focus:outline-none"
          >
            Benefits
          </button>
          <button
            onClick={() => scrollTo('capacity-section')}
            className="hover:text-[#14334D] transition-colors focus:outline-none"
          >
            Capacity
          </button>
          <button
            onClick={() => scrollTo('checkout')}
            className="hover:text-[#14334D] transition-colors focus:outline-none flex items-center gap-1.5"
          >
            <span>Checkout</span>
            {totalQuantity > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#3898D5]" />
            )}
          </button>
        </nav>

        {/* Working Cart Icon Button - Styled as the signature white pill button from 4th image & kree8 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCart}
            className="group relative px-5 py-2.5 bg-white hover:bg-[#F8FAFC] border border-white/80 rounded-full transition-all flex items-center gap-2.5 shadow-tactile focus:outline-none focus:ring-2 focus:ring-[#3898D5] active:scale-95"
            aria-label={`Shopping bag containing ${totalQuantity} items`}
          >
            <ShoppingBag className="w-4 h-4 text-[#304F67] group-hover:text-[#14334D] transition-colors" />
            <span className="text-xs font-semibold tracking-wider text-[#304F67] uppercase">
              Bag
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
              totalQuantity > 0 
                ? 'bg-[#0D0E10] text-white shadow-sm' 
                : 'bg-[#EEF2F6] text-[#456176]'
            }`}>
              {totalQuantity}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-[#D6DCE1] px-6 py-5 space-y-3.5 text-xs font-semibold tracking-wider uppercase shadow-lg">
          <button
            onClick={() => scrollTo('shop')}
            className="block w-full text-left py-2 text-[#14334D]"
          >
            Shop Organizer
          </button>
          <button
            onClick={() => scrollTo('benefits-section')}
            className="block w-full text-left py-2 text-[#456176] hover:text-[#14334D]"
          >
            Benefits
          </button>
          <button
            onClick={() => scrollTo('capacity-section')}
            className="block w-full text-left py-2 text-[#456176] hover:text-[#14334D]"
          >
            Capacity Guide
          </button>
          <button
            onClick={() => scrollTo('checkout')}
            className="block w-full text-left py-2 text-[#2563EB] font-bold"
          >
            Checkout ({totalQuantity})
          </button>
        </div>
      )}
    </header>
  );
};
