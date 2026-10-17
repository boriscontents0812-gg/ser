import React, { useState } from 'react';
import { storeConfig } from '../config/storeConfig';
import { useCart } from '../context/CartContext';
import { Plus, Minus, ArrowRight, Check, AlertCircle, Sparkles } from 'lucide-react';

export const ProductHero: React.FC = () => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { product } = storeConfig;

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    addItem(quantity);
  };

  const isPriceConfigured = product.defaultRetailPrice !== null && product.defaultRetailPrice > 0;
  const totalPrice = isPriceConfigured ? (product.defaultRetailPrice! * quantity).toFixed(2) : '0.00';

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
      {/* Outer Floating Frosted Glass Container - Exact style from 4th image */}
      <div className="bg-[#143B4E]/75 backdrop-blur-xl border border-white/30 rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 shadow-2xl">
        {/* Top Header line inside frosted glass */}
        <div className="flex items-center justify-between gap-2 pb-3.5 px-1 text-white/90">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#A8D7EE]" />
            <span className="text-xs font-medium tracking-wide">
              Thoughtfully crafted for carry-on perfection
            </span>
          </div>
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
            Verified Spec
          </span>
        </div>

        {/* Inner White Tactile Card - Exact style from 4th image */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-tactile border border-white/80 flex flex-col gap-5 text-left">
          {/* Top Title & Badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#E8F1FC] text-[#2563EB] px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {product.variantName}
              </span>
              <span className="bg-[#ECFDF5] text-[#059669] px-2.5 py-0.5 rounded-full text-xs font-semibold">
                In Stock
              </span>
              <span className="bg-[#F3E8FF] text-[#7C3AED] px-2.5 py-0.5 rounded-full text-xs font-semibold">
                Dual Compartment
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl text-[#14334D] leading-tight font-normal">
              <span className="font-serif italic text-3xl sm:text-4xl text-[#14334D]">
                The Double-Layer
              </span>{' '}
              <span className="font-serif text-[#14334D]">Travel Organizer</span>
            </h2>
          </div>

          {/* Description */}
          <p className="text-sm text-[#263D52] leading-relaxed font-normal">
            {product.subtitle} Two structured tiers separate undergarments from everyday luggage, complete with a perimeter compression zipper.
          </p>

          {/* Feature highlights pills */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#183147]">
            <div className="flex items-center gap-1.5 bg-[#F0F2F5] px-3 py-2 rounded-xl border border-[#D6DCE1]/80">
              <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[2.5]" />
              <span>15 × 5.9 × 10.2 Inches</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#F0F2F5] px-3 py-2 rounded-xl border border-[#D6DCE1]/80">
              <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[2.5]" />
              <span>Compression Zipper</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#F0F2F5] px-3 py-2 rounded-xl border border-[#D6DCE1]/80">
              <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[2.5]" />
              <span>Mesh Sleeve Dividers</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#F0F2F5] px-3 py-2 rounded-xl border border-[#D6DCE1]/80">
              <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[2.5]" />
              <span>Soft Webbing Handle</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E8ECEF]" />

          {/* Price, Stepper, and CTA Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Price Display */}
            <div>
              {isPriceConfigured ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#14334D] tracking-tight">
                    {product.currencySymbol}{product.defaultRetailPrice?.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-[#6B7E8F] uppercase">
                    {product.currency}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Pending Price Setup</span>
                </div>
              )}
            </div>

            {/* Quantity Stepper & Black Pill CTA Button */}
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center bg-[#F0F2F5] border border-[#D6DCE1] rounded-full px-3 py-2 shadow-inner">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="text-[#2D4559] hover:text-[#14334D] disabled:opacity-30 disabled:cursor-not-allowed p-1 transition-colors focus:outline-none"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm text-[#14334D] px-3 min-w-[1.75rem] text-center" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="text-[#2D4559] hover:text-[#14334D] p-1 transition-colors focus:outline-none"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Black Pill Button matching "Claim now →" in 4th image */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 sm:flex-none bg-[#0D0E10] hover:bg-black text-white px-6 py-3.5 rounded-full font-semibold text-sm tracking-wide shadow-pill hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[#3898D5]"
              >
                <span>Add to Bag</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
