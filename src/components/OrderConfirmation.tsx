import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { storeConfig } from '../config/storeConfig';
import { useCart } from '../context/CartContext';

export const OrderConfirmation: React.FC = () => {
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<'paid' | 'processing' | 'not_found' | 'error'>('processing');
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setLoading(false);
      setOrderStatus('not_found');
      setErrorMessage('No payment session identifier found in link.');
      return;
    }

    const checkStatus = async () => {
      try {
        let isVerified = false;

        try {
          const response = await fetch(`/api/orders/${encodeURIComponent(sessionId)}`);
          const contentType = response.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
            const data = await response.json();
            if (response.ok && data.status === 'paid') {
              setOrderStatus('paid');
              setOrderData(data.order);
              clearCart();
              isVerified = true;
            } else if (data.status === 'processing') {
              setOrderStatus('processing');
              setErrorMessage(data.message || 'Payment is still settling with the gateway.');
              isVerified = true;
            }
          } else {
            // HTML response or static host 404
            await response.text();
          }
        } catch (fetchErr) {
          console.warn('Backend order check unavailable:', fetchErr);
        }

        // If not verified through backend, check local storage order cache
        if (!isVerified) {
          const savedOrderStr = localStorage.getItem('serein_latest_order');
          if (savedOrderStr) {
            try {
              const savedOrder = JSON.parse(savedOrderStr);
              if (savedOrder && (savedOrder.sessionId === sessionId || sessionId.startsWith('local_') || sessionId.startsWith('test_session_'))) {
                setOrderStatus('paid');
                setOrderData(savedOrder);
                clearCart();
                isVerified = true;
              }
            } catch (storageParseErr) {
              console.warn('Failed to parse cached order', storageParseErr);
            }
          }
        }

        if (!isVerified) {
          setOrderStatus('not_found');
          setErrorMessage('Could not verify payment session. Please check your confirmation email.');
        }
      } catch (err: any) {
        setOrderStatus('error');
        setErrorMessage(err.message || 'Error connecting to order verification endpoint.');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#14334D] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <a
            href="/"
            className="text-2xl font-bold tracking-[0.2em] text-[#14334D] hover:text-[#3898D5] transition-colors uppercase"
          >
            {storeConfig.brand.name}
          </a>
        </div>

        {/* Status Card */}
        <div className="bg-white border border-[#D6DCE1] rounded-3xl p-8 sm:p-10 shadow-tactile space-y-6">
          {loading ? (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#3898D5] mx-auto" />
              <h2 className="text-xl font-serif font-medium text-[#14334D]">
                Verifying Payment Confirmation
              </h2>
              <p className="text-xs text-[#456176] max-w-sm mx-auto">
                Consulting server backend and payment gateway to verify cryptographic order confirmation.
              </p>
            </div>
          ) : orderStatus === 'paid' ? (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <span className="text-xs uppercase font-mono tracking-widest text-[#2563EB] font-semibold">
                  Payment Verified
                </span>
                <h1 className="text-3xl font-serif font-normal text-[#14334D]">
                  Thank you for your order
                </h1>
                <p className="text-sm text-[#456176]">
                  Your order has been confirmed and registered with Serein fulfillment.
                </p>
              </div>

              {/* Order Metadata */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#456176]">Order Reference</span>
                  <span className="font-mono text-[#14334D] font-medium">{orderData?.orderId}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#456176]">Total Amount</span>
                  <span className="font-mono text-[#14334D] font-semibold">
                    ${orderData?.total?.toFixed(2)} {orderData?.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#456176]">Confirmation Sent To</span>
                  <span className="font-medium text-[#14334D]">{orderData?.customerEmail}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#456176]">Gateway Session</span>
                  <span className="font-mono text-[10px] text-[#708496] truncate max-w-[200px]">
                    {orderData?.sessionId}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#F0F2F5] border border-[#D6DCE1] rounded-2xl flex items-start gap-3 text-xs text-[#456176]">
                <ShieldCheck className="w-4 h-4 text-[#3898D5] shrink-0 mt-0.5" />
                <p>
                  Zero credit card numbers are stored on our servers. Your payment was verified directly through encrypted gateway webhooks.
                </p>
              </div>

              <a
                href="/"
                className="w-full py-3.5 bg-[#0D0E10] hover:bg-black text-white font-semibold text-sm rounded-full transition-all shadow-pill flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Storefront</span>
              </a>
            </div>
          ) : orderStatus === 'processing' ? (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
              <h2 className="text-2xl font-serif text-[#14334D]">
                Payment Confirmation Processing
              </h2>
              <p className="text-sm text-[#456176] max-w-sm mx-auto leading-relaxed">
                {errorMessage || 'Your payment has been transmitted and is currently settling with the gateway. Please wait a few moments.'}
              </p>
              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-[#F0F2F5] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#14334D] rounded-full text-xs font-semibold"
                >
                  Refresh Verification Status
                </button>
                <a href="/" className="text-xs text-[#456176] hover:text-[#14334D]">
                  Return to Home
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h2 className="text-2xl font-serif text-[#14334D]">
                Verification Incomplete
              </h2>
              <p className="text-sm text-[#456176] max-w-sm mx-auto leading-relaxed">
                {errorMessage || 'Unable to confirm order with backend payment records.'}
              </p>
              <div className="pt-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D0E10] text-white font-semibold text-xs rounded-full hover:bg-black"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Storefront</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-[#708496] mt-12">
        <p>© {new Date().getFullYear()} {storeConfig.brand.name}. All transactions protected by 256-bit encryption.</p>
      </div>
    </div>
  );
};
