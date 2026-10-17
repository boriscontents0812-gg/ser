import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notification, openCart } = useCart();

  if (!notification) return null;

  return (
    <aside
      aria-label="Notification"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-[#D6DCE1] rounded-2xl p-4 shadow-tactile text-[#14334D] flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center gap-3 min-w-0">
        <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
        <span className="text-xs font-semibold truncate text-[#14334D]">{notification}</span>
      </div>
      <button
        type="button"
        onClick={openCart}
        className="px-4 py-1.5 bg-[#0D0E10] text-white font-semibold text-xs rounded-full hover:bg-black transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
      >
        <ShoppingBag className="w-3.5 h-3.5 text-white" />
        <span>View Bag</span>
      </button>
    </aside>
  );
};
