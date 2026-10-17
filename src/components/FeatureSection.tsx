import React from 'react';
import { Layers, Shield, Minimize2, Luggage, Sparkles } from 'lucide-react';
import { storeConfig } from '../config/storeConfig';

export const FeatureSection: React.FC = () => {
  return (
    <section id="benefits-section" className="py-20 sm:py-28 bg-[#F0F2F5] border-t border-[#D6DCE1]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Editorial Kree8 style */}
        <div className="max-w-3xl space-y-3 mb-14">
          <div className="flex items-center gap-2">
            <span className="uppercase text-[#456176] font-bold text-xs tracking-[0.2em] block">
              Pack With Less Digging
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#14334D] leading-tight">
            More than just a<br />
            <span className="font-serif italic font-normal text-4xl sm:text-5xl lg:text-6xl text-[#3898D5]">
              packing bag.
            </span>
          </h2>
          <p className="text-base text-[#456176] leading-relaxed font-normal pt-2">
            Arriving at your destination should feel seamless. Rather than loose delicates shifting around luggage corners, {storeConfig.brand.name} delivers a dedicated, dual-tier enclosure that keeps everything neatly organized and immediately accessible.
          </p>
        </div>

        {/* 4 Core Benefit Cards in a row - Kree8 tactile card styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-white/80 rounded-[28px] p-7 transition-all flex flex-col justify-between group shadow-tactile hover:shadow-kree8 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F1FC] flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#14334D]">
                Dual-Tier Separation
              </h3>
              <p className="text-sm text-[#456176] leading-relaxed font-normal">
                Two independent zippered compartments allow you to separate undergarments from everyday luggage, maintaining hygiene and privacy.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#EEF2F6] flex items-center gap-2 text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider">
              <span>Verified Structure</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-white/80 rounded-[28px] p-7 transition-all flex flex-col justify-between group shadow-tactile hover:shadow-kree8 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center text-[#059669] group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#14334D]">
                Delicates Protection
              </h3>
              <p className="text-sm text-[#456176] leading-relaxed font-normal">
                Structured flat storage preserves cup shaping from A to 36D without harsh crushing, while elastic mesh sleeves hold small accessories.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#EEF2F6] flex items-center gap-2 text-[11px] font-semibold text-[#059669] uppercase tracking-wider">
              <span>Verified Feature</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-white/80 rounded-[28px] p-7 transition-all flex flex-col justify-between group shadow-tactile hover:shadow-kree8 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#7C3AED] group-hover:scale-110 transition-transform">
                <Minimize2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#14334D]">
                Compression on Demand
              </h3>
              <p className="text-sm text-[#456176] leading-relaxed font-normal">
                Traveling light? Use the integrated compression zipper to cinch the lower compartment down, freeing up vital space in your carry-on roller.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#EEF2F6] flex items-center gap-2 text-[11px] font-semibold text-[#7C3AED] uppercase tracking-wider">
              <span>Verified Feature</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-white/80 rounded-[28px] p-7 transition-all flex flex-col justify-between group shadow-tactile hover:shadow-kree8 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] flex items-center justify-center text-[#EA580C] group-hover:scale-110 transition-transform">
                <Luggage className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#14334D]">
                Carry-On Optimized
              </h3>
              <p className="text-sm text-[#456176] leading-relaxed font-normal">
                Engineered to 15 × 5.9 × 10.2 inches, perfectly proportioned to slot flat into standard international overhead luggage and duffels.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#EEF2F6] flex items-center gap-2 text-[11px] font-semibold text-[#EA580C] uppercase tracking-wider">
              <span>Verified Sizing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
