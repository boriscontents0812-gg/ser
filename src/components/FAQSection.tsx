import React, { useState } from 'react';
import { storeConfig } from '../config/storeConfig';
import { ChevronDown, AlertCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-capacity');

  const toggle = (id: string) => {
    setOpenId((curr) => (curr === id ? null : id));
  };

  return (
    <section id="faq-section" className="py-24 bg-[#0A0B0D] border-t border-[#1E2126]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-accent block">
            Common Inquiries
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Frequently Asked<br />
            <span className="bg-gradient-to-r from-[#F6C58D] via-[#EAA968] to-[#CF9258] bg-clip-text text-transparent">
              Questions.
            </span>
          </h2>
          <p className="text-base text-[#9AA1AD] font-normal pt-1">
            Everything you need to know about dimensions, packing capacity, and verified care.
          </p>
        </div>

        <div className="space-y-4">
          {storeConfig.faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-[#121417] border border-[#202328] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-white tracking-wide">
                      {faq.question}
                    </span>
                    {!faq.isConfirmed && (
                      <span className="shrink-0 text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/80 text-amber-300">
                        Confirmation Needed
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8E95A2] transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-7 pb-6 pt-1 text-sm text-[#9AA1AD] leading-relaxed border-t border-[#1E2126] space-y-3 font-normal">
                    <p>{faq.answer}</p>
                    {!faq.isConfirmed && faq.placeholderNotice && (
                      <div className="p-4 bg-[#0A0B0D] border border-amber-900/50 rounded-xl text-xs text-amber-200/90 flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{faq.placeholderNotice}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
