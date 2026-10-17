import React from 'react';
import { storeConfig } from '../config/storeConfig';
import { Mail, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { PolicyType } from './PolicyModal';

interface FooterProps {
  onOpenPolicy: (type: PolicyType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy }) => {
  return (
    <footer className="bg-[#E4E9EE] border-t border-[#D6DCE1] text-[#456176] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3898D5]"></span>
              <span className="text-xl font-bold tracking-[0.2em] text-[#14334D] block uppercase">
                {storeConfig.brand.name}
              </span>
            </div>
            <p className="text-xs text-[#5A6E7F] max-w-sm leading-relaxed font-normal">
              {storeConfig.brand.tagline}. Purpose-built travel organizers engineered to bring clarity, care, and calm to packing routines.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#059669] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Encrypted Stripe Commerce Engine Active</span>
            </div>
          </div>

          {/* Quick Navigation - Only active sections */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold text-[#14334D] tracking-widest">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a href="#shop" className="hover:text-[#14334D] transition-colors">
                  Shop The Organizer
                </a>
              </li>
              <li>
                <a href="#benefits-section" className="hover:text-[#14334D] transition-colors">
                  Benefits
                </a>
              </li>
              <li>
                <a href="#capacity-section" className="hover:text-[#14334D] transition-colors">
                  Capacity Estimates
                </a>
              </li>
            </ul>
          </div>

          {/* Store Policies */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold text-[#14334D] tracking-widest">
              Store Policies
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('shipping')}
                  className="hover:text-[#14334D] transition-colors text-left"
                >
                  Shipping Rates & Delivery
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('returns')}
                  className="hover:text-[#14334D] transition-colors text-left"
                >
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('care')}
                  className="hover:text-[#14334D] transition-colors text-left"
                >
                  Care & Fabric Guide
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-[#14334D] transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-[#14334D] transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold text-[#14334D] tracking-widest">
              Concierge Contact
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-[#456176]">
                <Mail className="w-3.5 h-3.5 text-[#3898D5]" />
                <a
                  href={`mailto:${storeConfig.contact.supportEmail}`}
                  className="hover:text-[#14334D] transition-colors"
                >
                  {storeConfig.contact.supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#456176]">
                <Clock className="w-3.5 h-3.5 text-[#3898D5]" />
                <span>{storeConfig.contact.businessHours}</span>
              </div>
              <div className="flex items-center gap-2 text-[#456176]">
                <MapPin className="w-3.5 h-3.5 text-[#3898D5]" />
                <span>{storeConfig.contact.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-[#D6DCE1] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#708496]">
          <p>© {new Date().getFullYear()} {storeConfig.brand.name}. All rights reserved.</p>
          <p>
            Studio Edition • Double Layer Black Organizer
          </p>
        </div>
      </div>
    </footer>
  );
};
