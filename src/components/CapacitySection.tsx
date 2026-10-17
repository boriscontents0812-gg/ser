import React from 'react';
import { storeConfig } from '../config/storeConfig';
import { Info, Check } from 'lucide-react';

export const CapacitySection: React.FC = () => {
  const { capacity } = storeConfig.product;

  return (
    <section id="capacity-section" className="py-20 sm:py-28 bg-[#EAEFF4] border-t border-[#D6DCE1]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3 mb-14">
          <span className="uppercase text-[#456176] font-bold text-xs tracking-[0.2em] block">
            Packing Volume
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#14334D] leading-tight">
            What fits<br />
            <span className="font-serif italic font-normal text-4xl sm:text-5xl lg:text-6xl text-[#3898D5]">
              inside.
            </span>
          </h2>
          <p className="text-base text-[#456176] leading-relaxed font-normal pt-2">
            {capacity.subheadline}
          </p>
        </div>

        {/* 4 Capacity Cards in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capacity.items.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-white/80 rounded-[28px] p-7 flex flex-col justify-between transition-all group shadow-tactile hover:shadow-kree8 hover:-translate-y-1"
            >
              <div>
                <span className="text-[11px] font-mono text-[#2563EB] uppercase tracking-widest block mb-3 font-semibold">
                  0{index + 1} // ESTIMATE
                </span>
                <p className="text-3xl font-extrabold text-[#14334D] tracking-tight mb-1">
                  {item.quantity}
                </p>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#304F67] mb-3">
                  {item.item}
                </h3>
                <p className="text-xs text-[#456176] leading-relaxed font-normal">
                  {item.note}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EEF2F6] flex items-center gap-1.5 text-[11px] font-medium text-[#456176]">
                <Check className="w-3.5 h-3.5 text-[#3898D5] stroke-[2.5]" />
                <span>Supplier listed spec</span>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer Note */}
        <div className="mt-12 max-w-3xl bg-white/80 backdrop-blur-sm border border-white rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
          <Info className="w-5 h-5 text-[#3898D5] shrink-0 mt-0.5" />
          <div className="text-xs text-[#456176] space-y-1">
            <span className="font-bold text-[#14334D] block">
              Capacity Transparency Notice:
            </span>
            <p className="leading-relaxed">
              {capacity.disclaimer} Supplier estimates reflect garments folded flat. Padded winter socks, heavily lined undergarments, or larger silhouettes may alter total packing volume.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
