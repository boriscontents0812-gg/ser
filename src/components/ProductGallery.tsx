import React, { useState } from 'react';
import { storeConfig } from '../config/storeConfig';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ProductGallery: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const gallery = storeConfig.product.gallery;
  const currentImage = gallery[selectedIndex] || gallery[0];

  const handlePrevView = () => {
    setSelectedIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleNextView = () => {
    setSelectedIndex((prev) => (prev + 1) % gallery.length);
  };

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4">
      {/* Primary Display Frame - Kree8 tactile white card with multi-layered soft drop shadow */}
      <div className="relative w-full aspect-square border-8 border-white bg-white rounded-[32px] sm:rounded-[36px] overflow-hidden flex items-center justify-center p-3 sm:p-5 transition-all group shadow-tactile">
        {/* Selected Product Image with Smooth Transition & Crisp Detail */}
        <img
          key={currentImage.id}
          src={currentImage.src}
          alt={currentImage.alt}
          fetchPriority={selectedIndex === 0 ? "high" : undefined}
          width={2048}
          height={2048}
          className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105 filter drop-shadow-[0_10px_20px_rgba(20,51,77,0.08)]"
        />

        {/* Left / Right Carousel Navigation Controls */}
        <button
          type="button"
          onClick={handlePrevView}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#14334D] border border-white/80 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all opacity-80 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#3898D5]"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 text-[#304F67]" />
        </button>

        <button
          type="button"
          onClick={handleNextView}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#14334D] border border-white/80 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all opacity-80 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#3898D5]"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 text-[#304F67]" />
        </button>

        {/* Current view indicator pill */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-white/80 rounded-full text-xs text-[#304F67] shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3898D5]"></span>
          <span className="font-semibold text-[#14334D]">{currentImage.label}</span>
        </div>

        {/* Image count pill */}
        <div className="absolute top-4 right-4 z-20 px-2.5 py-1 bg-white/95 backdrop-blur-md border border-white/80 rounded-full text-xs text-[#456176] font-medium shadow-sm">
          {selectedIndex + 1} / {gallery.length}
        </div>
      </div>

      {/* Modern Thumbnail Strip */}
      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {gallery.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border-2 p-1 flex items-center justify-center transition-all focus:outline-none ${
                  isSelected
                    ? 'border-[#14334D] shadow-md ring-2 ring-[#14334D]/20 scale-102'
                    : 'border-white/80 hover:border-[#CBD5E1] opacity-75 hover:opacity-100 shadow-sm'
                }`}
                aria-label={`Select ${img.label}`}
                aria-current={isSelected ? 'true' : 'false'}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  width={200}
                  height={150}
                  className="w-full h-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
