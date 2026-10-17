import React, { useEffect } from 'react';
import { storeConfig } from '../config/storeConfig';
import { X, AlertCircle, ShieldCheck } from 'lucide-react';

export type PolicyType = 'shipping' | 'returns' | 'care' | 'privacy' | 'terms' | null;

interface PolicyModalProps {
  policy: PolicyType;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policy, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && policy) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [policy, onClose]);

  if (!policy) return null;

  const getPolicyData = () => {
    switch (policy) {
      case 'shipping':
        return {
          title: storeConfig.policies.shipping.headline,
          text: storeConfig.policies.shipping.text,
          notice: storeConfig.policies.shipping.placeholderNotice,
          isPending: storeConfig.policies.shipping.status === 'pending_confirmation',
        };
      case 'returns':
        return {
          title: storeConfig.policies.returns.headline,
          text: storeConfig.policies.returns.text,
          notice: storeConfig.policies.returns.placeholderNotice,
          isPending: storeConfig.policies.returns.status === 'pending_confirmation',
        };
      case 'care':
        return {
          title: storeConfig.policies.care.headline,
          text: storeConfig.policies.care.text,
          notice: storeConfig.policies.care.placeholderNotice,
          isPending: storeConfig.policies.care.status === 'pending_confirmation',
        };
      case 'privacy':
        return {
          title: storeConfig.policies.privacy.headline,
          text: storeConfig.policies.privacy.text,
          notice: null,
          isPending: false,
        };
      case 'terms':
        return {
          title: storeConfig.policies.terms.headline,
          text: storeConfig.policies.terms.text,
          notice: null,
          isPending: false,
        };
    }
  };

  const data = getPolicyData();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        style={{ overscrollBehavior: 'contain' }}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        style={{ overscrollBehavior: 'contain' }}
        className="relative z-10 w-full max-w-2xl bg-white border border-[#D6DCE1] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#14334D] animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#3898D5] font-bold">
              {storeConfig.brand.name} Store Policies
            </span>
            <h2 id="policy-dialog-title" className="text-2xl font-serif text-[#14334D]">
              {data.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#456176] hover:text-[#14334D] rounded-full hover:bg-[#F0F2F5] transition-colors focus:outline-none"
            aria-label="Close policy dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-4 text-sm text-[#456176] leading-relaxed">
          <p>{data.text}</p>

          {data.isPending && data.notice && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900 block mb-0.5">
                  Store Owner Confirmation Status:
                </span>
                <p>{data.notice}</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#456176]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#3898D5]" />
            <span>Honest & transparent terms</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#0D0E10] hover:bg-black rounded-full text-white font-semibold transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
