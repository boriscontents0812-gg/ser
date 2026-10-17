import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { storeConfig } from '../config/storeConfig';
import { X, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    isCheckingOut,
    checkoutError,
    closeCart,
    updateQuantity,
    removeItem,
    clearCheckoutError,
    handleCheckout,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);
  const { product } = storeConfig;

  // Handle escape key to close cart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCents = product.defaultRetailPrice
    ? Math.round(items.reduce((sum, item) => sum + item.quantity * product.defaultRetailPrice! * 100, 0))
    : 0;
  const subtotalDisplay = (totalCents / 100).toFixed(2);
  const isPriceConfigured = product.defaultRetailPrice !== null && product.defaultRetailPrice > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
      className="fixed inset-0 z-50 flex justify-end"
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Modern Web Guidance: Backdrop with overscroll-behavior: contain, no body mutation layout shifts */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        style={{ overscrollBehavior: 'contain' }}
        aria-hidden="true"
      />

      {/* Drawer Panel - Kree8 tactile white raised surface */}
      <div
        ref={drawerRef}
        style={{ overscrollBehavior: 'contain' }}
        className="relative z-10 w-full max-w-md bg-white border-l border-[#D6DCE1] text-[#14334D] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#3898D5]" />
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#14334D]">
              YOUR BAG ({totalQuantity})
            </h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="p-1.5 text-[#456176] hover:text-[#14334D] rounded-full hover:bg-[#F0F2F5] transition-colors focus:outline-none"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checkout Error Alert Banner */}
        {checkoutError && (
          <div className="m-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{checkoutError}</p>
            </div>
            <button
              onClick={clearCheckoutError}
              className="text-amber-600 hover:text-amber-800 shrink-0 p-0.5"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Cart Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ overscrollBehavior: 'contain' }}>
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
              <div className="w-16 h-16 rounded-full bg-[#F0F2F5] border border-[#D6DCE1] flex items-center justify-center text-[#456176]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#14334D] tracking-wide">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-[#456176] max-w-xs leading-relaxed">
                  Add The Double-Layer Travel Organizer to begin packing with calm structure.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="mt-4 px-7 py-3 bg-[#0D0E10] text-white font-semibold text-xs tracking-wider uppercase rounded-full shadow-pill hover:bg-black transition-all"
              >
                Browse Organizer
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="relative bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex gap-4 items-center shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center p-2 shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="max-h-14 max-w-14 object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#14334D] truncate">
                        {item.title}
                      </h4>
                      {/* Close / Remove button */}
                      <button
                        type="button"
                        onClick={removeItem}
                        className="text-[#A0AFBB] hover:text-[#14334D] transition-colors p-1"
                        aria-label="Remove item from bag"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#456176]">
                      {item.variantName} · Single Batch
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      {/* Pill Stepper */}
                      <div className="flex items-center bg-white border border-[#CBD5E1] rounded-full px-2.5 py-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.quantity - 1)}
                          className="p-1 text-[#456176] hover:text-[#14334D] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-[#14334D]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.quantity + 1)}
                          className="p-1 text-[#456176] hover:text-[#14334D] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price Display */}
                      <div className="text-right">
                        {isPriceConfigured ? (
                          <span className="text-sm font-extrabold text-[#14334D]">
                            {product.currencySymbol}{(product.defaultRetailPrice! * item.quantity).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600">Price Unset</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer & Checkout Trigger */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-[#E2E8F0] space-y-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-[#456176]">Subtotal</span>
                <span className="font-extrabold text-base text-[#14334D]">
                  {isPriceConfigured ? `${product.currencySymbol}${subtotalDisplay}` : 'Pending Price Setup'}
                </span>
              </div>
              <p className="text-[11px] text-[#708496]">
                Shipping and taxes calculated at checkout.
              </p>
            </div>

            {/* Black Pill Checkout Button */}
            <button
              type="button"
              disabled={isCheckingOut}
              onClick={handleCheckout}
              className="w-full bg-[#0D0E10] hover:bg-black text-white font-semibold text-xs tracking-[0.15em] uppercase py-4 rounded-full transition-all shadow-pill hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3898D5]"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Securing Session...</span>
                </>
              ) : (
                <span>Checkout</span>
              )}
            </button>

            <div className="text-center text-[11px] text-[#708496] pt-1">
              <span>Verified Server Checkout • Strict Price & Inventory Protection</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
