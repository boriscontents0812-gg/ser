import React from 'react';
import { storeConfig } from '../config/storeConfig';
import { Ruler, Luggage, Check } from 'lucide-react';

export const DimensionsSection: React.FC = () => {
  const { dimensions } = storeConfig.product;

  return (
    <section id="dimensions-section" className="py-24 bg-[#0A0B0D] border-t border-[#1E2126]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3 mb-16">
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-accent block">
            Proportions & Space
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Engineered For<br />
            <span className="bg-gradient-to-r from-[#F6C58D] via-[#EAA968] to-[#CF9258] bg-clip-text text-transparent">
              Every Carry-On.
            </span>
          </h2>
          <p className="text-base text-[#9AA1AD] leading-relaxed font-normal pt-2">
            Measuring {dimensions.displayString}, The Double-Layer Travel Organizer is sized specifically to align with standard international carry-on trolley dimensions.
          </p>
        </div>

        {/* Blueprint Visual Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Visual Schematic Diagram */}
          <div className="lg:col-span-7 bg-[#121417] border border-[#202328] rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col items-center justify-center shadow-xl">
            {/* Ambient grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2126_1px,transparent_1px),linear-gradient(to_bottom,#1E2126_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md py-6">
              {/* Illustrated 3D wireframe box */}
              <div className="relative aspect-[16/10] border-2 border-dashed border-accent/50 rounded-3xl bg-[#0A0B0D]/80 flex flex-col justify-between p-6 shadow-2xl backdrop-blur-sm">
                {/* Upper Tier visual line */}
                <div className="w-full flex items-center justify-between pb-3 border-b border-[#1E2126]">
                  <span className="text-xs font-mono font-semibold text-accent">
                    [Tier 1: Mesh Sleeves & Molded Storage]
                  </span>
                  <span className="text-[11px] text-[#8E95A2]">Upper</span>
                </div>

                {/* Compression zipper midline marker */}
                <div className="w-full flex items-center justify-center py-2">
                  <div className="w-full border-t border-dashed border-accent/30 flex items-center justify-center">
                    <span className="bg-[#0A0B0D] px-3 text-[10px] uppercase font-mono tracking-widest text-accent font-bold">
                      Compression Zipper Gusset
                    </span>
                  </div>
                </div>

                {/* Lower Tier visual line */}
                <div className="w-full flex items-center justify-between pt-3 border-t border-[#1E2126]">
                  <span className="text-xs font-mono font-semibold text-accent">
                    [Tier 2: Satin Lining & Deep Storage]
                  </span>
                  <span className="text-[11px] text-[#8E95A2]">Lower</span>
                </div>

                {/* Dimension callouts */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#1A1D22] border border-[#2B3037] px-4 py-1 rounded-full text-xs text-white font-mono font-semibold shadow-md">
                  Length: 15.0 in / 38.1 cm
                </div>

                <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 bg-[#1A1D22] border border-[#2B3037] px-3.5 py-1 rounded-full text-xs text-white font-mono font-semibold shadow-md">
                  Height: 10.2 in
                </div>

                <div className="absolute -right-4 top-4 bg-[#1A1D22] border border-[#2B3037] px-3 py-1 rounded-full text-[11px] text-white font-mono font-semibold shadow-md">
                  Depth: 5.9 in
                </div>
              </div>
            </div>

            <p className="mt-8 text-xs text-[#8E95A2] text-center max-w-sm font-normal">
              {dimensions.disclaimer}
            </p>
          </div>

          {/* Dimension Details & Luggage Compatibility */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#121417] border border-[#202328] rounded-3xl p-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#1A1D22] border border-[#2B3037] flex items-center justify-center text-accent">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Exact Measurements
                  </h3>
                  <p className="text-xs text-[#8E95A2]">
                    Verified physical specifications
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm py-2.5 border-b border-[#1E2126]">
                  <span className="text-[#9AA1AD]">Overall Length</span>
                  <span className="font-mono text-white font-bold">15.0 inches (38.1 cm)</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2.5 border-b border-[#1E2126]">
                  <span className="text-[#9AA1AD]">Overall Height</span>
                  <span className="font-mono text-white font-bold">10.2 inches (25.9 cm)</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2.5 border-b border-[#1E2126]">
                  <span className="text-[#9AA1AD]">Depth / Thickness</span>
                  <span className="font-mono text-white font-bold">5.9 inches (15.0 cm)</span>
                </div>
              </div>
            </div>

            {/* Suitcase Compatibility Checklist */}
            <div className="bg-[#121417] border border-[#202328] rounded-3xl p-7 space-y-4">
              <div className="flex items-center gap-2.5">
                <Luggage className="w-4 h-4 text-accent" />
                <h4 className="text-xs uppercase font-bold text-white tracking-widest">
                  Luggage Compatibility
                </h4>
              </div>

              <ul className="space-y-3 text-xs text-[#9AA1AD]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5 stroke-[2.5]" />
                  <span><strong className="text-white">20–22" Carry-On Rollers:</strong> Fits flat across one half of standard clamshell luggage with room for shoes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5 stroke-[2.5]" />
                  <span><strong className="text-white">Weekender Duffel Bags:</strong> Slides easily into bottom laundry compartments.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent stroke-[2.5]" />
                  <span><strong className="text-white">Compression Mode:</strong> Tighten perimeter compression zipper to reduce bulk when packing lighter.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
