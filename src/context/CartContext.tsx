import React, { createContext, useContext, useState, useEffect } from 'react';
import { storeConfig } from '../config/storeConfig';

export interface CartItem {
  productId: string;
  title: string;
  variantName: string;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  totalQuantity: number;
  isCartOpen: boolean;
  isCheckingOut: boolean;
  checkoutError: string | null;
  notification: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (quantity: number) => void;
  updateQuantity: (quantity: number) => void;
  removeItem: () => void;
  clearCart: () => void;
  clearCheckoutError: () => void;
  handleCheckout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'wayfold_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse cart storage', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Keep cart contents persisted across pages or returning from checkout
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
  }, [items]);

  // Handle URL query parameters for cancelled checkout return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled') === 'true') {
      setIsCartOpen(true);
      setCheckoutError('Your checkout was cancelled. All items have been preserved in your cart.');
      // Clean up URL without reload
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const addItem = (quantity: number) => {
    if (quantity <= 0) return;
    
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === storeConfig.product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === storeConfig.product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        {
          productId: storeConfig.product.id,
          title: storeConfig.product.title,
          variantName: storeConfig.product.variantName,
          quantity: quantity,
          image: storeConfig.product.primaryImage,
        },
      ];
    });

    showNotification(`Added ${quantity} × ${storeConfig.product.title} to your bag`);
    setIsCartOpen(true);
  };

  const updateQuantity = (newQty: number) => {
    if (newQty <= 0) {
      removeItem();
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === storeConfig.product.id ? { ...i, quantity: newQty } : i
      )
    );
  };

  const removeItem = () => {
    setItems([]);
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const clearCheckoutError = () => {
    setCheckoutError(null);
  };

  // Perform checkout strictly communicating with server backend
  const handleCheckout = async () => {
    // Prevent duplicate checkout requests when customer clicks repeatedly
    if (isCheckingOut) return;

    if (items.length === 0) {
      setCheckoutError('Your cart is empty. Please add an item before checking out.');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Security: Client NEVER transmits prices or totals. Only sends productId & quantity.
      // The trusted backend validates inventory, product validity, reads server price,
      // and constructs the Stripe session or stops if unconfigured.
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        returnUrl: window.location.origin,
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Checkout initiation failed. Please try again.');
      }

      if (data.checkoutUrl) {
        // Redirect customer to verified payment provider checkout session
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned from payment provider.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message || 'An unexpected error occurred during checkout.');
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalQuantity,
        isCartOpen,
        isCheckingOut,
        checkoutError,
        notification,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        clearCheckoutError,
        handleCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
